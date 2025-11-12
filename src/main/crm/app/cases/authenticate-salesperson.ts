import { Either, left, right } from "@/core/either";
import { SalespersonsRepo } from "../repos/salespersons-repo";
import { HashComparer } from "../cryptography/hash-comparer";
import { Encrypter } from "../cryptography/encrypter";
import { WrongCredentialsError } from "@/core/errors/errors/wrong-credentials-error";
import { SalespersonDeactiveError } from "./errors/salesperson-deactive-error";
import { SalespersonNotFoundError } from "./errors/salesperson-not-found-error";

interface AuthenticateSalespersonUseCaseRequest {
  email: string;
  password: string; // Plain text password
}

type AuthenticateSalespersonUseCaseResponse = Either<
  WrongCredentialsError | SalespersonDeactiveError | SalespersonNotFoundError,
  { accessToken: string }
>;

export class AuthenticateSalespersonUseCase {
  constructor(
    private salespersonsRepo: SalespersonsRepo,
    private hashComparer: HashComparer,
    private encrypter: Encrypter
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateSalespersonUseCaseRequest): Promise<AuthenticateSalespersonUseCaseResponse> {
    const salesperson = await this.salespersonsRepo.findByEmail(email);

    if (!salesperson) {
      return left(new SalespersonNotFoundError());
    }

    const doesPasswordMatch = await this.hashComparer.compare(
      password,
      salesperson.passwordHash
    );

    if (!doesPasswordMatch) {
      return left(new WrongCredentialsError());
    }

    if (!salesperson.isActive) {
      return left(new SalespersonDeactiveError());
    }

    const accessToken = await this.encrypter.encrypt({
      sub: salesperson.id.toString(),
      role: salesperson.role,
    });

    return right({ accessToken });
  }
}
