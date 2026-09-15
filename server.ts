import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import mysql from 'mysql2/promise';
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
} from './src/utils/mockData';

// Safe root/dirname resolution across ESM and CJS bundles
const getDirname = () => {
  if (typeof __dirname !== 'undefined') return __dirname;
  return process.cwd();
};

export async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const currentDir = getDirname();

  app.use(cors());
  app.use(express.json());

  // In-memory data store with live state
  let gyms = [...INITIAL_GYMS];
  let users = [...INITIAL_USERS];
  let plans = [...INITIAL_PLANS];
  let trainers = [...INITIAL_TRAINERS];
  let members = [...INITIAL_MEMBERS];
  let payments = [...INITIAL_PAYMENTS];
  let attendance = [...INITIAL_ATTENDANCE];
  let workouts = [...INITIAL_WORKOUTS];
  let diets = [...INITIAL_DIETS];
  let progress = [...INITIAL_PROGRESS];

  // MySQL connection pool if configured
  let dbPool: mysql.Pool | null = null;

  const initDbPool = () => {
    if (dbPool) return dbPool;
    const host = process.env.MYSQL_HOST || process.env.DB_HOST;
    const user = process.env.MYSQL_USER || process.env.DB_USER;
    const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
    const database = process.env.MYSQL_DATABASE || process.env.DB_NAME;
    const port = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306;

    if (host && user && database) {
      try {
        dbPool = mysql.createPool({
          host,
          port,
          user,
          password: password || '',
          database,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 7000,
        });
      } catch (e) {
        console.warn('Could not initialize MySQL connection pool:', e);
      }
    }
    return dbPool;
  };

  // -------------------------------------------------------------
  // System & Health Endpoints
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      port: PORT,
      membersCount: members.length,
      paymentsCount: payments.length,
    });
  });

  // Database status
  app.get('/api/status', async (_req, res) => {
    const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'srv1234.hstgr.io';
    const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'u123456789_fitmanage';
    let connected = false;
    let tablesFound = 12;

    const pool = initDbPool();
    if (pool) {
      try {
        const [rows] = await pool.query('SHOW TABLES');
        if (Array.isArray(rows)) {
          connected = true;
          tablesFound = rows.length;
        }
      } catch {
        connected = false;
      }
    }

    res.json({
      success: true,
      data: {
        connected,
        provider: 'Hostinger MySQL',
        host,
        database,
        tablesFound,
        lastChecked: new Date().toLocaleTimeString(),
      },
    });
  });

  // MySQL dynamic connection tester (used in Settings > Database diagnostics)
  app.post('/api/mysql/test', async (req, res) => {
    const { host, port = 3306, user, password, database, ssl } = req.body;

    if (!host || !user || !database) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Host, Username, and Database name are required to test MySQL connection.',
        },
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection({
        host,
        port: parseInt(port, 10) || 3306,
        user,
        password: password || '',
        database,
        connectTimeout: 6000,
        ssl: ssl ? { rejectUnauthorized: false } : undefined,
      });

      const [rows] = await connection.query('SHOW TABLES');
      const tables = Array.isArray(rows)
        ? rows.map((r: any) => Object.values(r)[0] as string)
        : [];

      await connection.end();

      return res.json({
        success: true,
        data: {
          connected: true,
          message: `Successfully connected to Hostinger MySQL at ${host}. Found ${tables.length} tables.`,
          tables,
        },
      });
    } catch (err: any) {
      if (connection) {
        try {
          await connection.end();
        } catch {
          // ignore
        }
      }

      let tip = '';
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        tip = 'Access denied. Verify user credentials and make sure Remote MySQL allows your host IP or "%" wildcard in Hostinger hPanel.';
      } else if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
        tip = 'Host unreachable. Check the MySQL hostname (e.g. sql123.hostinger.com) and ensure Remote MySQL is enabled in hPanel.';
      } else if (err.code === 'ER_BAD_DB_ERROR') {
        tip = 'Database does not exist. Verify the exact database name created in Hostinger Databases.';
      }

      return res.json({
        success: false,
        error: {
          code: err.code || 'CONNECTION_FAILED',
          message: `${err.message || 'Connection failed.'} ${tip}`.trim(),
        },
      });
    }
  });

  // Schema retrieval for export or phpMyAdmin copy-paste
  app.get('/api/mysql/schema', (_req, res) => {
    try {
      const candidates = [
        path.join(process.cwd(), 'hostinger_mysql_schema.sql'),
        path.join(process.cwd(), 'public', 'hostinger_mysql_schema.sql'),
        path.join(currentDir, 'hostinger_mysql_schema.sql'),
        path.join(currentDir, 'public', 'hostinger_mysql_schema.sql'),
      ];

      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const sql = fs.readFileSync(p, 'utf-8');
          return res.json({ success: true, data: { schema: sql } });
        }
      }

      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schema file not found on server' },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  });

  // -------------------------------------------------------------
  // REST API: Members
  // -------------------------------------------------------------
  app.get('/api/members', (req, res) => {
    const { gymId } = req.query;
    let list = members.filter((m) => !m.isArchived);
    if (gymId && typeof gymId === 'string') {
      list = list.filter((m) => m.gymId === gymId);
    }
    res.json({ success: true, data: list });
  });

  app.get('/api/members/:id', (req, res) => {
    const member = members.find((m) => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      });
    }
    res.json({ success: true, data: member });
  });

  app.post('/api/members', (req, res) => {
    const payload = req.body;
    const activeGym = gyms[0];
    const count = members.filter((m) => m.gymId === (payload.gymId || activeGym.id)).length + 1;
    const prefix = activeGym.settings?.memberIdPrefix || 'FIT';
    const memberCode = payload.memberCode || `${prefix}-${String(count).padStart(6, '0')}`;
    const now = new Date().toISOString();

    const newMember = {
      ...payload,
      id: payload.id || `mem_${Date.now()}`,
      gymId: payload.gymId || activeGym.id,
      memberCode,
      qrToken: payload.qrToken || `${prefix}_${memberCode}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      totalVisits: payload.totalVisits || 0,
      isArchived: false,
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };

    members.unshift(newMember);

    // If initial payment was provided, also record payment
    if (newMember.totalPaid > 0) {
      const receiptNo = `${activeGym.settings?.receiptPrefix || 'REC'}-${new Date().getFullYear()}-${String(
        payments.length + 1
      ).padStart(6, '0')}`;
      payments.unshift({
        id: `pay_${Date.now()}`,
        gymId: newMember.gymId,
        receiptNumber: receiptNo,
        memberId: newMember.id,
        memberName: `${newMember.firstName} ${newMember.lastName}`,
        memberCode: newMember.memberCode,
        planId: newMember.currentPlanId,
        planName: newMember.currentPlanName,
        amount: newMember.totalPaid,
        paymentMethod: 'upi',
        paymentDate: newMember.membershipStartDate || now.split('T')[0],
        balanceRemaining: newMember.balanceDue || 0,
        collectedByUserName: 'Staff Reception',
        notes: 'Initial joining payment',
        status: 'completed',
        createdAt: now,
      });
    }

    res.status(201).json({ success: true, data: newMember });
  });

  app.put('/api/members/:id', (req, res) => {
    const idx = members.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      });
    }
    const updated = {
      ...members[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    members[idx] = updated;
    res.json({ success: true, data: updated });
  });

  app.delete('/api/members/:id', (req, res) => {
    const idx = members.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      });
    }
    members.splice(idx, 1);
    res.json({ success: true, data: { deleted: true } });
  });

  app.post('/api/members/:id/check-in', (req, res) => {
    const member = members.find((m) => m.id === req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' },
      });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const method = req.body.method || 'manual';

    const record = {
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
      staffName: req.body.staffName || 'Reception Scanner',
      status: 'present' as const,
      createdAt: now.toISOString(),
    };

    attendance.unshift(record);
    member.totalVisits = (member.totalVisits || 0) + 1;
    member.lastVisitDate = dateStr;

    res.json({ success: true, data: record });
  });

  // -------------------------------------------------------------
  // REST API: Attendance
  // -------------------------------------------------------------
  app.get('/api/attendance', (req, res) => {
    const { date, gymId } = req.query;
    let list = attendance;
    if (gymId && typeof gymId === 'string') {
      list = list.filter((a) => a.gymId === gymId);
    }
    if (date && typeof date === 'string') {
      list = list.filter((a) => a.date === date);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/attendance', (req, res) => {
    const record = {
      ...req.body,
      id: req.body.id || `att_${Date.now()}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    attendance.unshift(record);

    const mIdx = members.findIndex((m) => m.id === record.memberId);
    if (mIdx !== -1) {
      members[mIdx].totalVisits = (members[mIdx].totalVisits || 0) + 1;
      members[mIdx].lastVisitDate = record.date || new Date().toISOString().split('T')[0];
    }

    res.status(201).json({ success: true, data: record });
  });

  app.post('/api/attendance/verify-qr', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token or code is required' },
      });
    }

    const clean = String(token).trim().toUpperCase();
    const member = members.find(
      (m) =>
        m.memberCode.toUpperCase() === clean ||
        (m.qrToken && m.qrToken.toUpperCase().includes(clean)) ||
        m.phone === clean
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBER_NOT_FOUND', message: `No active member found matching ${token}` },
      });
    }

    if (member.status === 'expired') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'MEMBERSHIP_EXPIRED',
          message: `Access denied. ${member.firstName}'s membership expired on ${member.membershipEndDate}.`,
        },
      });
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const record = {
      id: `att_${Date.now()}`,
      gymId: member.gymId,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      memberCode: member.memberCode,
      date: dateStr,
      time: timeStr,
      checkInTime: timeStr,
      method: 'qr_code' as const,
      checkInMethod: 'qr_code' as const,
      staffName: 'Automated QR Turnstile',
      status: 'present' as const,
      createdAt: now.toISOString(),
    };

    attendance.unshift(record);
    member.totalVisits = (member.totalVisits || 0) + 1;
    member.lastVisitDate = dateStr;

    res.json({
      success: true,
      data: {
        verified: true,
        member,
        record,
        message: `Access Granted! Welcome ${member.firstName} ${member.lastName}.`,
      },
    });
  });

  // -------------------------------------------------------------
  // REST API: Payments & Billing
  // -------------------------------------------------------------
  app.get('/api/payments', (req, res) => {
    const { gymId, memberId } = req.query;
    let list = payments;
    if (gymId && typeof gymId === 'string') {
      list = list.filter((p) => p.gymId === gymId);
    }
    if (memberId && typeof memberId === 'string') {
      list = list.filter((p) => p.memberId === memberId);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/payments', (req, res) => {
    const payload = req.body;
    const now = new Date();
    const activeGym = gyms.find((g) => g.id === payload.gymId) || gyms[0];
    const receiptNumber =
      payload.receiptNumber ||
      `${activeGym.settings?.receiptPrefix || 'REC'}-${now.getFullYear()}-${String(
        payments.length + 1
      ).padStart(6, '0')}`;

    const member = members.find((m) => m.id === payload.memberId);
    const amount = Number(payload.amount) || 0;
    const newBalance = member ? Math.max(0, (member.balanceDue || 0) - amount) : 0;

    const payment = {
      id: payload.id || `pay_${Date.now()}`,
      gymId: payload.gymId || (member ? member.gymId : activeGym.id),
      receiptNumber,
      memberId: payload.memberId,
      memberName: payload.memberName || (member ? `${member.firstName} ${member.lastName}` : 'Member'),
      memberCode: payload.memberCode || (member ? member.memberCode : 'FIT-000000'),
      planId: payload.planId || member?.currentPlanId,
      planName: payload.planName || member?.currentPlanName,
      amount,
      paymentMethod: payload.paymentMethod || 'upi',
      paymentDate: payload.paymentDate || now.toISOString().split('T')[0],
      referenceNumber: payload.referenceNumber,
      collectedByUserName: payload.collectedByUserName || 'Staff Reception',
      balanceRemaining: payload.balanceRemaining !== undefined ? payload.balanceRemaining : newBalance,
      notes: payload.notes,
      status: 'completed' as const,
      createdAt: payload.createdAt || now.toISOString(),
    };

    payments.unshift(payment);

    if (member) {
      member.totalPaid = (member.totalPaid || 0) + amount;
      member.balanceDue = newBalance;
    }

    res.status(201).json({ success: true, data: payment });
  });

  // -------------------------------------------------------------
  // REST API: Plans
  // -------------------------------------------------------------
  app.get('/api/plans', (req, res) => {
    const { gymId } = req.query;
    let list = plans;
    if (gymId && typeof gymId === 'string') {
      list = list.filter((p) => p.gymId === gymId);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/plans', (req, res) => {
    const newPlan = {
      ...req.body,
      id: req.body.id || `plan_${Date.now()}`,
      gymId: req.body.gymId || gyms[0].id,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    plans.push(newPlan);
    res.status(201).json({ success: true, data: newPlan });
  });

  app.delete('/api/plans/:id', (req, res) => {
    const idx = plans.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Plan not found' } });
    }
    plans.splice(idx, 1);
    res.json({ success: true, data: { deleted: true } });
  });

  // -------------------------------------------------------------
  // REST API: Trainers
  // -------------------------------------------------------------
  app.get('/api/trainers', (req, res) => {
    const { gymId } = req.query;
    let list = trainers;
    if (gymId && typeof gymId === 'string') {
      list = list.filter((t) => t.gymId === gymId);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/trainers', (req, res) => {
    const newTrainer = {
      ...req.body,
      id: req.body.id || `trn_${Date.now()}`,
      gymId: req.body.gymId || gyms[0].id,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    trainers.push(newTrainer);
    res.status(201).json({ success: true, data: newTrainer });
  });

  app.put('/api/trainers/:id', (req, res) => {
    const idx = trainers.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trainer not found' } });
    }
    trainers[idx] = { ...trainers[idx], ...req.body };
    res.json({ success: true, data: trainers[idx] });
  });

  app.delete('/api/trainers/:id', (req, res) => {
    const idx = trainers.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trainer not found' } });
    }
    trainers.splice(idx, 1);
    res.json({ success: true, data: { deleted: true } });
  });

  // -------------------------------------------------------------
  // REST API: Gyms & Settings
  // -------------------------------------------------------------
  app.get('/api/gyms', (_req, res) => {
    res.json({ success: true, data: gyms });
  });

  app.get('/api/gyms/:id', (req, res) => {
    const gym = gyms.find((g) => g.id === req.params.id);
    if (!gym) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Gym not found' } });
    }
    res.json({ success: true, data: gym });
  });

  app.put('/api/gyms/:id', (req, res) => {
    const idx = gyms.findIndex((g) => g.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Gym not found' } });
    }
    gyms[idx] = { ...gyms[idx], ...req.body };
    res.json({ success: true, data: gyms[idx] });
  });

  // -------------------------------------------------------------
  // REST API: Workouts & Diets
  // -------------------------------------------------------------
  app.get('/api/workouts', (req, res) => {
    const { gymId } = req.query;
    let list = workouts;
    if (gymId && typeof gymId === 'string') {
      list = list.filter((w) => w.gymId === gymId);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/workouts', (req, res) => {
    const newWo = {
      ...req.body,
      id: req.body.id || `wo_${Date.now()}`,
      gymId: req.body.gymId || gyms[0].id,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    workouts.push(newWo);
    res.status(201).json({ success: true, data: newWo });
  });

  app.delete('/api/workouts/:id', (req, res) => {
    const idx = workouts.findIndex((w) => w.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Workout plan not found' } });
    }
    workouts.splice(idx, 1);
    res.json({ success: true, data: { deleted: true } });
  });

  app.get('/api/diets', (req, res) => {
    const { gymId } = req.query;
    let list = diets;
    if (gymId && typeof gymId === 'string') {
      list = list.filter((d) => d.gymId === gymId);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/diets', (req, res) => {
    const newDiet = {
      ...req.body,
      id: req.body.id || `diet_${Date.now()}`,
      gymId: req.body.gymId || gyms[0].id,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    diets.push(newDiet);
    res.status(201).json({ success: true, data: newDiet });
  });

  app.delete('/api/diets/:id', (req, res) => {
    const idx = diets.findIndex((d) => d.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Diet plan not found' } });
    }
    diets.splice(idx, 1);
    res.json({ success: true, data: { deleted: true } });
  });

  // -------------------------------------------------------------
  // REST API: Progress / Measurements
  // -------------------------------------------------------------
  app.get('/api/progress', (req, res) => {
    const { memberId, gymId } = req.query;
    let list = progress;
    if (memberId && typeof memberId === 'string') {
      list = list.filter((p) => p.memberId === memberId);
    }
    if (gymId && typeof gymId === 'string') {
      list = list.filter((p) => p.gymId === gymId);
    }
    res.json({ success: true, data: list });
  });

  app.post('/api/progress', (req, res) => {
    const record = {
      ...req.body,
      id: req.body.id || `prog_${Date.now()}`,
      gymId: req.body.gymId || gyms[0].id,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    progress.unshift(record);
    res.status(201).json({ success: true, data: record });
  });

  // -------------------------------------------------------------
  // Frontend Serving (Vite in Dev, Dist static in Production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*all', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Fallback if dist not yet built
      app.get('*all', (_req, res) => {
        res.send('<html><body><h1>Application is starting up...</h1><p>Please refresh in a moment.</p></body></html>');
      });
    }
  }

  // -------------------------------------------------------------
  // Start HTTP Listener
  // -------------------------------------------------------------
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`YGOS - FitManage SaaS Server running on http://0.0.0.0:${PORT} (Node ${process.version})`);
  });

  return server;
}

// Auto-start when executed directly
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

