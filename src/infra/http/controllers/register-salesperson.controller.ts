import { RegisterSalespersonUseCase } from '@/main/crm/app/cases/register-salesperson';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  registerSalespersonBodySchema,
  RegisterSalespersonDTO,
} from './dto/register-salesperson';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';

@ApiTags('salesperson')
@Controller('salesperson')
export class RegisterSalespersonController {
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
      throw new BadRequestException();
    }
  }
}
