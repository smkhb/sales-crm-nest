import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import z, { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const result = this.schema.safeParse(value);

    if (result.success) {
      return result.data;
    }

    if (result.error instanceof ZodError) {
      console.error('Validation failed \n', z.prettifyError(result.error));

      throw new BadRequestException({
        message: 'validation failed',
        statusCode: 400,
        errors: z.flattenError(result.error),
      });
    }

    throw new BadRequestException('Validation failed');
  }
}
