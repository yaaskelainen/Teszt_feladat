import { User } from '../entities/User';

/**
 * IAuthService Port
 * Interface for authentication, authorization, and security operations.
 */
export interface IAuthService {
  /** Validates user credentials; returns user without password hash if successful */
  validateUser(email: string, pass: string): Promise<User | null>;
  /** Generates access and refresh JWT tokens for a validated user */
  login(user: User): Promise<{ accessToken: string; refreshToken: string }>;
  /** Issues a new access token using a valid refresh token */
  refresh(token: string): Promise<{ accessToken: string }>;
  /** SECURE: Hashes a plain-text password using salt */
  hashPassword(password: string): Promise<string>;
  /** SECURE: Compares a plain-text password with a hash */
  comparePassword(password: string, hash: string): Promise<boolean>;

  // --- Password Reset ---

  /** Triggers the password reset flow; sends a secure token via email if user exists */
  requestPasswordReset(email: string): Promise<void>;
  /** Resets a user's password using a valid reset token from email */
  resetPassword(token: string, newPassword: string): Promise<void>;

  // --- Multi-Factor Authentication (MFA) ---

  /** Generates a TOTP secret and QR code URL for a user to scan */
  enableMFA(userId: string): Promise<{ secret: string; qrCodeUrl: string }>;
  /** Verifies a TOTP code provided by the user and activates MFA upon success */
  verifyMFA(userId: string, token: string): Promise<boolean>;
}
