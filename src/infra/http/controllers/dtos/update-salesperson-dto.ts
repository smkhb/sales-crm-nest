import { SalespersonRole } from '@/main/crm/enterprise/entities/enum/salespersonRole';
import z from 'zod';

export const updateSalespersonBodySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  email: z.email({ error: 'The new Email must be valid ' }).optional(),
  phone: z.string({ error: 'The new Phone must be a valid' }).optional(),
  role: z
    .enum(SalespersonRole, {
      error: 'Role must be a valid SalespersonRole',
    })
    .optional(),
});
export type UpdateSalespersonDTO = z.infer<typeof updateSalespersonBodySchema>;
