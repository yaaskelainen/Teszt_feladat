import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import type { IUserRepository } from '../domain/interfaces/IUserRepository';
import { AuthService } from '../auth/auth.service';
import { User } from '../domain/entities/User';
import { ConflictException } from '@nestjs/common';

describe('AdminService', () => {
    let service: AdminService;
    let userRepo: Partial<IUserRepository>;
    let authService: Partial<AuthService>;

    beforeEach(async () => {
        userRepo = {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
        };
        authService = {
            hashPassword: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                { provide: 'IUserRepository', useValue: userRepo },
                { provide: AuthService, useValue: authService },
                { provide: 'IAuditService', useValue: { log: jest.fn() } },
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
    });

    it('UT-ADM-001: Create User Success', async () => {
        const mockUser = new User('1', 'new@t.com', 'hashed', ['USER']);
        (userRepo.findByEmail as jest.Mock).mockResolvedValue(null);
        (authService.hashPassword as jest.Mock).mockResolvedValue('hashed');
        (userRepo.create as jest.Mock).mockResolvedValue(mockUser);

        const result = await service.createUser('new@t.com', ['USER']);

        expect(result.user.email).toBe('new@t.com');
        expect(result.user).not.toHaveProperty('passwordHash');
        expect(result.temporaryPassword).toBe('Welcome123');
        expect(userRepo.create).toHaveBeenCalled();
    });

    it('UT-ADM-002: Create User - Duplicate', async () => {
        (userRepo.findByEmail as jest.Mock).mockResolvedValue(new User('1', 'dup@t.com', 'h', []));

        await expect(service.createUser('dup@t.com', ['USER'])).rejects.toThrow(ConflictException);
    });

    it('UT-ADM-003: Get All Users', async () => {
        const mockUsers = [new User('1', 'u@t.com', 'hashed_pass', ['USER'])];
        (userRepo.findAll as jest.Mock).mockResolvedValue(mockUsers);

        const result = await service.getAllUsers();

        expect(result[0].email).toBe('u@t.com');
        expect(result[0]).not.toHaveProperty('passwordHash');
        expect(userRepo.findAll).toHaveBeenCalled();
    });
});
