import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { UserPayload } from '@/infra/auth/jwt-strategy';
import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { SalespersonNotFoundError } from '@/main/crm/app/cases/errors/salesperson-not-found-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';
import { UpdateSalespersonPasswordUseCase } from '@/main/crm/app/cases/update-salesperson-password';
import {
  updateSalespersonPasswordBodySchema,
  UpdateSalespersonPasswordDTO,
} from './dtos/update-salesperson-password-dto';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';

@ApiTags('salespersons')
@ApiBearerAuth()
@Controller('salespersons')
@UseGuards(JwtAuthGuard)
export class UpdateSalespersonPasswordController {
  constructor(
    private updateSalespersonPassword: UpdateSalespersonPasswordUseCase,
  ) {}

  @Patch('password/:id')
  @ApiResponse({
    status: 200,
    description: 'Salespersons password has been successfully updated.',
  })
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(updateSalespersonPasswordBodySchema))
  async handle(
    @Body() updateSalespersonPasswordDTO: UpdateSalespersonPasswordDTO,
    @CurrentUser() user: UserPayload,
    @Param('id') targetSalespersonID: string,
  ) {
    const { newPassword } = updateSalespersonPasswordDTO;

    const result = await this.updateSalespersonPassword.execute({
      executorRole: user.role as SalespersonRole,
      salespersonID: targetSalespersonID,
      newPassword,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case SalespersonNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException();
      }
    }

    return {
      message: 'Salesperson password successfully updated',
    };
  }
}
