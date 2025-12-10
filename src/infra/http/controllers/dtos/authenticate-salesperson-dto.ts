import z from 'zod';

export const authenticateSalespersonBodySchema = z.object({
  email: z.email({ error: 'Email is required' }),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
});

export type AuthenticateSalespersonBody = z.infer<
  typeof authenticateSalespersonBodySchema
>;
