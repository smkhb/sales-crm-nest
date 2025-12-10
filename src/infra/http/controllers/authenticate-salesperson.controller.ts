import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SalespersonNotFoundError } from '@/main/crm/app/cases/errors/salesperson-not-found-error';
import { AuthenticateSalespersonUseCase } from '@/main/crm/app/cases/authenticate-salesperson';
import {
  AuthenticateSalespersonBody,
  authenticateSalespersonBodySchema,
} from './dtos/authenticate-salesperson-dto';
import { WrongCredentialsError } from '@/core/errors/errors/wrong-credentials-error';
import { SalespersonDeactiveError } from '@/main/crm/app/cases/errors/salesperson-deactive-error';

@ApiTags('auth')
@Controller('auth')
export class AuthenticateSalespersonController {
  constructor(private authenticate: AuthenticateSalespersonUseCase) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The salesperson has been successfully authenticate.',
  })
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateSalespersonBodySchema))
  async handle(@Body() body: AuthenticateSalespersonBody) {
    const { email, password } = body;

    const result = await this.authenticate.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new ConflictException(error.message);
        case SalespersonNotFoundError:
          throw new ConflictException(error.message);
        case SalespersonDeactiveError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { accessToken } = result.value;

    return {
      accessToken,
    };
  }
}
