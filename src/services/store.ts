import {
  Gym,
  User,
  MembershipPlan,
  Trainer,
  Member,
  PaymentRecord,
  AttendanceRecord,
  WorkoutPlan,
  DietPlan,
  ProgressRecord,
  AuditLog,
  AppNotification,
  MySQLStatus,
} from '../types';
import {
  INITIAL_GYMS,
  INITIAL_USERS,
  INITIAL_PLANS,
  INITIAL_TRAINERS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_WORKOUTS,
  INITIAL_DIETS,
  INITIAL_PROGRESS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../utils/mockData';
import { calculateMembershipStatus } from '../utils/formatters';
import { api } from './api';

const STORAGE_KEY = 'fitmanage_saas_db_v2';

interface AppDatabase {
  gyms: Gym[];
  users: User[];
  plans: MembershipPlan[];
  trainers: Trainer[];
  members: Member[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  workouts: WorkoutPlan[];
  diets: DietPlan[];
  progress: ProgressRecord[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}

type Listener = () => void;

export class Store {
  private db: AppDatabase;
  private listeners: Set<Listener> = new Set();
  private currentUserId: string = 'usr_owner';
  private activeGymId: string = 'gym_powerfit';
  private mysqlStatus: MySQLStatus = {
    connected: false,
    provider: 'Hostinger MySQL',
    host: 'srv1234.hstgr.io',
    database: 'u123456789_fitmanage',
    tablesFound: 12,
    lastChecked: new Date().toLocaleTimeString(),
  };

  constructor() {
    this.db = this.loadInitialData();
    this.checkLiveServerStatus();
  }

  private loadInitialData(): AppDatabase {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.members)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved state, using default:', e);
    }

    const initial: AppDatabase = {
      gyms: INITIAL_GYMS,
      users: INITIAL_USERS,
      plans: INITIAL_PLANS,
      trainers: INITIAL_TRAINERS,
      members: INITIAL_MEMBERS,
      payments: INITIAL_PAYMENTS,
      attendance: INITIAL_ATTENDANCE,
      workouts: INITIAL_WORKOUTS,
      diets: INITIAL_DIETS,
      progress: INITIAL_PROGRESS,
      auditLogs: INITIAL_AUDIT_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
    };
    this.persist(initial);
    return initial;
  }

  private persist(data: AppDatabase) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Storage quota exceeded:', e);
    }
  }

  private notify() {
    this.persist(this.db);
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public async checkLiveServerStatus() {
    try {
      const res = await api.getDatabaseStatus();
      if (res.success && res.data) {
        this.mysqlStatus = res.data;
        this.notify();
      }
    } catch {
      // Keep existing status
    }
  }

  // --- Auth & Users ---
  public getCurrentUser(): User {
    const user = this.db.users.find((u) => u.id === this.currentUserId);
    return user || this.db.users[0];
  }

  public setCurrentUser(userId: string) {
    const user = this.db.users.find((u) => u.id === userId);
    if (user) {
      this.currentUserId = user.id;
      if (user.gymId) {
        this.activeGymId = user.gymId;
      }
      this.notify();
    }
  }

  public getAllUsers(): User[] {
    return this.db.users;
  }

  public getActiveGymId(): string {
    return this.activeGymId;
  }

  public setActiveGymId(gymId: string) {
    this.activeGymId = gymId;
    this.notify();
  }

  public getActiveGym(): Gym {
    const gym = this.db.gyms.find((g) => g.id === this.activeGymId);
    return gym || this.db.gyms[0];
  }

  public getAllGyms(): Gym[] {
    return this.db.gyms;
  }

  public getMySQLStatus(): MySQLStatus {
    return this.mysqlStatus;
  }

  public setMySQLStatus(status: MySQLStatus) {
    this.mysqlStatus = status;
    this.notify();
  }

  // --- Members ---
  public getMembers(): Member[] {
    const activeGymId = this.getActiveGymId();
    const isSuperAdmin = this.getCurrentUser().role === 'super_admin';
    return this.db.members
      .filter((m) => (isSuperAdmin || m.gymId === activeGymId) && !m.isArchived)
      .map((m) => ({
        ...m,
        status: calculateMembershipStatus(m.membershipEndDate, 7, m.status),
      }));
  }

  public getMemberById(id: string): Member | undefined {
    return this.db.members.find((m) => m.id === id);
  }

  public addMember(data: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt' | 'memberCode' | 'totalVisits'>): Member {
    const gym = this.getActiveGym();
    const count = this.db.members.filter((m) => m.gymId === gym.id).length + 1;
    const prefix = gym.settings?.memberIdPrefix || 'FIT';
    const memberCode = `${prefix}-${String(count).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newMember: Member = {
      ...data,
      id: `mem_${Date.now()}`,
      gymId: gym.id,
      memberCode,
      qrToken: `${prefix}_${memberCode}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      totalVisits: 0,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      status: calculateMembershipStatus(data.membershipEndDate, 7, data.status),
    };

    this.db.members.unshift(newMember);

    // Record initial payment if paid
    if (newMember.totalPaid > 0) {
      const receiptNo = `${gym.settings?.receiptPrefix || 'REC'}-${new Date().getFullYear()}-${String(
        this.db.payments.length + 1
      ).padStart(6, '0')}`;
      this.db.payments.unshift({
        id: `pay_${Date.now()}`,
        gymId: gym.id,
        receiptNumber: receiptNo,
        memberId: newMember.id,
        memberName: `${newMember.firstName} ${newMember.lastName}`,
        memberCode: newMember.memberCode,
        planId: newMember.currentPlanId,
        planName: newMember.currentPlanName,
        amount: newMember.totalPaid,
        paymentMethod: 'upi',
        paymentDate: newMember.membershipStartDate,
        balanceRemaining: newMember.balanceDue,
        collectedByUserName: this.getCurrentUser().name,
        notes: 'Initial joining payment',
        status: 'completed',
        createdAt: now,
      });
    }

    this.logAudit('CREATE', 'member', newMember.id, `Created member ${newMember.firstName} ${newMember.lastName}`);
    this.notify();
    api.members.create(newMember).catch(() => {});
    return newMember;
  }

  public updateMember(id: string, updates: Partial<Member>): Member {
    const index = this.db.members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const updated = {
      ...this.db.members[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updated.membershipEndDate) {
      updated.status = calculateMembershipStatus(updated.membershipEndDate, 7, updated.status);
    }
    this.db.members[index] = updated;
    this.logAudit('UPDATE', 'member', id, `Updated member ${updated.firstName} ${updated.lastName}`);
    this.notify();
    api.members.update(id, updates).catch(() => {});
    return updated;
  }

  public deleteMember(id: string) {
    this.db.members = this.db.members.filter((m) => m.id !== id);
    this.logAudit('DELETE', 'member', id, 'Deleted member');
    this.notify();
    api.members.delete(id).catch(() => {});
  }

  // --- Attendance ---
  public getAttendance(date?: string): AttendanceRecord[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.getCurrentUser().role === 'super_admin';
    const targetDate = date || new Date().toISOString().split('T')[0];

    return this.db.attendance.filter((a) => (isSuperAdmin || a.gymId === gymId) && a.date === targetDate);
  }

  public recordAttendance(memberId: string, method: 'qr_code' | 'manual' | 'barcode' | 'kiosk' = 'manual'): AttendanceRecord {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('Member not found');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Check duplicate check-in within window
    const existing = this.db.attendance.find(
      (a) => a.memberId === memberId && a.date === dateStr
    );
    if (existing) {
      return existing;
    }

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      gymId: member.gymId,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberCode,
      date: dateStr,
      time: timeStr,
      checkInTime: timeStr,
      method,
      checkInMethod: method,
      staffName: this.getCurrentUser().name,
      status: 'present',
      createdAt: now.toISOString(),
    };

    this.db.attendance.unshift(record);

    // Update member visit count
    const mIdx = this.db.members.findIndex((m) => m.id === memberId);
    if (mIdx !== -1) {
      this.db.members[mIdx].totalVisits = (this.db.members[mIdx].totalVisits || 0) + 1;
      this.db.members[mIdx].lastVisitDate = dateStr;
    }

    this.notify();
    api.attendance.mark(record).catch(() => {});
    return record;
  }

  // --- Payments ---
  public getPayments(): PaymentRecord[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.getCurrentUser().role === 'super_admin';
    return this.db.payments.filter((p) => isSuperAdmin || p.gymId === gymId);
  }

  public recordPayment(data: {
    memberId: string;
    amount: number;
    paymentMethod: any;
    referenceNumber?: string;
    notes?: string;
  }): PaymentRecord {
    const member = this.getMemberById(data.memberId);
    if (!member) throw new Error('Member not found');

    const gym = this.getActiveGym();
    const now = new Date();
    const receiptNumber = `${gym.settings?.receiptPrefix || 'REC'}-${now.getFullYear()}-${String(
      this.db.payments.length + 1
    ).padStart(6, '0')}`;

    const newBalance = Math.max(0, (member.balanceDue || 0) - data.amount);

    const payment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      gymId: member.gymId,
      receiptNumber,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberCode,
      planId: member.currentPlanId,
      planName: member.currentPlanName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: now.toISOString().split('T')[0],
      referenceNumber: data.referenceNumber,
      collectedByUserName: this.getCurrentUser().name,
      balanceRemaining: newBalance,
      notes: data.notes,
      status: 'completed',
      createdAt: now.toISOString(),
    };

    this.db.payments.unshift(payment);

    // Update member totalPaid and balanceDue
    const mIdx = this.db.members.findIndex((m) => m.id === data.memberId);
    if (mIdx !== -1) {
      this.db.members[mIdx].totalPaid = (this.db.members[mIdx].totalPaid || 0) + data.amount;
      this.db.members[mIdx].balanceDue = newBalance;
    }

    this.logAudit('PAYMENT', 'payment', payment.id, `Collected ${gym.settings.currencySymbol}${data.amount} from ${member.firstName}`);
    this.notify();
    api.payments.create(payment).catch(() => {});
    return payment;
  }

  // --- Plans ---
  public getPlans(): MembershipPlan[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.getCurrentUser().role === 'super_admin';
    return this.db.plans.filter((p) => isSuperAdmin || p.gymId === gymId);
  }

  public addPlan(data: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>): MembershipPlan {
    const gymId = this.getActiveGymId();
    const newPlan: MembershipPlan = {
      ...data,
      id: `plan_${Date.now()}`,
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.db.plans.push(newPlan);
    this.notify();
    api.plans.create(newPlan).catch(() => {});
    return newPlan;
  }

  public deletePlan(id: string) {
    this.db.plans = this.db.plans.filter((p) => p.id !== id);
    this.notify();
  }

  // --- Trainers ---
  public getTrainers(): Trainer[] {
    const gymId = this.getActiveGymId();
    const isSuperAdmin = this.getCurrentUser().role === 'super_admin';
    return this.db.trainers.filter((t) => isSuperAdmin || t.gymId === gymId);
  }

  public addTrainer(data: Omit<Trainer, 'id' | 'gymId' | 'createdAt'>): Trainer {
    const gymId = this.getActiveGymId();
    const newTrainer: Trainer = {
      ...data,
      id: `trn_${Date.now()}`,
      gymId,
      createdAt: new Date().toISOString(),
    };
    this.db.trainers.push(newTrainer);
    this.notify();
    api.trainers.create(newTrainer).catch(() => {});
    return newTrainer;
  }

  public updateTrainer(id: string, updates: Partial<Trainer>): Trainer {
    const idx = this.db.trainers.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Trainer not found');
    this.db.trainers[idx] = { ...this.db.trainers[idx], ...updates };
    this.notify();
    api.trainers.update(id, updates).catch(() => {});
    return this.db.trainers[idx];
  }

  public deleteTrainer(id: string) {
    this.db.trainers = this.db.trainers.filter((t) => t.id !== id);
    this.notify();
    api.trainers.delete(id).catch(() => {});
  }

  // --- Workouts & Diets ---
  public getWorkouts(): WorkoutPlan[] {
    const gymId = this.getActiveGymId();
    return this.db.workouts.filter((w) => w.gymId === gymId);
  }

  public createWorkout(data: Omit<WorkoutPlan, 'id' | 'gymId' | 'createdAt'>): WorkoutPlan {
    const newWo: WorkoutPlan = {
      ...data,
      id: `wo_${Date.now()}`,
      gymId: this.getActiveGymId(),
      createdAt: new Date().toISOString(),
    };
    this.db.workouts.push(newWo);
    this.notify();
    api.workouts.create(newWo).catch(() => {});
    return newWo;
  }

  public getDiets(): DietPlan[] {
    const gymId = this.getActiveGymId();
    return this.db.diets.filter((d) => d.gymId === gymId);
  }

  public createDietPlan(data: Omit<DietPlan, 'id' | 'gymId' | 'createdAt'>): DietPlan {
    const newDiet: DietPlan = {
      ...data,
      id: `diet_${Date.now()}`,
      gymId: this.getActiveGymId(),
      createdAt: new Date().toISOString(),
    };
    this.db.diets.push(newDiet);
    this.notify();
    api.diets.create(newDiet).catch(() => {});
    return newDiet;
  }

  // --- Progress / Measurements ---
  public getMeasurements(memberId?: string): ProgressRecord[] {
    if (memberId) {
      return this.db.progress.filter((p) => p.memberId === memberId);
    }
    const gymId = this.getActiveGymId();
    return this.db.progress.filter((p) => p.gymId === gymId);
  }

  public recordMeasurement(data: Omit<ProgressRecord, 'id' | 'gymId' | 'createdAt'>): ProgressRecord {
    const record: ProgressRecord = {
      ...data,
      id: `prog_${Date.now()}`,
      gymId: this.getActiveGymId(),
      createdAt: new Date().toISOString(),
    };
    this.db.progress.unshift(record);
    this.notify();
    api.progress.create(record).catch(() => {});
    return record;
  }

  // --- Gym Settings ---
  public updateGym(id: string, updates: Partial<Gym>): Gym {
    const idx = this.db.gyms.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Gym not found');
    this.db.gyms[idx] = { ...this.db.gyms[idx], ...updates };
    this.notify();
    api.gyms.update(id, updates).catch(() => {});
    return this.db.gyms[idx];
  }

  // --- Audit Logs & Notifications ---
  public getAuditLogs(): AuditLog[] {
    const gymId = this.getActiveGymId();
    return this.db.auditLogs.filter((l) => !l.gymId || l.gymId === gymId);
  }

  public logAudit(action: string, entity: string, entityId: string, details: string) {
    const user = this.getCurrentUser();
    const log: AuditLog = {
      id: `log_${Date.now()}`,
      gymId: this.getActiveGymId(),
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
  }

  public getNotifications(): AppNotification[] {
    return this.db.notifications;
  }

  public markNotificationAsRead(id: string) {
    const notif = this.db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.db.notifications.forEach((n) => (n.isRead = true));
    this.notify();
  }

  public resetToDemo() {
    localStorage.removeItem(STORAGE_KEY);
    this.db = this.loadInitialData();
    this.notify();
  }
}

export const store = new Store();
