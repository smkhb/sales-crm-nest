import { Module } from '@nestjs/common';
import { CryptModule } from '../crypt/crypt.module';
import { JwtStrategy } from './jwt-strategy';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [CryptModule, EnvModule],
  providers: [JwtStrategy],
})
export class AuthModule {}
