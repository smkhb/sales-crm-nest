import { ClientStatus } from '@/main/crm/enterprise/entities/enum/clientStatus';
import z from 'zod';

export const registerClientBodySchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(3, 'Name must be at least 3 characters long'),
  email: z.email({ error: 'Email is required' }),
  phone: z.string({ error: 'Phone is required' }),
  segment: z.string({ error: 'Segment is required' }),
  status: z
    .enum(ClientStatus, {
      error: 'Status must be a valid ClientStatus',
    })
    .optional(),
});

export type RegisterClientDTO = z.infer<typeof registerClientBodySchema>;
