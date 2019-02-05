import * as jwt from 'jsonwebtoken';
import * as ms from 'ms';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { authConfig } from '../config';
import { Token as TokenEntity } from './tokens.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokensRepository: Repository<TokenEntity>,
  ) {}

  async createToken(userId: string) {
    const user: JwtPayload = { userId };

    const tokenEntity = new TokenEntity();
    tokenEntity.userId = userId;
    const tokenData = await this.tokensRepository.save(tokenEntity);
    const refreshToken = tokenData.id;

    const accessToken = jwt.sign(user, authConfig.secretKey, {
      expiresIn: authConfig.expiresIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    const tokenData = await this.tokensRepository.findOne(refreshToken);
    const invalidError = new Error('Invalid Refresh Token');

    if (!tokenData) {
      throw invalidError;
    }

    const now = new Date().getTime();
    const created = new Date(tokenData.createdAt).getTime();

    if (now - created > ms('60d')) {
      throw invalidError;
    }

    await this.tokensRepository.remove(tokenData);

    return await this.createToken(tokenData.userId);
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    console.log(payload);
    // put some validation logic here
    // for example query user by id/email/username
    return {};
  }
}
