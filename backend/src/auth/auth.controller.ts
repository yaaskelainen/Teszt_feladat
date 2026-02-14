import { Controller, Post, Body, UnauthorizedException, Inject, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Requirement: UT-CTRL-001, UT-CTRL-002, E2E-FULL-01
     * Authenticate user and issue tokens.
     */
    @Post('login')
    async login(@Body() loginDto: any) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    /**
     * Requirement: UT-CTRL-003
     * Refresh access token.
     */
    @Post('refresh')
    async refresh(@Body() refreshDto: any) {
        return this.authService.refresh(refreshDto.refreshToken);
    }

    /**
     * Requirement: UT-CTRL-004 (MFA Verify)
     */
    @Post('mfa/verify')
    async verifyMfa(@Body() body: { userId: string, code: string }) {
        return this.authService.verifyMFA(body.userId, body.code);
    }

    /**
     * Requirement: UT-CTRL-007 (MFA Enable)
     * Starts the MFA enablement process for a logged-in user.
     */
    @Post('mfa/enable')
    @UseGuards(JwtAuthGuard)
    async enableMfa(@Request() req: any) {
        return this.authService.enableMFA(req.user.id);
    }

    /**
     * Requirement: UT-CTRL-005 (Password Reset Request)
     */
    @Post('password-reset-request')
    async requestReset(@Body() body: { email: string }) {
        return this.authService.requestPasswordReset(body.email);
    }

    /**
     * Requirement: UT-CTRL-006 (Reset Password)
     */
    @Post('password-reset')
    async resetPassword(@Body() body: { token: string, newPassword: string }) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
}
