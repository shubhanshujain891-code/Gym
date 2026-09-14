export type UserRole = 'super_admin' | 'gym_owner' | 'staff' | 'member';

export type StaffPermission =
  | 'members_view'
  | 'members_add'
  | 'members_edit'
  | 'members_delete'
  | 'attendance'
  | 'payments'
  | 'memberships'
  | 'trainers'
  | 'reports'
  | 'whatsapp'
  | 'settings';

export type MembershipStatus = 'active' | 'expiring_soon' | 'expired' | 'paused' | 'cancelled';
export type MemberStatus = MembershipStatus;
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
export type SubscriptionTier = 'starter' | 'growth' | 'pro' | 'enterprise';
export type GymSubscriptionStatus = 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled' | 'expired';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  gymId?: string; // Required for gym_owner, staff, member
  avatarUrl?: string;
  permissions?: StaffPermission[];
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface GymSettings {
  name: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstNumber?: string;
  currency: string; // default "INR"
  currencyCode?: string;
  currencySymbol: string; // default "₹"
  timezone: string; // default "Asia/Kolkata"
  receiptPrefix: string; // default "REC"
  memberIdPrefix: string; // default "FIT"
  expiringSoonDays: number; // default 7
  duplicateAttendanceMinutes: number; // default 60
  enableQrAttendance: boolean;
  theme: 'light' | 'dark' | 'system';
  taxNumber?: string;
  upiId?: string;
  autoReminderDays?: number;
  whatsappTemplate?: string;
}

export interface GymSubscription {
  id: string;
  gymId: string;
  tier: SubscriptionTier;
  status: GymSubscriptionStatus;
  pricePerMonth: number;
  maxMembers: number; // e.g. 500, 2000, -1 for unlimited
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: string;
  status: 'active' | 'trial' | 'suspended';
  subscription: GymSubscription;
  settings: GymSettings;
  isOnboarded: boolean;
  phone?: string;
  email?: string;
  address?: string;
  saasPlanId?: string;
}

export interface SaasPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  monthlyPrice: number;
  maxMembers: number;
  maxStaff: number;
  features: string[];
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  durationDays?: number;
  price: number;
  description: string;
  accessType: 'all_access' | 'gym_only' | 'cardio_only' | 'crossfit';
  ptSessionsIncluded: number;
  freezeDaysAllowed: number;
  isActive: boolean;
  createdAt: string;
  features?: string[];
}

export interface Member {
  id: string; // db id
  gymId: string;
  memberCode: string; // e.g. "FIT-000104"
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  notes?: string;
  referralSource?: string;
  
  // Membership info
  currentPlanId?: string;
  currentPlanName?: string;
  membershipStartDate: string;
  membershipEndDate: string;
  durationMonths: number;
  membershipPrice: number;
  discount: number;
  finalAmount: number;
  
  // Financial status
  totalPaid: number;
  balanceDue: number;
  
  // Staff & trainer
  primaryTrainerId?: string;
  primaryTrainerName?: string;
  
  // Status & analytics
  status: MembershipStatus;
  isArchived: boolean;
  lastVisitDate?: string;
  totalVisits: number;
  totalVisitsCount?: number;
  assignedWorkoutPlanId?: string;
  assignedDietPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  gymId: string;
  receiptNumber: string; // e.g. "REC-2026-000421"
  memberId: string;
  memberName: string;
  memberCode: string;
  planId?: string;
  planName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string; // ISO date
  referenceNumber?: string;
  collectedByUserId: string;
  collectedByUserName: string;
  balanceRemaining: number;
  notes?: string;
  status: 'completed' | 'refunded';
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  checkInMethod: 'manual' | 'qr_code' | 'barcode' | 'kiosk';
  staffName: string;
  checkOutTime?: string;
  checkInTime?: string;
  method?: string;
  status?: string;
  createdAt: string;
}

export interface Trainer {
  id: string;
  gymId: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  specialization: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  hourlyRate?: number;
  assignedMemberCount: number;
  ptRevenue: number;
  bio?: string;
  createdAt: string;
  shiftTiming?: string;
  notes?: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio';
  sets: number;
  reps: string; // e.g. "10-12" or "15"
  weight?: string; // e.g. "20 kg" or "Bodyweight"
  restSeconds: number;
  instructions?: string;
  videoUrl?: string;
  isCompleted?: boolean;
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  title: string;
  name?: string;
  goal: 'Fat Loss' | 'Muscle Building' | 'Strength' | 'Endurance' | 'General Fitness';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  description: string;
  assignedMemberIds: string[]; // member IDs
  assignedByTrainerId?: string;
  days: {
    dayName: string; // e.g. "Chest & Triceps"
    focus?: string;
    exercises: ExerciseItem[];
  }[];
  createdAt: string;
}

export interface DietMealItem {
  time: string; // e.g. "8:00 AM"
  name: string; // e.g. "Breakfast"
  items: string[]; // e.g. ["4 Egg Whites + 2 Whole Eggs", "Oats with almonds", "1 Apple"]
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface DietPlan {
  id: string;
  gymId: string;
  name: string;
  goal: 'Weight Loss' | 'Lean Bulk' | 'Muscle Gain' | 'Maintenance' | 'Keto';
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
  caloriesTarget?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatsGrams?: number;
  description?: string;
  assignedMemberIds: string[];
  assignedByTrainerId?: string;
  meals: DietMealItem[];
  notes?: string;
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  gymId: string;
  memberId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage?: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  chestInches?: number;
  waistInches?: number;
  bicepsInches?: number;
  frontPhotoUrl?: string;
  sidePhotoUrl?: string;
  backPhotoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  gymId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  roleTitle: string; // e.g. "Front Desk Manager", "Floor Manager"
  permissions: StaffPermission[];
  status: 'active' | 'inactive';
  joiningDate: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  gymId?: string; // Empty for platform super-admin logs
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string; // e.g. 'member', 'payment', 'attendance', 'gym'
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  gymId?: string;
  recipientRole?: UserRole;
  recipientUserId?: string;
  type: 'membership_expiring' | 'payment_pending' | 'payment_received' | 'new_member' | 'attendance' | 'system_alert';
  title: string;
  message: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  gymId: string;
  name: string;
  category: 'membership_expiry' | 'payment_reminder' | 'welcome_message' | 'birthday' | 'inactive_member' | 'renewal' | 'general';
  body: string;
  isAutomated: boolean;
}

export type RiskLevel = 'healthy' | 'attention' | 'at_risk';

export interface RiskScoreInfo {
  level: RiskLevel;
  score: number; // 0 - 100
  reasons: string[];
}
