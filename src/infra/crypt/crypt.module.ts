import { Module } from '@nestjs/common';
import { BcryptHasher } from './bcrypt-hasher';
import { HashGenerator } from '@/main/crm/app/cryptography/hash-generator';
import { HashComparer } from '@/main/crm/app/cryptography/hash-comparer';
import { Encrypter } from '@/main/crm/app/cryptography/encrypter';
import { JwtEncrypter } from './jwt-encrypter';

@Module({
  imports: [],
  providers: [
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
  ],
  exports: [HashGenerator, HashComparer, Encrypter],
})
export class CryptModule {}
