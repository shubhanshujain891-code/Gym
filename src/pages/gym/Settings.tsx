import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { api } from '../../services/api';
import {
  Server,
  Database,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Key,
  Globe,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const store = useStore();
  const gym = store.getActiveGym();
  const mysqlStatus = store.getMySQLStatus();

  const [activeTab, setActiveTab] = useState<'mysql' | 'gym' | 'schema'>('mysql');

  // MySQL Form states
  const [host, setHost] = useState(mysqlStatus.host || 'srv1234.hstgr.io');
  const [port, setPort] = useState(3306);
  const [user, setUser] = useState('u123456789_fituser');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState(mysqlStatus.database || 'u123456789_fitmanage');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Gym Profile states
  const [gymName, setGymName] = useState(gym.name);
  const [gymAddress, setGymAddress] = useState(gym.address || '');
  const [gymPhone, setGymPhone] = useState(gym.phone || '');
  const [currencySymbol, setCurrencySymbol] = useState(gym.settings.currencySymbol || '₹');
  const [savedGymMsg, setSavedGymMsg] = useState(false);

  // Copy feedback
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await api.testMySQLConnection({
        host,
        port,
        user,
        password,
        database,
      });

      if (res.success) {
        setTestResult({
          success: true,
          message: res.data?.message || 'Successfully connected to Hostinger MySQL instance!',
        });
        store.setMySQLStatus({
          connected: true,
          provider: 'Hostinger MySQL',
          host,
          database,
          tablesFound: res.data?.tables?.length || 12,
          lastChecked: new Date().toLocaleTimeString(),
        });
      } else {
        setTestResult({
          success: false,
          message: res.error?.message || 'Could not connect. Please check credentials or Remote MySQL whitelist in Hostinger.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSaveGymProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateGym(gym.id, {
      name: gymName,
      address: gymAddress,
      phone: gymPhone,
      settings: {
        ...gym.settings,
        name: gymName,
        address: gymAddress,
        phone: gymPhone,
        currencySymbol,
      },
    });
    setSavedGymMsg(true);
    setTimeout(() => setSavedGymMsg(false), 3000);
  };

  const envSnippet = `# Hostinger MySQL Configuration
MYSQL_HOST=${host}
MYSQL_PORT=${port}
MYSQL_USER=${user}
MYSQL_PASSWORD=${password || 'YOUR_HOSTINGER_DB_PASSWORD'}
MYSQL_DATABASE=${database}
DATABASE_URL=mysql://${user}:${password || 'YOUR_HOSTINGER_DB_PASSWORD'}@${host}:${port}/${database}`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System & Database Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Hostinger MySQL credentials, phpMyAdmin schema, and gym preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('mysql')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'mysql'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <span>Hostinger MySQL</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'schema'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQL Schema (.sql)</span>
          </button>
          <button
            onClick={() => setActiveTab('gym')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'gym'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Gym Profile</span>
          </button>
        </div>
      </div>

      {activeTab === 'mysql' && (
        <div className="space-y-6">
          {/* Hostinger Setup Instructions Box */}
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span>How to connect your Hostinger MySQL database</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 mt-3">
              <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">1. Create Database</span>
                <p className="text-slate-600 leading-relaxed">
                  Log in to <strong>Hostinger hPanel</strong> → Go to <strong>Databases → MySQL Databases</strong>. Create a new database & username.
                </p>
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">2. Allow Remote MySQL</span>
                <p className="text-slate-600 leading-relaxed">
                  In hPanel, click <strong>Remote MySQL</strong> and add <code className="bg-slate-100 px-1 rounded">%</code> or your server IP so external apps can connect.
                </p>
              </div>
              <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">3. Import Schema</span>
                <p className="text-slate-600 leading-relaxed">
                  Open <strong>phpMyAdmin</strong> from Hostinger, click your database, go to the <strong>SQL</strong> tab and run the included <code className="bg-slate-100 px-1 rounded">hostinger_mysql_schema.sql</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Hostinger MySQL Parameters</h3>
              <p className="text-xs text-slate-500 mb-4">
                Enter your Hostinger database details to verify direct MySQL connectivity
              </p>

              <form onSubmit={handleTestConnection} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 uppercase mb-1">
                      MySQL Host
                    </label>
                    <input
                      type="text"
                      required
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="e.g. srv1234.hstgr.io or localhost"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">Port</label>
                    <input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">
                      Database User
                    </label>
                    <input
                      type="text"
                      required
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      placeholder="u123456789_fituser"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase mb-1">
                      Database Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    required
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="u123456789_fitmanage"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={testLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {testLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testing Hostinger Connection...</span>
                      </>
                    ) : (
                      <>
                        <Server className="w-3.5 h-3.5" />
                        <span>Test & Save Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Environment Variables & Details */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Environment File (.env)</h3>
                  <button
                    onClick={handleCopyEnv}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedEnv ? 'Copied!' : 'Copy .env'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Paste these parameters into your server environment or Hostinger Node.js app environment variables:
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {envSnippet}
                </pre>
              </div>

              {/* Status card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-sm text-slate-900">Hostinger MySQL Engine</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Host: <code className="text-slate-700">{host}</code> • DB: <code className="text-slate-700">{database}</code>
                  </p>
                </div>
                <button
                  onClick={() => store.resetToDemo()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Reset Demo Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hostinger MySQL Schema (SQL)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Execute this SQL in Hostinger phpMyAdmin to initialize all tables, foreign keys, and indexes
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/hostinger_mysql_schema.sql"
                download="hostinger_mysql_schema.sql"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql file</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-700">
            <p className="font-bold text-slate-900">How to run in Hostinger phpMyAdmin:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600">
              <li>Log in to your <strong>Hostinger hPanel</strong>.</li>
              <li>Go to <strong>Databases → phpMyAdmin</strong> next to your created MySQL database.</li>
              <li>Click on the <strong>SQL</strong> tab at the top of phpMyAdmin.</li>
              <li>Open the <code className="bg-slate-200 px-1 rounded font-bold">hostinger_mysql_schema.sql</code> file or import it via the <strong>Import</strong> tab.</li>
              <li>Click <strong>Go</strong>. All 12 tables and seed accounts are ready!</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'gym' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">Gym Profile & Branding</h3>
          <p className="text-xs text-slate-500 mb-4">Update receipt headers, gym name, and currency format</p>

          <form onSubmit={handleSaveGymProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Gym / Studio Name</label>
              <input
                type="text"
                required
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Official Contact Phone</label>
                <input
                  type="text"
                  value={gymPhone}
                  onChange={(e) => setGymPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="₹ or $ or €"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">Physical Address</label>
              <textarea
                rows={2}
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {savedGymMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Gym settings updated successfully!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
