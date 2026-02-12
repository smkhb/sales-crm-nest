import z from 'zod';

export const updateSalespersonPasswordBodySchema = z.object({
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long'),
});
export type UpdateSalespersonPasswordDTO = z.infer<
  typeof updateSalespersonPasswordBodySchema
>;
