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

// Membership Details Schema
const membershipDetailsSchema = z.object({
  membershipType: z.string().min(1, 'Tipo de membresía requerido'),
  durationMonths: z.number().min(1, 'Duración mínima 1 mes'),
  pricePerPeriod: z.number().min(0, 'El precio debe ser positivo'),
  periodicity: z.enum(['monthly', 'quarterly', 'annual']),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().optional(),
  autoRenewal: z.boolean(),
  includedAccess: z.array(z.string()).min(1, 'Al menos un acceso debe estar incluido'),
  enrollmentFee: z.number().min(0),
});

// Personal Training Details Schema
const personalTrainingDetailsSchema = z.object({
  serviceType: z.enum(['individual', 'group', 'functional']),
  assignedTrainer: z.string().optional(),
  numberOfSessions: z.number().min(1, 'Mínimo 1 sesión'),
  sessionDurationMinutes: z.number().min(15, 'Mínimo 15 minutos por sesión'),
  modality: z.enum(['in-person', 'virtual', 'hybrid']),
  pricePerSession: z.number().min(0),
  packagePrice: z.number().min(0).optional(),
  firstSessionDate: z.string().min(1, 'Fecha de primera sesión requerida'),
  clientObjective: z.string().min(1, 'Objetivo del cliente requerido'),
  initialEvaluationRequired: z.boolean(),
});

// Fitness Product Details Schema
const fitnessProductDetailsSchema = z.object({
  productName: z.string().min(1, 'Nombre del producto requerido'),
  sku: z.string().min(1, 'SKU requerido'),
  category: z.enum(['equipment', 'supplements', 'clothing']),
  quantity: z.number().min(1, 'Cantidad mínima 1'),
  unitPrice: z.number().min(0),
  size: z.string().optional(),
  color: z.string().optional(),
  availableStock: z.number().min(0),
  brand: z.string().min(1, 'Marca requerida'),
});

// Combo Details Schema
const comboDetailsSchema = z.object({
  comboType: z.string().min(1, 'Tipo de combo requerido'),
  components: z.array(z.object({
    type: z.enum(['membership', 'product', 'training']),
    description: z.string().min(1),
    value: z.number().optional(),
  })).min(1, 'Al menos un componente es requerido'),
  normalPrice: z.number().min(0),
  discountedPrice: z.number().min(0),
  discountPercentage: z.number().min(0).max(100),
  isRecurring: z.boolean(),
});

// Discriminated union for productDetails
const productDetailsSchema = z.discriminatedUnion('productType', [
  z.object({ productType: z.literal('membership'), details: membershipDetailsSchema }),
  z.object({ productType: z.literal('personal_training'), details: personalTrainingDetailsSchema }),
  z.object({ productType: z.literal('fitness_product'), details: fitnessProductDetailsSchema }),
  z.object({ productType: z.literal('combo'), details: comboDetailsSchema }),
]);

export const leadSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono inválido'),
  source: z.enum(['instagram', 'google', 'referido', 'walk_in', 'facebook']),
  productType: z.enum(['fitness_product', 'membership', 'personal_training', 'combo']),
  productDetails: z.record(z.string(), z.any()).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type LeadFormData = z.infer<typeof leadSchema>;
export type MembershipDetailsData = z.infer<typeof membershipDetailsSchema>;
export type PersonalTrainingDetailsData = z.infer<typeof personalTrainingDetailsSchema>;
export type FitnessProductDetailsData = z.infer<typeof fitnessProductDetailsSchema>;
export type ComboDetailsData = z.infer<typeof comboDetailsSchema>;
