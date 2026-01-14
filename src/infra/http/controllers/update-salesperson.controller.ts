import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  updateSalespersonBodySchema,
  UpdateSalespersonDTO,
} from './dtos/update-salesperson-dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { UpdateSalespersonUseCase } from '@/main/crm/app/cases/update-salesperson';
import { UserPayload } from '@/infra/auth/jwt-strategy';
import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { SalespersonNotFoundError } from '@/main/crm/app/cases/errors/salesperson-not-found-error';
import { SalespersonAlreadyExistsError } from '@/main/crm/app/cases/errors/salesperson-already-exists-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';

@ApiTags('salespersons')
@ApiBearerAuth()
@Controller('salespersons')
@UseGuards(JwtAuthGuard)
export class UpdateSalespersonController {
  constructor(private updateSalesperson: UpdateSalespersonUseCase) {}

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'The salesperson has been successfully updated.',
  })
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(updateSalespersonBodySchema))
  async handle(
    @Body() updateSalespersonDTO: UpdateSalespersonDTO,
    @CurrentUser() user: UserPayload,
    @Param('id') targetSalespersonID: string,
  ) {
    const { name, email, phone, role } = updateSalespersonDTO;

    const result = await this.updateSalesperson.execute({
      executorRole: user.role as SalespersonRole,
      salespersonID: targetSalespersonID,
      name,
      email,
      phone,
      role: role as SalespersonRole | undefined,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case SalespersonNotFoundError:
          throw new NotFoundException(error.message);
        case SalespersonAlreadyExistsError:
          throw new ConflictException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException();
      }
    }
    const { salesperson } = result.value;

    return {
      message: 'Salesperson updated successfully',
      salesperson,
    };
  }
}
