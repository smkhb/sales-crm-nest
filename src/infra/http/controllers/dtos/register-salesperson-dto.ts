import { SalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';
import z from 'zod';

export const registerSalespersonBodySchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(3, 'Name must be at least 3 characters long'),
  email: z.email({ error: 'Email is required' }),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
  phone: z.string({ error: 'Phone is required' }),
  role: z
    .enum(SalespersonRole, {
      error: 'Role must be a valid SalespersonRole',
    })
    .optional(),
});
export type RegisterSalespersonDTO = z.infer<
  typeof registerSalespersonBodySchema
>;
