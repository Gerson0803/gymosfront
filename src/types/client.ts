// Tipos para miembros del gym
export type MembershipType = "basica" | "premium" | "vip" | "estudiante";
export type ClientStatus = "active" | "at-risk" | "inactive";
export type ChurnRiskLevel = "bajo" | "medio" | "alto" | "critico";
export type FitnessGoal = "perder_peso" | "ganar_musculo" | "resistencia" | "salud_general" | "rendimiento";
export type ExperienceLevel = "principiante" | "intermedio" | "avanzado";
export type PreferredSchedule = "manana" | "tarde" | "noche";

export type AttendanceRecord = {
  date: string;
  duration?: number; // minutos
  activities?: string[]; // ['pesas', 'cardio', 'clase']
  note?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: "M" | "F" | "Otro";
  
  // Perfil fitness
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  
  // Membresía
  membershipType: MembershipType;
  joinedAt: string;
  membershipEnd?: string;
  monthlyPrice: number;
  
  // Estado y comportamiento
  status: ClientStatus; // Calculado automáticamente basado en lastCheckIn
  membershipStatus: 'activo' | 'congelado' | 'vencido' | 'cancelado';
  lastCheckIn?: string;
  checkInsLast30Days: number;
  averageCheckInsPerWeek: number;
  preferredSchedule?: PreferredSchedule;
  
  // Risk score
  churnRiskScore: number; // 0-100
  churnRiskLevel: ChurnRiskLevel;
  
  // Metadata
  acquisitionSource?: "instagram" | "google" | "referido" | "calle" | "facebook";
  assignedTrainer?: string;
  notes?: string;
  
  attendance: AttendanceRecord[];
  createdAt: string;
  updatedAt: string;
};

// Leads (prospects)
export type LeadStatus = 
  | "nuevo" 
  | "contactado" 
  | "tour_agendado" 
  | "tour_realizado" 
  | "propuesta" 
  | "negociacion" 
  | "cerrado_ganado" 
  | "cerrado_perdido";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  fitnessGoal: string;
  budget: number;
  source: "instagram" | "google" | "referido" | "walk_in" | "facebook";
  status: LeadStatus;
  assignedAdvisor: string;
  conversionProbability: number; // 0-100
  notes?: string;
  createdAt: string;
};

// Alertas de retención
export type AlertType = 
  | "ausencia_prolongada"
  | "pago_fallido"
  | "bajo_engagement"
  | "queja_reciente"
  | "cumpleanos_proximo"
  | "milestone_alcanzado";

export type AlertSeverity = "informativa" | "accion_requerida" | "critica";
export type AlertStatus = "pendiente" | "en_progreso" | "resuelta";

export type RetentionAlert = {
  id: string;
  clientId: string;
  clientName: string;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
  daysSinceLastVisit?: number;
  recommendedAction: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
};

// Estadísticas
export type ClientStats = {
  total: number;
  active: number;
  atRisk: number;
  inactive: number;
};

export type DashboardMetrics = {
  totalMembers: number;
  activeMembers: number;
  churnRate: number;
  monthlyRevenue: number;
  averageLTV: number;
  occupancyRate: number;
  highRiskMembers: number;
};

// Equipamiento del gym
export type EquipmentCategory = 'cardio' | 'pesas' | 'maquinas' | 'funcional' | 'accesorios';
export type EquipmentStatus = 'operativo' | 'en_mantenimiento' | 'fuera_servicio' | 'nuevo';
export type MaintenanceType = 'preventivo' | 'correctivo' | 'inspeccion';
export type MaintenanceStatus = 'pendiente' | 'en_progreso' | 'completado';

export type MaintenanceRecord = {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  description: string;
  technician?: string;
  cost?: number;
  scheduledDate: string;
  completedDate?: string;
  status: MaintenanceStatus;
  notes?: string;
  createdAt: string;
};

export type Equipment = {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  warrantyEnd?: string;
  price?: number;
  
  // Estado y ubicación
  status: EquipmentStatus;
  location?: string; // 'Zona Cardio', 'Sala de Pesas', etc.
  
  // Uso
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceIntervalDays: number; // cada cuántos días necesita mantenimiento
  totalUsageHours?: number;
  
  // Mantenimientos
  maintenanceHistory: MaintenanceRecord[];
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
