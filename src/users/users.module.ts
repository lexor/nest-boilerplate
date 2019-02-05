import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './users.entity';

import { UsersService } from './users.service';
import { UsersResolvers } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UsersResolvers],
  exports: [UsersService],
})
export class UsersModule {}
