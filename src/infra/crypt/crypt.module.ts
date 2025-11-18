import { Module } from '@nestjs/common';
import { BcryptHasher } from './bcrypt-hasher';
import { HashGenerator } from '@/main/crm/app/cryptography/hash-generator';

@Module({
  providers: [
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [HashGenerator],
})
export class CryptModule {}
