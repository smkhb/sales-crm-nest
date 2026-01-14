import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
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
import { GetSalespersonByIDUseCase } from '@/main/crm/app/cases/get-salesperson-by-id';

@ApiTags('salespersons')
@ApiBearerAuth()
@Controller('salespersons')
@UseGuards(JwtAuthGuard)
export class GetSalespersonByIDController {
  constructor(private getSalespersonByID: GetSalespersonByIDUseCase) {}

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'The salesperson has been successfully retrieved.',
  })
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') targetSalespersonID: string,
  ) {
    const result = await this.getSalespersonByID.execute({
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
    const { salesperson } = result.value;

    return {
      message: 'Salesperson retrieved successfully',
      salesperson,
    };
  }
}
