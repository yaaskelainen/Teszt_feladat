import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../domain/interfaces/IUserRepository';
import { User } from '../domain/entities/User';
import { AuthService } from '../auth/auth.service';
import type { IAuditService } from '../domain/interfaces/IAuditService';

@Injectable()
export class AdminService {
    constructor(
        @Inject('IUserRepository') private userRepository: IUserRepository,
        private authService: AuthService,
        @Inject('IAuditService') private auditService: IAuditService,
    ) { }

    /**
     * Requirement: UT-ADM-001, UT-ADM-002, E2E-ADMIN-01
     * Provisions a new user with a default password.
     */
    async createUser(email: string, roles: string[]): Promise<{ user: User; temporaryPassword: string }> {
        // UT-ADM-002: Email uniqueness check
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new ConflictException('User already exists');
        }

        // UT-ADM-001: Create with hashed password
        const temporaryPassword = 'Welcome123';
        const hash = await this.authService.hashPassword(temporaryPassword);

        const user = new User('', email, hash, roles);
        const createdUser = await this.userRepository.create(user);

        // Remove password hash from returned object
        const { passwordHash, ...cleanUser } = createdUser as any;

        await this.auditService.log('PROVISION_USER', undefined, { email, roles });

        return {
            user: cleanUser as User,
            temporaryPassword
        };
    }

    /**
     * Requirement: UT-ADM-003, E2E-ADMIN-02
     * Retrieves all users.
     */
    async getAllUsers(): Promise<User[]> {
        const users = await this.userRepository.findAll();
        // Remove sensitive info for each user
        return users.map(user => {
            const { passwordHash, mfaSecret, ...cleanUser } = user as any;
            return cleanUser as User;
        });
    }
}
