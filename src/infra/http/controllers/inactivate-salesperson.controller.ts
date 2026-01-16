import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { UserPayload } from '@/infra/auth/jwt-strategy';
import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { SalespersonNotFoundError } from '@/main/crm/app/cases/errors/salesperson-not-found-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';
import { InactivateSalespersonUseCase } from '@/main/crm/app/cases/inactivate-salesperson';

@ApiTags('salespersons')
@ApiBearerAuth()
@Controller('salespersons')
@UseGuards(JwtAuthGuard)
export class InactivateSalespersonController {
  constructor(private inactivateSalesperson: InactivateSalespersonUseCase) {}

  @Delete(':id')
  @ApiResponse({
    status: 204,
    description: 'The salesperson has been successfully deleted.',
  })
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') targetSalespersonID: string,
  ) {
    const result = await this.inactivateSalesperson.execute({
      executorRole: user.role as SalespersonRole,
      salespersonID: targetSalespersonID,
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
      message: 'Salesperson inactivated successfully',
    };
  }
}
