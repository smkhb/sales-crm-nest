import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import z from 'zod';
import { EnvService } from '../env/env.service';
import { Injectable } from '@nestjs/common';

const tokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.string(),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const secret = config.get('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload);
  }
}
