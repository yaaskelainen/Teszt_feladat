import { Injectable, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/User';
import { PrismaService } from '../prisma.service';

/**
 * PrismaUserRepository Adapter
 * Implementation of IUserRepository using Prisma ORM.
 */
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Resolves a domain user by their primary key.
   * @param id uuid
   */
  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToDomain(user) : null;
  }

  /**
   * Requirement: UT-USER-002 & UT-USER-003
   * Resolves a domain user by their unique email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  /**
   * Requirement: UT-USER-001 & UT-USER-004
   * Maps and persists a User entity to the database.
   * Handles P2002 Unique Constraint violations by throwing ConflictException.
   */
  async create(user: User): Promise<User> {
    try {
      const created = await this.prisma.user.create({
        data: {
          email: user.email,
          passwordHash: user.passwordHash,
          roles: user.roles,
          mfaSecret: user.mfaSecret,
          mfaEnabled: user.mfaEnabled,
          mfaCode: user.mfaCode,
          mfaCodeExpires: user.mfaCodeExpires,
        },
      });
      return this.mapToDomain(created);
    } catch (error) {
      // Prisma error code for unique constraint violation
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  /**
   * Updates an existing user record.
   */
  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        roles: user.roles,
        mfaSecret: user.mfaSecret,
        mfaEnabled: user.mfaEnabled,
        mfaCode: user.mfaCode,
        mfaCodeExpires: user.mfaCodeExpires,
      },
    });
    return this.mapToDomain(updated);
  }

  /**
   * Removes a user record.
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  /**
   * Retrieves all user records.
   */
  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.mapToDomain(u));
  }

  /**
   * Mapping bridge between Prisma POJO and Domain Entity.
   */
  private mapToDomain(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.roles,
      prismaUser.mfaSecret,
      prismaUser.mfaEnabled,
      prismaUser.mfaCode,
      prismaUser.mfaCodeExpires,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}
