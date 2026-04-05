import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Client, Lead, RetentionAlert, ClientStatus, ChurnRiskLevel, LeadStatus, Equipment, MaintenanceRecord } from '@/types/client';

// Datos mock realistas
const initialClients: Client[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    email: 'carlos@email.com',
    phone: '+57 300 123 4567',
    birthDate: '1990-05-15',
    gender: 'M',
    goal: 'ganar_musculo',
    experienceLevel: 'intermedio',
    membershipType: 'premium',
    joinedAt: '2024-01-10',
    membershipEnd: '2025-01-10',
    monthlyPrice: 120000,
    membershipStatus: 'activo',
    status: 'active',
    lastCheckIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkInsLast30Days: 12,
    averageCheckInsPerWeek: 3.5,
    preferredSchedule: 'tarde',
    churnRiskScore: 15,
    churnRiskLevel: 'bajo',
    acquisitionSource: 'instagram',
    assignedTrainer: 'Entrenador Juan',
    notes: 'Muy comprometido, objetivo: ganar 5kg de músculo',
    attendance: [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@email.com',
    phone: '+57 301 234 5678',
    birthDate: '1985-08-22',
    gender: 'F',
    goal: 'perder_peso',
    experienceLevel: 'principiante',
    membershipType: 'basica',
    joinedAt: '2024-02-15',
    membershipEnd: '2025-02-15',
    monthlyPrice: 80000,
    membershipStatus: 'activo',
    status: 'at-risk',
    lastCheckIn: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    checkInsLast30Days: 4,
    averageCheckInsPerWeek: 1.2,
    preferredSchedule: 'manana',
    churnRiskScore: 72,
    churnRiskLevel: 'alto',
    acquisitionSource: 'google',
    assignedTrainer: 'Entrenadora Ana',
    notes: 'Ha faltado mucho últimamente. Posible riesgo de abandono.',
    attendance: [],
    createdAt: '2024-02-15T09:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Andrés Martínez',
    email: 'andres@email.com',
    phone: '+57 302 345 6789',
    birthDate: '1995-03-10',
    gender: 'M',
    goal: 'rendimiento',
    experienceLevel: 'avanzado',
    membershipType: 'vip',
    joinedAt: '2023-11-01',
    membershipEnd: '2024-11-01',
    monthlyPrice: 180000,
    membershipStatus: 'vencido',
    status: 'active',
    lastCheckIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    checkInsLast30Days: 18,
    averageCheckInsPerWeek: 5.2,
    preferredSchedule: 'manana',
    churnRiskScore: 8,
    churnRiskLevel: 'bajo',
    acquisitionSource: 'referido',
    assignedTrainer: 'Entrenador Pedro',
    notes: 'Miembro modelo. Entrena 5-6 veces por semana.',
    attendance: [],
    createdAt: '2023-11-01T07:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Laura Sánchez',
    email: 'laura@email.com',
    phone: '+57 303 456 7890',
    birthDate: '1992-11-30',
    gender: 'F',
    goal: 'salud_general',
    experienceLevel: 'principiante',
    membershipType: 'estudiante',
    joinedAt: '2024-03-01',
    membershipEnd: '2024-09-01',
    monthlyPrice: 60000,
    membershipStatus: 'vencido',
    status: 'inactive',
    lastCheckIn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    checkInsLast30Days: 2,
    averageCheckInsPerWeek: 0.5,
    preferredSchedule: 'tarde',
    churnRiskScore: 85,
    churnRiskLevel: 'critico',
    acquisitionSource: 'facebook',
    notes: 'Sin asistencia en 2 semanas. Intentar contactar urgentemente.',
    attendance: [],
    createdAt: '2024-03-01T14:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Diego Fernández',
    email: 'diego@email.com',
    phone: '+57 304 567 8901',
    birthDate: '1988-07-18',
    gender: 'M',
    goal: 'resistencia',
    experienceLevel: 'intermedio',
    membershipType: 'premium',
    joinedAt: '2024-01-20',
    membershipEnd: '2025-01-20',
    monthlyPrice: 120000,
    membershipStatus: 'activo',
    status: 'at-risk',
    lastCheckIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    checkInsLast30Days: 8,
    averageCheckInsPerWeek: 2.1,
    preferredSchedule: 'noche',
    churnRiskScore: 45,
    churnRiskLevel: 'medio',
    acquisitionSource: 'calle',
    assignedTrainer: 'Entrenador Juan',
    notes: 'Frecuencia ha disminuido. Monitorear.',
    attendance: [],
    createdAt: '2024-01-20T18:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

const initialLeads: Lead[] = [
  {
    id: '1',
    name: 'Roberto Gómez',
    email: 'roberto@email.com',
    phone: '+57 305 678 9012',
    fitnessGoal: 'Perder 10kg en 3 meses',
    budget: 100000,
    source: 'instagram',
    status: 'tour_agendado',
    assignedAdvisor: 'Asesor María',
    conversionProbability: 65,
    notes: 'Interesado en plan premium. Tour agendado para mañana 5pm.',
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Patricia Ruiz',
    email: 'patricia@email.com',
    phone: '+57 306 789 0123',
    fitnessGoal: 'Tonificar después del embarazo',
    budget: 80000,
    source: 'referido',
    status: 'propuesta',
    assignedAdvisor: 'Asesor Carlos',
    conversionProbability: 80,
    notes: 'Referida por miembro actual. Muy interesada.',
    createdAt: '2024-03-18T15:00:00Z'
  },
  {
    id: '3',
    name: 'Javier Torres',
    email: 'javier@email.com',
    phone: '+57 307 890 1234',
    fitnessGoal: 'Ganar masa muscular',
    budget: 150000,
    source: 'google',
    status: 'negociacion',
    assignedAdvisor: 'Asesor María',
    conversionProbability: 55,
    notes: 'Comparando con otro gym. Negociando precio.',
    createdAt: '2024-03-15T11:00:00Z'
  }
];

const initialAlerts: RetentionAlert[] = [
  {
    id: '1',
    clientId: '2',
    clientName: 'María López',
    type: 'ausencia_prolongada',
    severity: 'critica',
    description: 'No ha asistido en 9 días. Promedio histórico: 4x/semana',
    daysSinceLastVisit: 9,
    recommendedAction: 'Llamada urgente de su entrenadora Ana. Ofrecer sesión gratuita de re-engagement.',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    clientId: '4',
    clientName: 'Laura Sánchez',
    type: 'ausencia_prolongada',
    severity: 'critica',
    description: 'Sin asistencia en 15 días. Riesgo crítico de abandono.',
    daysSinceLastVisit: 15,
    recommendedAction: 'Intervención inmediata. Llamar hoy. Ofrecer 1 semana gratis + cambio de horario.',
    status: 'pendiente',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    clientId: '5',
    clientName: 'Diego Fernández',
    type: 'bajo_engagement',
    severity: 'accion_requerida',
    description: 'Frecuencia bajó de 4x a 2x por semana en último mes',
    daysSinceLastVisit: 5,
    recommendedAction: 'Invitar a clase grupal nueva de HIIT. Proponer desafío 21 días.',
    status: 'en_progreso',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Cinta de Correr Pro',
    category: 'cardio',
    brand: 'Technogym',
    model: 'Run 500',
    serialNumber: 'TG-2024-001',
    purchaseDate: '2023-06-15',
    warrantyEnd: '2025-06-15',
    price: 8500000,
    status: 'operativo',
    location: 'Zona Cardio',
    lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    maintenanceIntervalDays: 30,
    totalUsageHours: 450,
    maintenanceHistory: [],
    notes: 'Mantenimiento mensual programado',
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Bicicleta Estática',
    category: 'cardio',
    brand: 'Life Fitness',
    model: 'IC7',
    serialNumber: 'LF-2024-002',
    purchaseDate: '2023-08-20',
    warrantyEnd: '2025-08-20',
    price: 4200000,
    status: 'en_mantenimiento',
    location: 'Zona Cardio',
    lastMaintenance: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    maintenanceIntervalDays: 30,
    totalUsageHours: 380,
    maintenanceHistory: [],
    notes: 'Requiere ajuste de resistencia. Fuera de servicio temporalmente.',
    createdAt: '2023-08-20T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Press de Banca',
    category: 'pesas',
    brand: 'Hammer Strength',
    model: 'Plate Loaded',
    serialNumber: 'HS-2024-003',
    purchaseDate: '2023-05-10',
    warrantyEnd: '2025-05-10',
    price: 6800000,
    status: 'operativo',
    location: 'Sala de Pesas',
    lastMaintenance: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    maintenanceIntervalDays: 30,
    totalUsageHours: 520,
    maintenanceHistory: [],
    notes: 'Equipo de alta rotación, revisar semanalmente',
    createdAt: '2023-05-10T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Máquina de Poleas',
    category: 'maquinas',
    brand: 'Cable Crossover',
    model: 'Dual Pulley',
    serialNumber: 'CC-2024-004',
    purchaseDate: '2023-07-01',
    warrantyEnd: '2025-07-01',
    price: 9500000,
    status: 'operativo',
    location: 'Zona Funcional',
    lastMaintenance: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    maintenanceIntervalDays: 30,
    totalUsageHours: 410,
    maintenanceHistory: [],
    notes: 'Verificar cables y poleas',
    createdAt: '2023-07-01T10:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Elíptica',
    category: 'cardio',
    brand: 'Precor',
    model: 'EFX 835',
    serialNumber: 'PC-2024-005',
    purchaseDate: '2023-09-15',
    warrantyEnd: '2025-09-15',
    price: 7200000,
    status: 'fuera_servicio',
    location: 'Zona Cardio',
    lastMaintenance: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    nextMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    maintenanceIntervalDays: 30,
    totalUsageHours: 290,
    maintenanceHistory: [],
    notes: 'Motor dañado. Esperando repuesto. Estimado de reparación: 2 semanas.',
    createdAt: '2023-09-15T10:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

interface GymState {
  clients: Client[];
  leads: Lead[];
  alerts: RetentionAlert[];
  equipment: Equipment[];
  
  // Client actions
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'churnRiskScore' | 'churnRiskLevel' | 'attendance'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  recordCheckIn: (clientId: string, duration?: number, activities?: string[]) => void;
  
  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'conversionProbability'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLead: (leadId: string, newStatus: LeadStatus) => void;
  
  // Alert actions
  addAlert: (alert: Omit<RetentionAlert, 'id' | 'createdAt'>) => void;
  updateAlert: (id: string, alert: Partial<RetentionAlert>) => void;
  resolveAlert: (id: string) => void;
  
  // Equipment actions
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'maintenanceHistory'>) => void;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  scheduleMaintenance: (equipmentId: string, maintenance: Omit<MaintenanceRecord, 'id' | 'equipmentId' | 'createdAt'>) => void;
  completeMaintenance: (equipmentId: string, maintenanceId: string) => void;
  
  // Utilities
  calculateChurnRisk: (client: Client) => { score: number; level: ChurnRiskLevel };
  calculateStatus: (lastCheckIn?: string) => ClientStatus;
}

export const useGymStore = create<GymState>()(
  persist(
    (set, get) => ({
      clients: initialClients,
      leads: initialLeads,
      alerts: initialAlerts,
      equipment: initialEquipment,

      // Client actions
      addClient: (clientData) => {
        const { score, level } = get().calculateChurnRisk(clientData as Client);
        const now = new Date().toISOString();
        const newClient: Client = {
          ...clientData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          churnRiskScore: score,
          churnRiskLevel: level,
          status: get().calculateStatus(),
          checkInsLast30Days: 0,
          averageCheckInsPerWeek: 0,
          attendance: [],
        };
        set((state) => ({ clients: [...state.clients, newClient] }));
      },

      updateClient: (id, clientData) => {
        set((state) => {
          const updatedClients = state.clients.map((c) => {
            if (c.id === id) {
              const updated = { ...c, ...clientData, updatedAt: new Date().toISOString() };
              // Recalcular churn risk si cambiaron factores relevantes
              if (clientData.checkInsLast30Days || clientData.lastCheckIn) {
                const { score, level } = get().calculateChurnRisk(updated);
                updated.churnRiskScore = score;
                updated.churnRiskLevel = level;
              }
              // Recalcular status
              updated.status = get().calculateStatus(updated.lastCheckIn);
              return updated;
            }
            return c;
          });
          return { clients: updatedClients };
        });
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));
      },

      recordCheckIn: (clientId, duration = 60, activities = ['pesas']) => {
        set((state) => {
          const client = state.clients.find((c) => c.id === clientId);
          if (!client) return state;

          const newAttendance = {
            date: new Date().toISOString(),
            duration,
            activities,
          };

          const newCheckIns = client.checkInsLast30Days + 1;
          const newAvgPerWeek = Math.round((newCheckIns / 4.3) * 10) / 10;

          const updatedClients = state.clients.map((c) => {
            if (c.id === clientId) {
              const updated = {
                ...c,
                lastCheckIn: new Date().toISOString(),
                checkInsLast30Days: newCheckIns,
                averageCheckInsPerWeek: newAvgPerWeek,
                attendance: [...c.attendance, newAttendance],
                updatedAt: new Date().toISOString(),
              };
              const { score, level } = get().calculateChurnRisk(updated);
              updated.churnRiskScore = score;
              updated.churnRiskLevel = level;
              updated.status = get().calculateStatus(updated.lastCheckIn);
              return updated;
            }
            return c;
          });

          return { clients: updatedClients };
        });
      },

      // Lead actions
      addLead: (leadData) => {
        let probability = 30; // base
        if (leadData.source === 'referido') probability += 25;
        if (leadData.source === 'instagram') probability += 15;
        if (leadData.budget >= 100000) probability += 10;
        
        const newLead: Lead = {
          ...leadData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          conversionProbability: Math.min(probability, 95),
          status: leadData.status || 'nuevo',
          assignedAdvisor: leadData.assignedAdvisor || 'Sin asignar',
        };
        set((state) => ({ leads: [...state.leads, newLead] }));
      },

      updateLead: (id, leadData) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === id ? { ...l, ...leadData } : l)),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((l) => l.id !== id) }));
      },

      moveLead: (leadId, newStatus) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
        }));
      },

      // Alert actions
      addAlert: (alertData) => {
        const newAlert: RetentionAlert = {
          ...alertData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ alerts: [newAlert, ...state.alerts] }));
      },

      updateAlert: (id, alertData) => {
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === id ? { ...a, ...alertData } : a)),
        }));
      },

      resolveAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) => 
            a.id === id ? { ...a, status: 'resuelta', resolvedAt: new Date().toISOString() } : a
          ),
        }));
      },

      // Calculadora de Churn Risk
      calculateChurnRisk: (client: Client) => {
        let score = 0;

        // Factor 1: Días desde última visita (40% peso)
        if (client.lastCheckIn) {
          const daysSince = Math.floor(
            (Date.now() - new Date(client.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSince > 14) score += 40;
          else if (daysSince > 7) score += 25;
          else if (daysSince > 3) score += 10;
        } else {
          score += 40;
        }

        // Factor 2: Frecuencia vs esperado (30% peso)
        const expectedVisitsPerWeek = client.experienceLevel === 'principiante' ? 2 : 
                                     client.experienceLevel === 'intermedio' ? 3.5 : 4.5;
        const frequencyRatio = client.averageCheckInsPerWeek / expectedVisitsPerWeek;
        
        if (frequencyRatio < 0.3) score += 30;
        else if (frequencyRatio < 0.6) score += 15;
        else if (frequencyRatio < 0.8) score += 5;

        // Factor 3: Membresía próxima a vencer (20% peso)
        if (client.membershipEnd) {
          const daysUntilExpiry = Math.floor(
            (new Date(client.membershipEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysUntilExpiry < 7) score += 20;
          else if (daysUntilExpiry < 30) score += 10;
        }

        // Factor 4: Nivel de experiencia (10% peso)
        if (client.experienceLevel === 'principiante') score += 10;

        let level: ChurnRiskLevel;
        if (score >= 75) level = 'critico';
        else if (score >= 50) level = 'alto';
        else if (score >= 25) level = 'medio';
        else level = 'bajo';

        return { score: Math.min(score, 100), level };
      },

      // Calculadora de Status
      calculateStatus: (lastCheckIn?: string) => {
        if (!lastCheckIn) return 'inactive';
        
        const daysSince = Math.floor(
          (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSince <= 7) return 'active';
        if (daysSince <= 21) return 'at-risk';
        return 'inactive';
      },

      // Equipment actions
      addEquipment: (equipmentData) => {
        const now = new Date().toISOString();
        const newEquipment: Equipment = {
          ...equipmentData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          maintenanceHistory: [],
        };
        set((state) => ({ equipment: [...state.equipment, newEquipment] }));
      },

      updateEquipment: (id, equipmentData) => {
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...equipmentData, updatedAt: new Date().toISOString() } : e
          ),
        }));
      },

      deleteEquipment: (id) => {
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
        }));
      },

      scheduleMaintenance: (equipmentId, maintenanceData) => {
        const newMaintenance: MaintenanceRecord = {
          ...maintenanceData,
          id: uuidv4(),
          equipmentId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          equipment: state.equipment.map((e) => {
            if (e.id === equipmentId) {
              return {
                ...e,
                maintenanceHistory: [...e.maintenanceHistory, newMaintenance],
                nextMaintenance: maintenanceData.scheduledDate,
                updatedAt: new Date().toISOString(),
              };
            }
            return e;
          }),
        }));
      },

      completeMaintenance: (equipmentId, maintenanceId) => {
        set((state) => ({
          equipment: state.equipment.map((e) => {
            if (e.id === equipmentId) {
              const updatedHistory = e.maintenanceHistory.map((m) =>
                m.id === maintenanceId
                  ? { ...m, status: 'completado' as const, completedDate: new Date().toISOString() }
                  : m
              );
              return {
                ...e,
                maintenanceHistory: updatedHistory,
                lastMaintenance: new Date().toISOString(),
                status: 'operativo',
                updatedAt: new Date().toISOString(),
              };
            }
            return e;
          }),
        }));
      },
    }),
    {
      name: 'gymos-storage',
      partialize: (state) => ({
        clients: state.clients,
        leads: state.leads,
        alerts: state.alerts,
        equipment: state.equipment,
      }),
    }
  )
);
