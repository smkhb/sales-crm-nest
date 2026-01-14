import z from 'zod';

export const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

export type PageQueryParam = z.infer<typeof pageQueryParamSchema>;
