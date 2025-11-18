import z from 'zod';

export const registerSalespersonBodySchema = z
  .object({
    executorID: z.uuid(),

    name: z.string(),
    email: z.email(),
    password: z.string().min(6),
    phone: z.string(),
  })
  .required();

export type RegisterSalespersonDTO = z.infer<
  typeof registerSalespersonBodySchema
>;
