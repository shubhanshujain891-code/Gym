import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import mysql from 'mysql2/promise';

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

  // In-memory fallback / cache if direct DB not connected yet
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
  // API Routes
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      port: PORT,
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
      } catch (err) {
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
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      // Fallback if dist not yet built
      app.get('*', (_req, res) => {
        res.send('<html><body><h1>Application is starting up...</h1><p>Please refresh in a moment.</p></body></html>');
      });
    }
  }

  // -------------------------------------------------------------
  // Start HTTP Listener
  // -------------------------------------------------------------
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitManage SaaS Server running on http://0.0.0.0:${PORT} (Node ${process.version})`);
  });

  return server;
}

// Auto-start when executed directly
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
