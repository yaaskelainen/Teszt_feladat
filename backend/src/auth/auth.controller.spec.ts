import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../domain/entities/User';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: Partial<AuthService>;

    beforeEach(async () => {
        authService = {
            validateUser: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            verifyMFA: jest.fn(),
            enableMFA: jest.fn(),
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('UT-CTRL-001: Login Success', async () => {
        const user = new User('1', 'test@test.com', 'hash', ['USER']);
        const tokens = { accessToken: 'access', refreshToken: 'refresh' };

        (authService.validateUser as jest.Mock).mockResolvedValue(user);
        (authService.login as jest.Mock).mockResolvedValue(tokens);

        const result = await controller.login({ email: 'test@test.com', password: 'pass' });

        expect(result).toEqual(tokens);
        expect(authService.validateUser).toHaveBeenCalledWith('test@test.com', 'pass');
        expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('UT-CTRL-002: Login Failed', async () => {
        (authService.validateUser as jest.Mock).mockResolvedValue(null);

        await expect(controller.login({ email: 'fail@test.com', password: 'pass' }))
            .rejects.toThrow(UnauthorizedException);
    });

    it('UT-CTRL-003: Refresh Token', async () => {
        const newTokens = { accessToken: 'newAccess' };
        (authService.refresh as jest.Mock).mockResolvedValue(newTokens);

        const result = await controller.refresh({ refreshToken: 'valid' });

        expect(result).toEqual(newTokens);
        expect(authService.refresh).toHaveBeenCalledWith('valid');
    });

    it('UT-CTRL-004: verifyMfa', async () => {
        const tokens = { accessToken: 'access' };
        (authService.verifyMFA as jest.Mock).mockResolvedValue(tokens);

        const result = await controller.verifyMfa({ userId: '1', code: '123456' });

        expect(result).toEqual(tokens);
        expect(authService.verifyMFA).toHaveBeenCalledWith('1', '123456');
    });

    it('UT-CTRL-005: enableMfa', async () => {
        const resultData = { secret: 'SECRET', qrCodeUrl: '' };
        (authService.enableMFA as jest.Mock).mockResolvedValue(resultData);

        const result = await controller.enableMfa({ user: { id: '1' } });

        expect(result).toEqual(resultData);
        expect(authService.enableMFA).toHaveBeenCalledWith('1');
    });

    it('UT-CTRL-006: requestReset', async () => {
        await controller.requestReset({ email: 'test@test.com' });
        expect(authService.requestPasswordReset).toHaveBeenCalledWith('test@test.com');
    });

    it('UT-CTRL-007: resetPassword', async () => {
        await controller.resetPassword({ token: 'tok', newPassword: 'pass' });
        expect(authService.resetPassword).toHaveBeenCalledWith('tok', 'pass');
    });
});
