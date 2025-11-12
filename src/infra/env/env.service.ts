import { Injectable } from '@nestjs/common';
import { Env } from './env';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T): Env[T] {
    return this.configService.get<Env[T]>(key, { infer: true }) as Env[T];
  }
}
