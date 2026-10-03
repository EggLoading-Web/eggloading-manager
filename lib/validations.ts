import { z } from 'zod'

export const clienteSchema = z.object({
  name: z
    .string()
    .min(1, 'errRequired')
    .max(100, 'errTooLong')
    .trim(),
  email: z
    .string()
    .email('errEmail')
    .or(z.literal(''))
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(30, 'errTooLong')
    .optional()
    .nullable(),
})

export const proyectoSchema = z.object({
  name: z
    .string()
    .min(1, 'errRequired')
    .max(100, 'errTooLong')
    .trim(),
  stack: z
    .string()
    .max(100, 'errTooLong')
    .optional()
    .nullable(),
  status: z.enum(['pendiente', 'en progreso', 'entregado']),
  client_id: z.string().min(1, 'errClientRequired'),
})

export const notaSchema = z.object({
  content: z
    .string()
    .min(1, 'errNoteRequired')
    .max(500, 'errTooLong')
    .trim(),
})

export type ClienteInput = z.infer<typeof clienteSchema>
export type ProyectoInput = z.infer<typeof proyectoSchema>
export type NotaInput = z.infer<typeof notaSchema>