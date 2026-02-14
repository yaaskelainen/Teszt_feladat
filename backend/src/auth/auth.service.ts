import {
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthService } from '../domain/interfaces/IAuthService';
import type { IUserRepository } from '../domain/interfaces/IUserRepository';
import type { IEmailService } from '../domain/interfaces/IEmailService';
import { User } from '../domain/entities/User';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

/**
 * AuthService Implementation
 * Handles authentication logic, token management, password security, and MFA.
 */
import type { IAuditService } from '../domain/interfaces/IAuditService';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('IUserRepository') private usersRepository: IUserRepository,
    @Inject('IEmailService') private emailService: IEmailService,
    @Inject('IAuditService') private auditService: IAuditService,
    private jwtService: JwtService,
  ) { }

  /**
   * Validates user credentials.
   * Includes DoS protection by limiting password length.
   * Returns a User object without the sensitive passwordHash if successful.
   */
  async validateUser(email: string, pass: string): Promise<User | null> {
    // UT-AUTH-008: Reject extremely long passwords early
    if (pass.length > 10000) {
      throw new BadRequestException('Password too long');
    }

    const user = await this.usersRepository.findByEmail(email);

    // UT-AUTH-001/002/003: Check user existence and password match
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result as User;
    }
    return null;
  }

  /**
   * Generates a pair of JWT tokens (Access and Refresh) for a user session.
   * Access Token: Short-lived (15m) for active use.
   * Refresh Token: Long-lived (7d) for session persistence.
   */
  async login(
    user: User,
  ): Promise<any> {
    if (user.mfaEnabled) {
      await this.requestMfaCode(user.id);
      return { mfaRequired: true, userId: user.id };
    }

    // UT-AUTH-005: Payload includes sub (userId) and roles
    const payload = { sub: user.id, roles: user.roles || [] };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.auditService.log('LOGIN', user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async requestMfaCode(userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.usersRepository.update({
      ...user,
      mfaCode: code,
      mfaCodeExpires: expires,
    });

    await this.emailService.send(
      user.email,
      'Your Verification Code',
      `Your verification code is: ${code}. It expires in 5 minutes.`
    );
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * Ensures the user still exists in the system.
   */
  async refresh(token: string): Promise<{ accessToken: string }> {
    try {
      // UT-AUTH-007: Throws if token is tampered/invalid
      const payload = this.jwtService.verify(token);
      const user = await this.usersRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // UT-AUTH-006: Issue new access token
      const newPayload = { sub: user.id, roles: user.roles || [] };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Securely hashes a password using bcrypt.
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain password with its hashed version.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // --- Password Reset Implementation ---

  /**
   * Initiates password reset by generating a secure token and emailing the user.
   * Fails silently if user is not found to prevent user enumeration.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return;

    // UT-AUTH-009: Generate token and call EmailService
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' },
      { expiresIn: '1h' },
    );
    await this.auditService.log('REQUEST_PASSWORD_RESET', user.id);
    await this.emailService.send(
      email,
      'Password Reset',
      `Click here to reset your password: ${process.env.FRONTEND_URL || 'http://localhost:3011'}/password/reset?token=${resetToken}`
    );
  }

  /**
   * Verifies a reset token and updates the user's password.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset') throw new Error();

      const user = await this.usersRepository.findById(payload.sub);
      if (!user) throw new NotFoundException();

      // Enforce minimum password length (matching login requirement)
      if (newPassword.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      // UT-AUTH-010: Update password hash
      const newHash = await this.hashPassword(newPassword);
      await this.usersRepository.update({ ...user, passwordHash: newHash });
      await this.auditService.log('RESET_PASSWORD', user.id);
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof NotFoundException) {
        throw e;
      }
      throw new UnauthorizedException();
    }
  }

  // --- Multi-Factor Authentication (MFA) Implementation ---

  /**
   * Starts the MFA setup process by generating a secret and QR code.
   */
  async enableMFA(
    userId: string,
  ): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException();

    // Generate a code and send it to verify before enabling
    await this.requestMfaCode(userId);

    return { secret: 'EMAIL_MFA', qrCodeUrl: '' };
  }

  /**
   * Verifies a TOTP token and fully enables MFA for the user.
   */
  async verifyMFA(userId: string, token: string): Promise<any> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException();

    if (user.mfaCode === token && user.mfaCodeExpires && user.mfaCodeExpires > new Date()) {
      // Code valid
      await this.usersRepository.update({
        ...user,
        mfaEnabled: true,
        mfaCode: undefined,
        mfaCodeExpires: undefined
      });

      await this.auditService.log('VERIFY_MFA_SUCCESS', user.id);
      return this.login({ ...user, mfaEnabled: false }); // Generate tokens (pass mfaEnabled: false to skip recursive call)
    }

    await this.auditService.log('VERIFY_MFA_FAILED', user.id);
    throw new UnauthorizedException('Invalid or expired code');
  }
}
