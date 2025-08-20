import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: `${configService.get('RT_SECRET')}`,
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const authHeader = req.headers?.authorization;
    const refreshToken = authHeader?.replace('Bearer', '').trim();

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token is not provided');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
