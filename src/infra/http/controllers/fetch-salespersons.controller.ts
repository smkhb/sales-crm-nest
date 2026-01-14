import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard';
import { UserPayload } from '@/infra/auth/jwt-strategy';
import { CurrentUser } from '@/infra/auth/current-user.decorator';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { SalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';
import { FetchSalespersonUseCase } from '@/main/crm/app/cases/fetch-salesperson';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import {
  PageQueryParam,
  pageQueryParamSchema,
} from './dtos/page-query-param-dto';
import { SalespersonPresenter } from './presenter/salesperson-presenter';

@ApiTags('salespersons')
@ApiBearerAuth()
@Controller('salespersons')
@UseGuards(JwtAuthGuard)
export class FetchSalespersonController {
  constructor(private fetchSalespersons: FetchSalespersonUseCase) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'The salespersons have been successfully retrieved.',
  })
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Query('page', new ZodValidationPipe(pageQueryParamSchema))
    page: PageQueryParam,
  ) {
    const result = await this.fetchSalespersons.execute({
      executorRole: user.role as SalespersonRole,
      page,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException();
      }
    }
    const { salespersons } = result.value;

    return {
      message: 'Salespersons have been successfully retrieved',
      salespersons: salespersons.map((salesperson) =>
        SalespersonPresenter.toHTTP(salesperson),
      ),
    };
  }
}
