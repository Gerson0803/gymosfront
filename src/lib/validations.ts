import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido'),
  birthDate: z.string().optional(),
  gender: z.enum(['M', 'F', 'Otro']).optional(),
  goal: z.enum(['perder_peso', 'ganar_musculo', 'resistencia', 'salud_general', 'rendimiento']),
  experienceLevel: z.enum(['principiante', 'intermedio', 'avanzado']),
  membershipType: z.enum(['basica', 'premium', 'vip', 'estudiante']),
  monthlyPrice: z.number().min(0, 'El precio debe ser positivo'),
});

export const leadSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido'),
  fitnessGoal: z.string().min(3, 'Describe el objetivo fitness'),
  budget: z.number().min(0, 'El presupuesto debe ser positivo'),
  source: z.enum(['instagram', 'google', 'referido', 'walk_in', 'facebook']),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
