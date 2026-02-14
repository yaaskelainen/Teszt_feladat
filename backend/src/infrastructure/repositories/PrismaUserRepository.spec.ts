jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    user = {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    $connect = jest.fn();
    $disconnect = jest.fn();
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './PrismaUserRepository';
import { PrismaService } from '../prisma.service';
import { User } from '../../domain/entities/User';
import { ConflictException } from '@nestjs/common';

/**
 * Mock Prisma Service for tests.
 * Since Prisma Client might not be generated in certain environments,
 * we mock the Service entirely to decouple from the filesystem/DB.
 */
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    jest.clearAllMocks();
  });

  /**
   * Requirement: UT-USER-001 & UT-USER-004
   * Persistence tests for creating new records and handling collisions.
   */
  describe('create', () => {
    /** Case UT-USER-001: Success path with valid entity mapping */
    it('UT-USER-001: Create User Success', async () => {
      const userDto = new User('1', 'test@test.com', 'hash', ['USER']);
      const prismaUser = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hash',
        roles: ['USER'],
        mfaSecret: null,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(prismaUser);

      const result = await repository.create(userDto);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('1');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@test.com',
          passwordHash: 'hash',
          roles: ['USER'],
          mfaSecret: undefined,
          mfaEnabled: false,
        },
      });
    });

    /** Case UT-USER-004: Duplicate entry detection via Prisma error codes */
    it('UT-USER-004: Create User - Duplicate', async () => {
      const userDto = new User('1', 'test@test.com', 'hash', ['USER']);
      mockPrismaService.user.create.mockRejectedValue({
        code: 'P2002', // Prisma unique constraint error code
      } as any);

      await expect(repository.create(userDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  /**
   * Requirement: UT-USER-002 & UT-USER-003
   * Lookup tests for user retrieval by email.
   */
  describe('findByEmail', () => {
    /** Case UT-USER-002: Retrieval of existing record */
    it('UT-USER-002: Find By Email - Exists', async () => {
      const prismaUser = {
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hash',
        roles: ['USER'],
        mfaSecret: null,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.findByEmail('test@test.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@test.com');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    /** Case UT-USER-003: Graceful handling of non-existent emails */
    it('UT-USER-003: Find By Email - Missing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('missing@test.com');

      expect(result).toBeNull();
    });
  });
});
