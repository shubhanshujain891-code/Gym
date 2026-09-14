export type UserRole = 'super_admin' | 'gym_owner' | 'staff' | 'trainer' | 'member';
export type MembershipStatus = 'active' | 'expiring_soon' | 'expired' | 'paused' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
export type GymPlanTier = 'starter' | 'growth' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gymId?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface GymSettings {
  name: string;
  tagline?: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  receiptPrefix: string;
  memberIdPrefix: string;
  expiringSoonDays: number;
  duplicateAttendanceMinutes: number;
  enableQrAttendance: boolean;
  theme?: 'light' | 'dark';
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  ownerId?: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'suspended' | 'trial';
  planTier: GymPlanTier;
  isOnboarded?: boolean;
  settings: GymSettings;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  price: number;
  admissionFee?: number;
  description?: string;
  popular?: boolean;
  isActive: boolean;
  features?: string[];
  createdAt: string;
}

export interface Trainer {
  id: string;
  gymId: string;
  name: string;
  phone: string;
  email?: string;
  specialization: string;
  experienceYears?: number;
  shift: 'morning' | 'evening' | 'full_day';
  rating?: number;
  status: 'active' | 'inactive';
  photo?: string;
  avatarUrl?: string;
  activeClientsCount?: number;
  joiningDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  gymId: string;
  memberCode: string;
  qrToken?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  
  // Membership details
  currentPlanId?: string;
  currentPlanName?: string;
  membershipStartDate: string;
  membershipEndDate: string;
  durationMonths?: number;
  membershipPrice: number;
  discount: number;
  finalAmount: number;
  totalPaid: number;
  balanceDue: number;
  
  // Trainer
  primaryTrainerId?: string;
  primaryTrainerName?: string;
  
  // Status & activity
  status: MembershipStatus;
  isArchived: boolean;
  totalVisits: number;
  lastVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  gymId: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  planId?: string;
  planName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  collectedByUserId?: string;
  collectedByUserName?: string;
  balanceRemaining: number;
  notes?: string;
  status: 'completed' | 'refunded' | 'failed';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  date: string;
  time: string;
  checkInTime?: string;
  method: 'qr_code' | 'manual' | 'barcode' | 'kiosk';
  checkInMethod?: 'qr_code' | 'manual' | 'barcode' | 'kiosk';
  staffName?: string;
  status: 'present' | 'absent' | 'late';
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  gymId: string;
  memberId: string;
  date: string;
  weightKg: number;
  heightCm?: number;
  chestInches?: number;
  waistInches?: number;
  hipsInches?: number;
  bicepsInches?: number;
  bodyFatPercent?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
}

export interface WorkoutDay {
  day: string;
  targetMuscle: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  name: string;
  goal: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  durationWeeks: number;
  description?: string;
  schedule?: WorkoutDay[];
  isActive: boolean;
  createdAt: string;
}

export interface DietMealItem {
  name: string;
  time: string;
  items: string[];
  calories: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
}

export interface DietPlan {
  id: string;
  gymId: string;
  name: string;
  goal: string;
  dailyCalories: number;
  description?: string;
  meals?: DietMealItem[];
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  gymId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  gymId?: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityId?: string;
}

export interface MySQLDatabaseConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  ssl?: boolean;
}

export interface MySQLStatus {
  connected: boolean;
  provider: 'Hostinger MySQL' | 'Local MySQL' | 'In-Memory Mock Fallback';
  host?: string;
  database?: string;
  tablesFound?: number;
  error?: string;
  lastChecked?: string;
}
