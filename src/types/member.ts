// Types for gym members (used with backend API)

export type MembershipType = "basica" | "premium" | "vip" | "estudiante";
export type MemberStatus = "active" | "at-risk" | "inactive";
export type ChurnRiskLevel = "bajo" | "medio" | "alto" | "critico";
export type FitnessGoal =
  | "perder_peso"
  | "ganar_musculo"
  | "resistencia"
  | "salud_general"
  | "rendimiento";
export type ExperienceLevel = "principiante" | "intermedio" | "avanzado";
export type PreferredSchedule = "manana" | "tarde" | "noche";

export type AttendanceRecord = {
  date: string;
  duration?: number; // minutos
  activities?: string[]; // ['pesas', 'cardio', 'clase']
  note?: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: "M" | "F" | "Otro";

  // Fitness profile
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;

  // Membership
  membershipType: MembershipType;
  joinedAt: string;
  membershipEnd?: string;
  monthlyPrice: number;

  // Status and behavior
  status: MemberStatus; // Automatically calculated based on lastCheckIn
  membershipStatus: "activo" | "congelado" | "vencido" | "cancelado";
  lastCheckIn?: string;
  checkInsLast30Days: number;
  averageCheckInsPerWeek: number;
  preferredSchedule?: PreferredSchedule;

  // Risk score
  churnRiskScore: number; // 0-100
  churnRiskLevel: ChurnRiskLevel;

  // Metadata
  acquisitionSource?:
    | "instagram"
    | "google"
    | "referido"
    | "calle"
    | "facebook";
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
