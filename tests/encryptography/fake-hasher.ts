import { HashComparer } from "@/main/crm/app/cryptography/hash-comparer";
import { HashGenerator } from "@/main/crm/app/cryptography/hash-generator";

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return `${plain}-hashed`;
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return hashed === `${plain}-hashed`;
  }
}
