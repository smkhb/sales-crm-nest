import z from 'zod';

export const registerSalespersonBodySchema = z
  .object({
    executorID: z.uuid({ error: 'executorID must be a valid UUID' }),

    name: z
      .string({ error: 'Name is required' })
      .min(3, 'Name must be at least 3 characters long'),
    email: z.email({ error: 'Email is required' }),
    password: z
      .string({ error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters long'),
    phone: z.string({ error: 'Phone is required' }),
  })
  .required();

export type RegisterSalespersonDTO = z.infer<
  typeof registerSalespersonBodySchema
>;
