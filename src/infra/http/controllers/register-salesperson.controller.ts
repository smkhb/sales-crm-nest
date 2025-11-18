import { RegisterSalespersonUseCase } from '@/main/crm/app/cases/register-salesperson';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  registerSalespersonBodySchema,
  RegisterSalespersonDTO,
} from './dtos/register-salesperson-dto';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { SalespersonPresenter } from './presenter/salesperson-presenter';

@ApiTags('salesperson')
@Controller('salesperson')
export class RegisterSalespersonController {
  private logger = new Logger(RegisterSalespersonController.name);
  constructor(private registerSalesperson: RegisterSalespersonUseCase) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'The salesperson has been successfully registered.',
  })
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(registerSalespersonBodySchema))
  async handle(@Body() body: RegisterSalespersonDTO) {
    const { executorID, name, email, password, phone } = body;

    const result = await this.registerSalesperson.execute({
      executorID,
      name,
      email,
      password,
      phone,
    });

    if (result.isLeft()) {
      this.logger.warn(
        `Failed to register salesperson: ${result.value.message}`,
      );

      throw new BadRequestException();
    }

    const { salesperson } = result.value;

    return {
      message: 'Salesperson registered successfully.',
      salesperson: SalespersonPresenter.toHTTP(salesperson),
    };
  }
}
