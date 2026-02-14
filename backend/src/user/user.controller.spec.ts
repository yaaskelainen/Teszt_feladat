import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { User } from '../domain/entities/User';

describe('UserController', () => {
    let controller: UserController;
    let mockUserRepository: any;

    beforeEach(async () => {
        mockUserRepository = {
            findById: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: 'IUserRepository',
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    describe('getMe', () => {
        it('should return the current user profile', async () => {
            const user = new User('user-123', 'test@example.com', 'hash', ['USER']);
            mockUserRepository.findById.mockResolvedValue(user);

            const req = { user: { id: 'user-123' } };
            const result = await controller.getMe(req);

            expect(result.email).toBe('test@example.com');
            expect(result).not.toHaveProperty('passwordHash');
            expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
        });
    });

    describe('deleteMe', () => {
        it('should delete the current user account', async () => {
            mockUserRepository.delete.mockResolvedValue(undefined);

            const req = { user: { id: 'user-123' } };
            await controller.deleteMe(req);

            expect(mockUserRepository.delete).toHaveBeenCalledWith('user-123');
        });
    });
});
