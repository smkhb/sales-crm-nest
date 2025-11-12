import { Encrypter } from '@/main/crm/app/cryptography/encrypter';

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return `token-${payload.sub}-${payload.role}`;
  }
}
