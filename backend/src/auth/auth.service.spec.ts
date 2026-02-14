import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import type { IUserRepository } from '../domain/interfaces/IUserRepository';
import type { IEmailService } from '../domain/interfaces/IEmailService';
import { User } from '../domain/entities/User';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

// Mock Dependencies
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(),
    keyuri: jest.fn(),
    check: jest.fn(),
  },
}));

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mock.jwt.token'),
  verify: jest.fn(),
  decode: jest.fn(),
};

const mockEmailService = {
  send: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    /**
     * Initialize the testing module with mocked dependencies.
     * We provide mocks for IUserRepository, IEmailService, and JwtService.
     */
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: 'IEmailService', useValue: mockEmailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: 'IAuditService', useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // Clear mocks between tests to ensure test isolation
    jest.clearAllMocks();
  });

  /**
   * Requirement: User Validation
   * Tests for verifying user identity via email and password.
   */
  describe('validateUser', () => {
    /** Case UT-AUTH-001: Success scenario with matching password */
    it('UT-AUTH-001: Validate User Success', async () => {
      const mockUser = new User('1', 'test@test.com', 'hashedPass', ['USER']);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'pass');
      const { passwordHash, ...expectedUser } = mockUser;
      // Should return user WITHOUT the password hash
      expect(result).toEqual(expectedUser);
    });

    /** Case UT-AUTH-002: Failure scenario with incorrect password */
    it('UT-AUTH-002: Validate User - Wrong Password', async () => {
      const mockUser = new User('1', 'test@test.com', 'hashedPass', ['USER']);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@test.com', 'wrongpass');
      expect(result).toBeNull();
    });

    /** Case UT-AUTH-003: Failure scenario when user doesn't exist */
    it('UT-AUTH-003: Validate User - User Not Found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('ghost@test.com', 'pass');
      expect(result).toBeNull();
    });
  });

  /**
   * Requirement: Secure Login & Token Generation
   * Tests for issuing JWT tokens upon successful authentication.
   */
  describe('login', () => {
    /** Case UT-AUTH-004: Generation of two distinct tokens */
    it('UT-AUTH-004: Login - Generate Tokens', async () => {
      const mockUser = new User('1', 'test@test.com', 'hash', ['USER']);
      const result = await service.login(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      // JwtService.sign should be called twice (Access + Refresh)
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    /** Case UT-AUTH-005: Validation of JWT payload content */
    it('UT-AUTH-005: Login - Payload Structure', async () => {
      const mockUser = new User('1', 'test@test.com', 'hash', ['ADMIN']);
      await service.login(mockUser);

      // Access token must contain sub (ID) and roles
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: '1', roles: ['ADMIN'] }),
        expect.any(Object),
      );
    });
  });

  /**
   * Requirement: Token Refresh Rotation
   * Tests for issuing new access tokens via long-lived refresh tokens.
   */
  describe('refresh', () => {
    /** Case UT-AUTH-006: Success scenario with valid token */
    it('UT-AUTH-006: Refresh Token - Success', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1' });
      mockUserRepository.findById.mockResolvedValue(
        new User('1', 'test@test.com', 'hash', ['USER']),
      );

      const result = await service.refresh('valid.token');
      expect(result).toHaveProperty('accessToken');
    });

    /** Case UT-AUTH-007: Failure scenario with tampered token */
    it('UT-AUTH-007: Refresh Token - Tampered', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });
      await expect(service.refresh('bad.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  /**
   * Requirement: DoS Protection
   * Tests for system resilience against oversized payloads.
   */
  describe('Security Edge Cases', () => {
    /** Case UT-AUTH-008: Rejection of extremely long passwords (DoS prevention) */
    it('UT-AUTH-008: Extremely Long Password', async () => {
      const longPass = 'a'.repeat(10001);
      // System should reject passwords > 10k chars
      await expect(
        service.validateUser('test@test.com', longPass),
      ).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * Requirement: Password Reset Flow
   * Tests for requesting reset link and updating password via token.
   */
  describe('Password Reset', () => {
    /** Case UT-AUTH-009: Successful reset request and email dispatch */
    it('UT-AUTH-009: Password Reset - Request', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(
        new User('1', 'test@test.com', 'hash', ['USER']),
      );

      await service.requestPasswordReset('test@test.com');

      expect(mockJwtService.sign).toHaveBeenCalled(); // Should generate a reset token
      expect(mockEmailService.send).toHaveBeenCalledWith(
        'test@test.com',
        expect.stringContaining('Reset'),
        expect.any(String),
      );
    });

    /** Case UT-AUTH-010: Finalizing password update with valid token */
    it('UT-AUTH-010: Password Reset - Confirm', async () => {
      const mockUser = new User('1', 'test@test.com', 'oldHash', ['USER']);
      mockJwtService.verify.mockReturnValue({ sub: '1', type: 'reset' });
      mockUserRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

      await service.resetPassword('valid.reset.token', 'newPass123');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'newHash' }),
      );
    });

    /** Case UT-AUTH-013: Rejection of short passwords during reset */
    it('UT-AUTH-013: Password Reset - Reject Short Password', async () => {
      mockJwtService.verify.mockReturnValue({ sub: '1', type: 'reset' });
      mockUserRepository.findById.mockResolvedValue(new User('1', 't@t.com', 'h', ['USER']));
      await expect(service.resetPassword('valid.token', 'short')).rejects.toThrow(BadRequestException);
    });
  });

  /**
   * Requirement: Multi-Factor Authentication (Bonus)
   * Tests for enabling and verifying MFA.
   */
  describe('MFA', () => {
    /** Case UT-AUTH-011: Setup phase (Generate code via Email) */
    it('UT-AUTH-011: MFA Setup', async () => {
      mockUserRepository.findById.mockResolvedValue(
        new User('1', 't@t.com', 'h', ['USER']),
      );

      const result = await service.enableMFA('1');

      expect(result).toEqual({ secret: 'EMAIL_MFA', qrCodeUrl: '' });
      // Should generate code and send email
      expect(mockEmailService.send).toHaveBeenCalledWith(
        't@t.com',
        'Your Verification Code',
        expect.stringContaining('Your verification code is'),
      );
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    /** Case UT-AUTH-012: Verification phase (Enabling MFA flag) */
    it('UT-AUTH-012: MFA Verify', async () => {
      // User with valid code and not expired
      const futureDate = new Date(Date.now() + 10000);
      const mockUser = new User('1', 't@t.com', 'h', ['USER'], undefined, false, '123456', futureDate);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Successfully resolving login returns tokens
      const result = await service.verifyMFA('1', '123456');

      expect(result).toHaveProperty('accessToken');

      // User entity mfaEnabled flag should be set to true
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ mfaEnabled: true, mfaCode: undefined }),
      );
    });
  });
});
