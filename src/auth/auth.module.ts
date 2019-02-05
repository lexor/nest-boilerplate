import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthResolvers } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { Token } from './tokens.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Token]), forwardRef(() => UsersModule)],
  providers: [AuthService, AuthResolvers],
})
export class AuthModule {}
