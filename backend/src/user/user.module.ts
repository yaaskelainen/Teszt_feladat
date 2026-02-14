import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    controllers: [UserController],
})
export class UserModule { }
