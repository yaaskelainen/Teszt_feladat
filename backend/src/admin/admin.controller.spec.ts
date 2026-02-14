import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../domain/entities/User';

describe('AdminController', () => {
    let controller: AdminController;
    let adminService: Partial<AdminService>;

    beforeEach(async () => {
        adminService = {
            createUser: jest.fn(),
            getAllUsers: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AdminController],
            providers: [{ provide: AdminService, useValue: adminService }],
        }).compile();

        controller = module.get<AdminController>(AdminController);
    });

    it('UT-ADCTRL-001: Provision User', async () => {
        const mockResponse = { user: new User('1', 'admin@t.com', 'h', ['USER']), temporaryPassword: 'Welcome123' };
        (adminService.createUser as jest.Mock).mockResolvedValue(mockResponse);

        const result = await controller.createUser({ email: 'admin@t.com', roles: ['USER'] });

        expect(result).toEqual(mockResponse);
        expect(adminService.createUser).toHaveBeenCalledWith('admin@t.com', ['USER']);
    });

    it('UT-ADCTRL-002: Get All Users', async () => {
        const mockUsers = [new User('1', 'u@t.com', 'h', ['USER'])];
        (adminService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

        const result = await controller.getAllUsers();

        expect(result).toEqual(mockUsers);
        expect(adminService.getAllUsers).toHaveBeenCalled();
    });
});
