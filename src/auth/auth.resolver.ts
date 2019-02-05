import { Inject, forwardRef } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Resolver('Auth')
export class AuthResolvers {
  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Query()
  async login(obj, args) {
    const user = await this.usersService.findOne({
      where: { email: args.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword: boolean = await this.usersService.validatePassword(
      args.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return new Error('Password invalid');
    }

    return await this.authService.createToken(user.id);
  }

  @Query()
  async refresh(obj, args) {
    return await this.authService.refreshToken(args.refreshToken);
  }
}
