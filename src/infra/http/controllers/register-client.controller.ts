import { RegisterClientUseCase } from '@/main/crm/app/cases/register-client';
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
import { ClientAlreadyExistsError } from '@/main/crm/app/cases/errors/client-already-exists-error';
import { SalespersonNotFoundError } from '@/main/crm/app/cases/errors/salesperson-not-found-error';
import {
  RegisterClientBody,
  registerClientBodySchema,
} from './dtos/register-client-dto';
import { ClientPresenter } from './presenter/client-presenter';

@ApiTags('client')
@Controller('client')
export class RegisterClientController {
  constructor(private registerClient: RegisterClientUseCase) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The client has been successfully registered.',
  })
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerClientBodySchema))
  async handle(@Body() body: RegisterClientBody) {
    const { executorID, name, email, phone, segment, salesRepID } = body;

    const result = await this.registerClient.execute({
      executorID,
      name,
      email,
      phone,
      segment,
      salesRepID,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ClientAlreadyExistsError:
          throw new ConflictException(error.message);
        case SalespersonNotFoundError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    const { client } = result.value;

    return {
      message: 'Client registered successfully.',
      client: ClientPresenter.toHTTP(client),
    };
  }
}
