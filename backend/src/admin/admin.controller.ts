import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * Requirement: UT-ADCTRL-001, E2E-ADMIN-01
     * Provisions a new user via Admin Dashboard.
     */
    @Post('users')
    async createUser(@Body() body: { email: string; roles: string[] }) {
        return await this.adminService.createUser(body.email, body.roles);
    }

    /**
     * Requirement: UT-ADCTRL-002, E2E-ADMIN-02
     * Returns a list of all users.
     */
    @Get('users')
    async getAllUsers() {
        return await this.adminService.getAllUsers();
    }
}
