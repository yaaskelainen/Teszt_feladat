import { Controller, Get, Delete, Request, UseGuards, Inject, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { IUserRepository } from '../domain/interfaces/IUserRepository';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) { }

    /**
     * Requirement: UT-USER-001
     * Returns the currently authenticated user's profile.
     */
    @Get('me')
    async getMe(@Request() req: any) {
        const user = await this.userRepository.findById(req.user.id);
        if (user) {
            const { passwordHash, ...cleanUser } = user as any;
            return cleanUser;
        }
        return null;
    }

    /**
     * Requirement: E2E-CHAOS-05
     * Allows user to delete their own account.
     */
    @Delete('me')
    @HttpCode(204)
    async deleteMe(@Request() req: any) {
        await this.userRepository.delete(req.user.id);
    }
}
