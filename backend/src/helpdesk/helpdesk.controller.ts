import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { HelpDeskService } from './helpdesk.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SendMessageDto } from './dto/send-message.dto';
import { UserThrottlerGuard } from '../auth/user-throttler.guard';

@Controller('helpdesk')
@UseGuards(JwtAuthGuard, UserThrottlerGuard)
export class HelpDeskController {
    constructor(private readonly helpDeskService: HelpDeskService) { }

    /**
     * Requirement: UT-HCTRL-001, E2E-AGENT-01
     */
    @Post('chat')
    async sendMessage(@Request() req: any, @Body() body: SendMessageDto) {
        return await this.helpDeskService.sendMessage(req.user.id, body.content);
    }

    /**
     * Requirement: UT-HCTRL-002, E2E-AGENT-02
     */
    @Get('queue')
    @UseGuards(RolesGuard)
    @Roles('AGENT', 'ADMIN')
    async getQueue() {
        return await this.helpDeskService.getQueue();
    }

    /**
     * Requirement: UT-HCTRL-003, E2E-AGENT-03
     */
    @Post('reply')
    @UseGuards(RolesGuard)
    @Roles('AGENT', 'ADMIN')
    async reply(@Request() req: any, @Body() body: { userId: string, content: string }) {
        return await this.helpDeskService.replyToUser(req.user.id, body.userId, body.content);
    }

    /**
     * Requirement: UT-HCTRL-004, E2E-AGENT-04
     */
    @Get('history')
    async getHistory(@Request() req: any) {
        return await this.helpDeskService.getHistory(req.user.id);
    }

    /**
     * Requirement: UT-HCTRL-005 (Agent history view)
     */
    @Get('history/:chatId')
    @UseGuards(RolesGuard)
    @Roles('AGENT', 'ADMIN')
    async getHistoryByChatId(@Param('chatId') chatId: string) {
        return await this.helpDeskService.getHistory(chatId);
    }

    /**
     * Requirement: UT-HCTRL-006 (Resolve Chat)
     */
    @Post('resolve')
    @UseGuards(RolesGuard)
    @Roles('AGENT', 'ADMIN')
    async resolveChat(@Body() body: { chatId: string }) {
        return await this.helpDeskService.resolveChat(body.chatId);
    }
}
