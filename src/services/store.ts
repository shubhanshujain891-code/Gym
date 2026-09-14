import {
  Gym,
  User,
  Member,
  MembershipPlan,
  PaymentRecord,
  AttendanceRecord,
  Trainer,
  WorkoutPlan,
  DietPlan,
  ProgressRecord,
  StaffMember,
  AuditLog,
  AppNotification,
  WhatsAppTemplate,
  GymSettings,
  PaymentMethod,
  UserRole,
  SaasPlan,
} from '../types';
import {
  INITIAL_GYMS,
  INITIAL_USERS,
  INITIAL_PLANS,
  INITIAL_TRAINERS,
  INITIAL_STAFF,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_WORKOUTS,
  INITIAL_DIETS,
  INITIAL_PROGRESS,
  INITIAL_AUDIT_LOGS,
  INITIAL_WHATSAPP_TEMPLATES,
  INITIAL_NOTIFICATIONS,
} from '../utils/mockData';
import { calculateMembershipStatus } from '../utils/formatters';

const STORAGE_KEY = 'fitmanage_saas_db_v1';
const CURRENT_USER_KEY = 'fitmanage_current_user_v1';

interface DatabaseSchema {
  gyms: Gym[];
  users: User[];
  plans: MembershipPlan[];
  trainers: Trainer[];
  staff: StaffMember[];
  members: Member[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  workouts: WorkoutPlan[];
  diets: DietPlan[];
  progress: ProgressRecord[];
  auditLogs: AuditLog[];
  whatsappTemplates: WhatsAppTemplate[];
  notifications: AppNotification[];
}

function loadInitialDatabase(): DatabaseSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load storage, initializing fresh database', e);
  }

  const initialDb: DatabaseSchema = {
    gyms: INITIAL_GYMS,
    users: INITIAL_USERS,
    plans: INITIAL_PLANS,
    trainers: INITIAL_TRAINERS,
    staff: INITIAL_STAFF,
    members: INITIAL_MEMBERS,
    payments: INITIAL_PAYMENTS,
    attendance: INITIAL_ATTENDANCE,
    workouts: INITIAL_WORKOUTS,
    diets: INITIAL_DIETS,
    progress: INITIAL_PROGRESS,
    auditLogs: INITIAL_AUDIT_LOGS,
    whatsappTemplates: INITIAL_WHATSAPP_TEMPLATES,
    notifications: INITIAL_NOTIFICATIONS,
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

class StoreService {
  private db: DatabaseSchema;
  private currentUser: User | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.db = loadInitialDatabase();
    
    // Load current user from storage or default to Gym Owner
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        this.currentUser = this.db.users.find(u => u.role === 'gym_owner') || this.db.users[0];
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      }
    } catch {
      this.currentUser = this.db.users[1];
    }

    // Refresh dynamic status based on current date
    this.refreshMemberStatuses();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    saveDatabase(this.db);
    this.listeners.forEach(fn => fn());
  }

  // --- Auth & Tenant Isolation ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    this.notify();
  }

  public loginAsRole(role: UserRole): User {
    const found = this.db.users.find(u => u.role === role);
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    throw new Error(`User with role ${role} not found`);
  }

  public switchRole(role: UserRole): User {
    return this.loginAsRole(role);
  }

  public loginWithEmail(email: string): User | null {
    const user = this.db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  public getActiveGymId(): string {
    if (this.currentUser?.gymId) {
      return this.currentUser.gymId;
    }
    return this.db.gyms[0]?.id || 'gym-powerfit-01';
  }

  public setActiveGymId(gymId: string) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, gymId };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      this.notify();
    }
  }

  public switchGym(gymId: string) {
    this.setActiveGymId(gymId);
  }

  public getCurrentGym(): Gym {
    const gymId = this.getActiveGymId();
    const gym = this.db.gyms.find(g => g.id === gymId);
    return gym || this.db.gyms[0];
  }

  public getAllGyms(): Gym[] {
    return this.db.gyms;
  }

  // Refresh dynamic statuses for members
  private refreshMemberStatuses() {
    const gym = this.getCurrentGym();
    const threshold = gym.settings.expiringSoonDays || 7;
    let changed = false;

    this.db.members = this.db.members.map(m => {
      const calculated = calculateMembershipStatus(m.membershipEndDate, threshold, m.status);
      if (calculated !== m.status) {
        changed = true;
        return { ...m, status: calculated };
      }
      return m;
    });

    if (changed) {
      saveDatabase(this.db);
    }
  }

  // --- Audit Log Helper ---
  public logAudit(action: string, entity: string, entityId: string, details: string) {
    const user = this.currentUser || {
      id: 'system',
      name: 'System',
      role: 'super_admin' as UserRole,
    };
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      gymId: this.currentUser?.role === 'super_admin' ? undefined : this.getActiveGymId(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.db.auditLogs.unshift(log);
    // Keep max 500 logs
    if (this.db.auditLogs.length > 500) {
      this.db.auditLogs.pop();
    }
  }

  // --- Members Module (Tenant-Isolated) ---
  public getMembers(options?: { includeArchived?: boolean }): Member[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';

    return this.db.members.filter(m => {
      if (!isSuperAdmin && m.gymId !== gymId) return false;
      if (!options?.includeArchived && m.isArchived) return false;
      return true;
    });
  }

  public getMemberById(id: string): Member | undefined {
    return this.db.members.find(m => m.id === id);
  }

  public createMember(data: Omit<Member, 'id' | 'gymId' | 'memberCode' | 'createdAt' | 'updatedAt' | 'totalVisits' | 'isArchived'> & { initialPaymentMethod?: PaymentMethod; initialPaymentRef?: string }): Member {
    const gymId = this.getActiveGymId();
    const currentGym = this.getCurrentGym();
    
    // Generate sequential member code
    const existingGymMembers = this.db.members.filter(m => m.gymId === gymId);
    const nextNum = existingGymMembers.length + 1;
    const prefix = currentGym.settings.memberIdPrefix || 'FIT';
    const memberCode = `${prefix}-${String(nextNum).padStart(6, '0')}`;

    const newMemberId = `mem-${Date.now()}`;
    const now = new Date().toISOString();

    const newMember: Member = {
      ...data,
      id: newMemberId,
      gymId,
      memberCode,
      totalVisits: 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    this.db.members.unshift(newMember);

    // Create payment record if initial payment made
    if (data.totalPaid > 0) {
      this.recordPayment({
        memberId: newMember.id,
        memberName: `${newMember.firstName} ${newMember.lastName}`,
        memberCode: newMember.memberCode,
        planId: newMember.currentPlanId,
        planName: newMember.currentPlanName || 'Custom Membership',
        amount: data.totalPaid,
        paymentMethod: data.initialPaymentMethod || 'cash',
        referenceNumber: data.initialPaymentRef,
        balanceRemaining: newMember.balanceDue,
        notes: 'Initial registration payment',
      });
    }

    this.logAudit('CREATE_MEMBER', 'member', newMember.id, `Created member ${newMember.firstName} ${newMember.lastName} (${newMember.memberCode})`);

    this.addNotification({
      type: 'new_member',
      title: 'New Member Joined',
      message: `${newMember.firstName} ${newMember.lastName} (${newMember.memberCode}) joined under ${newMember.currentPlanName || 'Membership'}.`,
      entityId: newMember.id,
    });

    this.notify();
    return newMember;
  }

  public updateMember(id: string, updates: Partial<Member>): Member {
    const index = this.db.members.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const updated = {
      ...this.db.members[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Re-verify balance
    if (updates.finalAmount !== undefined || updates.totalPaid !== undefined) {
      updated.balanceDue = Math.max(0, updated.finalAmount - updated.totalPaid);
    }

    this.db.members[index] = updated;
    this.logAudit('UPDATE_MEMBER', 'member', id, `Updated details for ${updated.firstName} ${updated.lastName}`);
    this.notify();
    return updated;
  }

  public archiveMember(id: string, archive: boolean = true) {
    const member = this.db.members.find(m => m.id === id);
    if (member) {
      member.isArchived = archive;
      this.logAudit(archive ? 'ARCHIVE_MEMBER' : 'RESTORE_MEMBER', 'member', id, `${archive ? 'Archived' : 'Restored'} member ${member.firstName} ${member.lastName}`);
      this.notify();
    }
  }

  public deleteMember(id: string) {
    const member = this.db.members.find(m => m.id === id);
    if (member) {
      this.db.members = this.db.members.filter(m => m.id !== id);
      this.logAudit('DELETE_MEMBER', 'member', id, `Deleted member ${member.firstName} ${member.lastName} (${member.memberCode})`);
      this.notify();
    }
  }

  public renewMembership(
    memberId: string,
    plan: MembershipPlan,
    startDate: string,
    amount: number,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    refNumber?: string
  ) {
    const member = this.db.members.find(m => m.id === memberId);
    if (!member) throw new Error('Member not found');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);
    const endDateStr = end.toISOString().split('T')[0];

    const newTotalPaid = member.totalPaid + paidAmount;
    const newFinalAmount = member.finalAmount + amount;
    const newBalanceDue = Math.max(0, newFinalAmount - newTotalPaid);

    member.currentPlanId = plan.id;
    member.currentPlanName = plan.name;
    member.membershipStartDate = startDate;
    member.membershipEndDate = endDateStr;
    member.durationMonths = plan.durationMonths;
    member.finalAmount = newFinalAmount;
    member.totalPaid = newTotalPaid;
    member.balanceDue = newBalanceDue;
    member.status = 'active';
    member.updatedAt = new Date().toISOString();

    // Generate payment receipt
    if (paidAmount > 0) {
      this.recordPayment({
        memberId: member.id,
        memberName: `${member.firstName} ${member.lastName}`,
        memberCode: member.memberCode,
        planId: plan.id,
        planName: plan.name,
        amount: paidAmount,
        paymentMethod,
        referenceNumber: refNumber,
        balanceRemaining: newBalanceDue,
        notes: `Renewal for ${plan.name} (${plan.durationMonths} Months)`,
      });
    }

    this.logAudit('RENEW_MEMBERSHIP', 'membership', member.id, `Renewed membership for ${member.firstName} ${member.lastName} with ${plan.name}`);
    this.notify();
  }

  // --- Payments Module ---
  public getPayments(): PaymentRecord[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.payments.filter(p => isSuperAdmin || p.gymId === gymId);
  }

  public getPaymentsByMember(memberId: string): PaymentRecord[] {
    return this.getPayments().filter(p => p.memberId === memberId);
  }

  public collectPayment(data: {
    memberId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    memberName?: string;
    memberCode?: string;
    planId?: string;
    planName?: string;
    balanceRemaining?: number;
  }): PaymentRecord {
    return this.recordPayment(data);
  }

  public recordPayment(data: {
    memberId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
    memberName?: string;
    memberCode?: string;
    planId?: string;
    planName?: string;
    balanceRemaining?: number;
  }): PaymentRecord {
    const gymId = this.getActiveGymId();
    const currentGym = this.getCurrentGym();
    const year = new Date().getFullYear();
    const prefix = currentGym.settings.receiptPrefix || 'REC';

    const gymPayments = this.db.payments.filter(p => p.gymId === gymId);
    const seqNum = String(gymPayments.length + 1).padStart(6, '0');
    const receiptNumber = `${prefix}-${year}-${seqNum}`;

    const member = this.db.members.find(m => m.id === data.memberId);
    const memberName = data.memberName || (member ? `${member.firstName} ${member.lastName}` : 'Member');
    const memberCode = data.memberCode || member?.memberCode || 'FIT-000';
    const planId = data.planId || member?.currentPlanId;
    const planName = data.planName || member?.currentPlanName || 'Membership';
    const balanceRemaining = data.balanceRemaining !== undefined
      ? data.balanceRemaining
      : Math.max(0, (member?.balanceDue || 0) - data.amount);

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      gymId,
      receiptNumber,
      memberId: data.memberId,
      memberName,
      memberCode,
      planId,
      planName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: data.referenceNumber,
      collectedByUserId: this.currentUser?.id || 'system',
      collectedByUserName: this.currentUser?.name || 'Staff User',
      balanceRemaining,
      notes: data.notes,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    this.db.payments.unshift(newPayment);

    // Update member's totalPaid and balanceDue
    if (member) {
      member.totalPaid += data.amount;
      member.balanceDue = Math.max(0, member.finalAmount - member.totalPaid);
      member.updatedAt = new Date().toISOString();
    }

    this.logAudit('RECORD_PAYMENT', 'payment', newPayment.id, `Collected ${data.amount} via ${data.paymentMethod} from ${memberName} (${receiptNumber})`);

    this.addNotification({
      type: 'payment_received',
      title: 'Payment Received',
      message: `Received ${data.amount} from ${memberName} via ${(data.paymentMethod || 'cash').toUpperCase()} (${receiptNumber})`,
      entityId: newPayment.id,
    });

    this.notify();
    return newPayment;
  }

  // --- Attendance Module ---
  public getAttendance(): AttendanceRecord[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    const list = this.db.attendance.filter(a => isSuperAdmin || a.gymId === gymId);
    return list.map(a => ({
      ...a,
      checkInTime: a.checkInTime || a.time || '08:00 AM',
      method: a.method || a.checkInMethod || 'manual',
      checkInMethod: a.checkInMethod || (a.method as any) || 'manual',
      status: a.status || 'present',
    }));
  }

  public getAttendanceByMember(memberId: string): AttendanceRecord[] {
    return this.getAttendance().filter(a => a.memberId === memberId);
  }

  public markAttendance(
    memberId: string,
    checkInMethod: 'manual' | 'qr_code' | 'barcode' | 'kiosk' = 'manual'
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const gymId = this.getActiveGymId();
    const currentGym = this.getCurrentGym();
    const member = this.db.members.find(m => m.id === memberId && m.gymId === gymId);

    if (!member) {
      return { success: false, message: 'Member not found or unauthorized' };
    }

    if (member.status === 'expired') {
      return { success: false, message: `Cannot check in: ${member.firstName}'s membership has EXPIRED. Please renew first.` };
    }

    if (member.status === 'paused' || member.status === 'cancelled') {
      return { success: false, message: `Cannot check in: Membership is currently ${(member.status || 'inactive').toUpperCase()}.` };
    }

    // Check duplicate check-in within configured threshold (default 60 min)
    const duplicateWindowMin = currentGym.settings.duplicateAttendanceMinutes || 60;
    const todayStr = new Date().toISOString().split('T')[0];
    const recentToday = this.db.attendance.find(a => 
      a.gymId === gymId && 
      a.memberId === memberId && 
      a.date === todayStr
    );

    if (recentToday) {
      const lastTime = new Date(recentToday.createdAt).getTime();
      const nowTime = Date.now();
      const diffMinutes = (nowTime - lastTime) / (1000 * 60);

      if (diffMinutes < duplicateWindowMin) {
        return {
          success: false,
          message: `${member.firstName} has already checked in today at ${recentToday.time}. (Cooldown: ${duplicateWindowMin} mins)`,
        };
      }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberCode,
      date: todayStr,
      time: timeStr,
      checkInTime: timeStr,
      checkInMethod,
      method: checkInMethod,
      staffName: this.currentUser?.name || 'Reception',
      status: 'present',
      createdAt: now.toISOString(),
    };

    this.db.attendance.unshift(newRecord);

    // Update member's last visit & visits count
    member.lastVisitDate = todayStr;
    member.totalVisits = (member.totalVisits || 0) + 1;
    member.updatedAt = now.toISOString();

    this.logAudit('CHECK_IN', 'attendance', newRecord.id, `${member.firstName} ${member.lastName} checked in (${checkInMethod})`);
    this.notify();

    return {
      success: true,
      message: `Checked in successfully: ${member.firstName} ${member.lastName} at ${timeStr}`,
      record: newRecord,
    };
  }

  // --- Membership Plans ---
  public getPlans(): MembershipPlan[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.plans.filter(p => isSuperAdmin || p.gymId === gymId);
  }

  public createPlan(data: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>): MembershipPlan {
    const gymId = this.getActiveGymId();
    const newPlan: MembershipPlan = {
      ...data,
      id: `plan-${Date.now()}`,
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.db.plans.push(newPlan);
    this.logAudit('CREATE_PLAN', 'plan', newPlan.id, `Created plan ${newPlan.name} (₹${newPlan.price})`);
    this.notify();
    return newPlan;
  }

  public updatePlan(id: string, updates: Partial<MembershipPlan>) {
    const idx = this.db.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.db.plans[idx] = { ...this.db.plans[idx], ...updates };
      this.logAudit('UPDATE_PLAN', 'plan', id, `Updated plan ${this.db.plans[idx].name}`);
      this.notify();
    }
  }

  public deletePlan(id: string) {
    this.db.plans = this.db.plans.filter(p => p.id !== id);
    this.logAudit('DELETE_PLAN', 'plan', id, `Deleted membership plan`);
    this.notify();
  }

  // --- Trainers Module ---
  public getTrainers(): Trainer[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.trainers.filter(t => isSuperAdmin || t.gymId === gymId);
  }

  public createTrainer(data: Omit<Trainer, 'id' | 'gymId' | 'assignedMemberCount' | 'ptRevenue' | 'createdAt'>): Trainer {
    const gymId = this.getActiveGymId();
    const newTrainer: Trainer = {
      ...data,
      id: `trainer-${Date.now()}`,
      gymId,
      assignedMemberCount: 0,
      ptRevenue: 0,
      createdAt: new Date().toISOString(),
    };
    this.db.trainers.push(newTrainer);
    this.logAudit('CREATE_TRAINER', 'trainer', newTrainer.id, `Added trainer ${newTrainer.name}`);
    this.notify();
    return newTrainer;
  }

  public updateTrainer(id: string, updates: Partial<Trainer>) {
    const idx = this.db.trainers.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.db.trainers[idx] = { ...this.db.trainers[idx], ...updates };
      this.logAudit('UPDATE_TRAINER', 'trainer', id, `Updated trainer ${this.db.trainers[idx].name}`);
      this.notify();
    }
  }

  public deleteTrainer(id: string) {
    this.db.trainers = this.db.trainers.filter(t => t.id !== id);
    this.logAudit('DELETE_TRAINER', 'trainer', id, `Deleted trainer`);
    this.notify();
  }

  // --- Workouts Module ---
  public getWorkouts(): WorkoutPlan[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.workouts.filter(w => isSuperAdmin || w.gymId === gymId);
  }

  public getWorkoutById(id: string): WorkoutPlan | undefined {
    return this.getWorkouts().find(w => w.id === id);
  }

  public createWorkout(data: Omit<WorkoutPlan, 'id' | 'gymId' | 'createdAt'>): WorkoutPlan {
    const gymId = this.getActiveGymId();
    const newWorkout: WorkoutPlan = {
      ...data,
      id: `workout-${Date.now()}`,
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.db.workouts.push(newWorkout);
    this.logAudit('CREATE_WORKOUT', 'workout', newWorkout.id, `Created workout routine ${newWorkout.title}`);
    this.notify();
    return newWorkout;
  }

  public updateWorkout(id: string, updates: Partial<WorkoutPlan>) {
    const idx = this.db.workouts.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.db.workouts[idx] = { ...this.db.workouts[idx], ...updates };
      this.logAudit('UPDATE_WORKOUT', 'workout', id, `Updated workout ${this.db.workouts[idx].title}`);
      this.notify();
    }
  }

  public deleteWorkout(id: string) {
    this.db.workouts = this.db.workouts.filter(w => w.id !== id);
    this.logAudit('DELETE_WORKOUT', 'workout', id, 'Deleted workout plan');
    this.notify();
  }

  // --- Diets Module ---
  public getDiets(): DietPlan[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.diets.filter(d => isSuperAdmin || d.gymId === gymId);
  }

  public getDietPlans(): DietPlan[] {
    return this.getDiets();
  }

  public getDietPlanById(id: string): DietPlan | undefined {
    return this.getDiets().find(d => d.id === id);
  }

  public createDietPlan(data: any): DietPlan {
    return this.createDiet({
      name: data.name || 'Custom Diet Plan',
      goal: data.goal || 'Weight Loss',
      targetCalories: data.targetCalories || data.caloriesTarget || 2000,
      targetProtein: data.targetProtein || data.proteinGrams || 150,
      targetCarbs: data.targetCarbs || data.carbsGrams || 200,
      targetFats: data.targetFats || data.fatsGrams || 60,
      caloriesTarget: data.caloriesTarget || data.targetCalories || 2000,
      proteinGrams: data.proteinGrams || data.targetProtein || 150,
      carbsGrams: data.carbsGrams || data.targetCarbs || 200,
      fatsGrams: data.fatsGrams || data.targetFats || 60,
      description: data.description || '',
      assignedMemberIds: data.assignedMemberIds || [],
      meals: data.meals || [],
      notes: data.notes || '',
      ...data,
    });
  }

  public createDiet(data: Omit<DietPlan, 'id' | 'gymId' | 'createdAt'>): DietPlan {
    const gymId = this.getActiveGymId();
    const newDiet: DietPlan = {
      ...data,
      id: `diet-${Date.now()}`,
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.db.diets.push(newDiet);
    this.logAudit('CREATE_DIET', 'diet', newDiet.id, `Created diet plan ${newDiet.name}`);
    this.notify();
    return newDiet;
  }

  public updateDiet(id: string, updates: Partial<DietPlan>) {
    const idx = this.db.diets.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.db.diets[idx] = { ...this.db.diets[idx], ...updates };
      this.logAudit('UPDATE_DIET', 'diet', id, `Updated diet ${this.db.diets[idx].name}`);
      this.notify();
    }
  }

  public deleteDiet(id: string) {
    this.db.diets = this.db.diets.filter(d => d.id !== id);
    this.logAudit('DELETE_DIET', 'diet', id, 'Deleted diet plan');
    this.notify();
  }

  // --- Progress Tracking ---
  public getProgress(memberId?: string): ProgressRecord[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.progress.filter(p => {
      if (!isSuperAdmin && p.gymId !== gymId) return false;
      if (memberId && p.memberId !== memberId) return false;
      return true;
    });
  }

  public getMeasurements(memberId?: string): ProgressRecord[] {
    return this.getProgress(memberId);
  }

  public getMeasurementsByMember(memberId: string): ProgressRecord[] {
    return this.getProgress(memberId);
  }

  public recordMeasurement(data: any): ProgressRecord {
    return this.addProgressRecord({
      memberId: data.memberId,
      date: data.date || new Date().toISOString().split('T')[0],
      weightKg: data.weightKg || Number(data.weight) || 70,
      heightCm: data.heightCm || Number(data.height) || 170,
      bmi: data.bmi || Number(((data.weightKg || 70) / Math.pow((data.heightCm || 170) / 100, 2)).toFixed(1)) || 22,
      bodyFatPercentage: data.bodyFatPercentage || (data.bodyFat ? Number(data.bodyFat) : undefined),
      chestCm: data.chestCm,
      waistCm: data.waistCm,
      hipsCm: data.hipsCm,
      armsCm: data.armsCm,
      chestInches: data.chestInches || (data.chest ? Number(data.chest) : undefined),
      waistInches: data.waistInches || (data.waist ? Number(data.waist) : undefined),
      bicepsInches: data.bicepsInches || (data.biceps ? Number(data.biceps) : undefined),
      notes: data.notes || '',
      ...data,
    });
  }

  public addProgressRecord(data: Omit<ProgressRecord, 'id' | 'gymId' | 'createdAt'>): ProgressRecord {
    const gymId = this.getActiveGymId();
    const newRecord: ProgressRecord = {
      ...data,
      id: `prog-${Date.now()}`,
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.db.progress.unshift(newRecord);
    this.logAudit('RECORD_PROGRESS', 'progress', newRecord.id, `Added body measurement assessment for member ${data.memberId}`);
    this.notify();
    return newRecord;
  }

  // --- Staff Management ---
  public getStaff(): StaffMember[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.staff.filter(s => isSuperAdmin || s.gymId === gymId);
  }

  public createStaff(data: Omit<StaffMember, 'id' | 'gymId' | 'userId' | 'createdAt'>): StaffMember {
    const gymId = this.getActiveGymId();
    const userId = `user-staff-${Date.now()}`;
    
    // Also create matching user
    const newUser: User = {
      id: userId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: 'staff',
      gymId,
      permissions: data.permissions,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    this.db.users.push(newUser);

    const newStaff: StaffMember = {
      ...data,
      id: `staff-${Date.now()}`,
      gymId,
      userId,
      createdAt: new Date().toISOString(),
    };
    this.db.staff.push(newStaff);
    this.logAudit('CREATE_STAFF', 'staff', newStaff.id, `Created staff member ${newStaff.name} (${newStaff.roleTitle})`);
    this.notify();
    return newStaff;
  }

  public updateStaff(id: string, updates: Partial<StaffMember>) {
    const idx = this.db.staff.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.db.staff[idx] = { ...this.db.staff[idx], ...updates };
      // Also update linked user permissions
      const linkedUser = this.db.users.find(u => u.id === this.db.staff[idx].userId);
      if (linkedUser && updates.permissions) {
        linkedUser.permissions = updates.permissions;
      }
      this.logAudit('UPDATE_STAFF', 'staff', id, `Updated staff profile for ${this.db.staff[idx].name}`);
      this.notify();
    }
  }

  public deleteStaff(id: string) {
    this.db.staff = this.db.staff.filter(s => s.id !== id);
    this.logAudit('DELETE_STAFF', 'staff', id, 'Deleted staff account');
    this.notify();
  }

  // --- WhatsApp Templates ---
  public getWhatsAppTemplates(): WhatsAppTemplate[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.whatsappTemplates.filter(t => isSuperAdmin || t.gymId === gymId);
  }

  public updateWhatsAppTemplate(template: WhatsAppTemplate) {
    const idx = this.db.whatsappTemplates.findIndex(t => t.id === template.id);
    if (idx !== -1) {
      this.db.whatsappTemplates[idx] = template;
      this.logAudit('UPDATE_WHATSAPP_TEMPLATE', 'template', template.id, `Updated template ${template.name}`);
      this.notify();
    }
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.notifications.filter(n => isSuperAdmin || !n.gymId || n.gymId === gymId);
  }

  public addNotification(data: Omit<AppNotification, 'id' | 'gymId' | 'isRead' | 'createdAt'>) {
    const newNotif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      gymId: this.getActiveGymId(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.db.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.db.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    const gymId = this.getActiveGymId();
    this.db.notifications.forEach(n => {
      if (!n.gymId || n.gymId === gymId) {
        n.isRead = true;
      }
    });
    this.notify();
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.currentUser?.role === 'super_admin';
    return this.db.auditLogs.filter(l => isSuperAdmin || !l.gymId || l.gymId === gymId);
  }

  // --- Settings & Gym Profile ---
  public updateGymSettings(settings: Partial<GymSettings>) {
    const gym = this.getCurrentGym();
    if (gym) {
      gym.settings = { ...gym.settings, ...settings };
      gym.name = settings.name || gym.name;
      this.logAudit('UPDATE_SETTINGS', 'settings', gym.id, 'Updated gym configuration and business settings');
      this.notify();
    }
  }

  public updateGym(gymId: string, updates: Partial<Gym>) {
    const idx = this.db.gyms.findIndex(g => g.id === gymId);
    if (idx !== -1) {
      this.db.gyms[idx] = { ...this.db.gyms[idx], ...updates };
      this.logAudit('UPDATE_GYM', 'gym', gymId, `Updated gym status/subscription for ${this.db.gyms[idx].name}`);
      this.notify();
    }
  }

  public getAllPlatformMembers(): Member[] {
    return this.db.members;
  }

  public getSaasPlans(): SaasPlan[] {
    return [
      {
        id: 'plan_starter',
        name: 'Starter Plan',
        tier: 'starter',
        monthlyPrice: 999,
        maxMembers: 500,
        maxStaff: 3,
        features: ['Up to 500 Active Members', 'QR Code Attendance Pass', 'WhatsApp Receipts', '3 Staff Accounts'],
      },
      {
        id: 'plan_growth',
        name: 'Growth Plan',
        tier: 'growth',
        monthlyPrice: 1999,
        maxMembers: 2000,
        maxStaff: 10,
        features: ['Up to 2,000 Active Members', 'Unlimited Trainers & Diet Plans', 'Automated Renewal Alerts', '10 Staff Accounts'],
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise Plan',
        tier: 'enterprise',
        monthlyPrice: 3999,
        maxMembers: 10000,
        maxStaff: 50,
        features: ['Unlimited Members', 'Multi-Branch Management', 'Custom Domain & White Label', '24/7 Priority Support'],
      },
    ];
  }

  public exportStateJson(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public importStateJson(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      if (parsed && Array.isArray(parsed.gyms) && Array.isArray(parsed.members)) {
        this.db = parsed;
        saveDatabase(this.db);
        this.notify();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public resetToMockData() {
    this.resetToDemo();
  }

  public createGym(
    nameOrOptions: string | { name: string; ownerName?: string; ownerEmail?: string; ownerPhone?: string; phone?: string; email?: string; address?: string; saasPlanId?: string; ownerId?: string },
    ownerNameParam?: string,
    ownerEmailParam?: string,
    ownerPhoneParam?: string,
    tierParam: 'starter' | 'growth' | 'pro' = 'starter'
  ): Gym {
    let name: string;
    let ownerName: string;
    let ownerEmail: string;
    let ownerPhone: string;
    let tier: 'starter' | 'growth' | 'pro' = tierParam;
    let address = 'MG Road, Bengaluru';
    let saasPlanId = 'plan_starter';

    if (typeof nameOrOptions === 'object') {
      name = nameOrOptions.name;
      ownerName = nameOrOptions.ownerName || 'Gym Owner';
      ownerEmail = nameOrOptions.ownerEmail || nameOrOptions.email || 'contact@gym.com';
      ownerPhone = nameOrOptions.ownerPhone || nameOrOptions.phone || '+91 98765 43210';
      if (nameOrOptions.address) address = nameOrOptions.address;
      if (nameOrOptions.saasPlanId) {
        saasPlanId = nameOrOptions.saasPlanId;
        tier = saasPlanId.includes('growth') ? 'growth' : saasPlanId.includes('enterprise') || saasPlanId.includes('pro') ? 'pro' : 'starter';
      }
    } else {
      name = nameOrOptions;
      ownerName = ownerNameParam || 'Gym Owner';
      ownerEmail = ownerEmailParam || 'contact@gym.com';
      ownerPhone = ownerPhoneParam || '+91 98765 43210';
    }

    const gymId = `gym-${Date.now()}`;
    const ownerId = `user-owner-${Date.now()}`;

    const newGym: Gym = {
      id: gymId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerId,
      ownerName,
      ownerEmail,
      ownerPhone,
      phone: ownerPhone,
      email: ownerEmail,
      address,
      saasPlanId,
      createdAt: new Date().toISOString(),
      status: 'active',
      isOnboarded: true,
      subscription: {
        id: `sub-${Date.now()}`,
        gymId,
        tier,
        status: 'active',
        pricePerMonth: tier === 'starter' ? 999 : tier === 'growth' ? 1999 : 3999,
        maxMembers: tier === 'starter' ? 500 : tier === 'growth' ? 2000 : -1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
        autoRenew: true,
      },
      settings: {
        name,
        tagline: 'Run Your Gym. Grow Your Members.',
        logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80',
        address,
        phone: ownerPhone,
        email: ownerEmail,
        website: '',
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        receiptPrefix: 'REC',
        memberIdPrefix: 'FIT',
        expiringSoonDays: 7,
        duplicateAttendanceMinutes: 60,
        enableQrAttendance: true,
        theme: 'light',
      },
    };

    const newOwnerUser: User = {
      id: ownerId,
      email: ownerEmail,
      name: ownerName,
      phone: ownerPhone,
      role: 'gym_owner',
      gymId,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    this.db.gyms.push(newGym);
    this.db.users.push(newOwnerUser);
    this.logAudit('CREATE_GYM', 'gym', gymId, `Super Admin onboarded new gym: ${name}`);
    this.notify();
    return newGym;
  }

  public createGymLegacy(name: string, ownerName: string, ownerEmail: string, ownerPhone: string, tier: 'starter' | 'growth' | 'pro' = 'starter'): Gym {
    return this.createGym(name, ownerName, ownerEmail, ownerPhone, tier);
  }

  // Reset database to initial demo state
  public resetToDemo() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.db = loadInitialDatabase();
    this.currentUser = this.db.users.find(u => u.role === 'gym_owner') || this.db.users[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(this.currentUser));
    this.notify();
  }
}

export const store = new StoreService();
