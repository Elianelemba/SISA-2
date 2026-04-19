import React, { useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { 
  Home, 
  Settings as SettingsIcon, 
  Calendar, 
  Activity as ActivityIcon, 
  User, 
  Moon, 
  Droplet, 
  Lock, 
  RefreshCcw, 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  ExternalLink,
  Search,
  Plus,
  Star,
  Play,
  Heart,
  Flame,
  Utensils,
  PlusCircle,
  Folder,
  History,
  Edit2,
  CheckCircle,
  Download,
  MoreVertical,
  Maximize2,
  ChevronDown
} from 'lucide-react';

/**
 * SCREEN DEFINITIONS
 */
type Screen = 'onboarding' | 'dashboard' | 'settings' | 'consultations' | 'sleep' | 'meditate' | 'activity' | 'profile' | 'search' | 'login' | 'signup';

/**
 * SEARCHABLE CONTENT DATA
 */
interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: 'Meditação' | 'Especialista' | 'Atividade' | 'Documento';
  image: string;
  screen: Screen;
}

const SEARCH_DATA: SearchItem[] = [
  { id: 'm1', title: 'Quietude da Montanha', description: 'Meditação guiada de 15 min por Elena Vance', type: 'Meditação', image: 'https://picsum.photos/seed/lake_dawn/200/200', screen: 'meditate' },
  { id: 'm2', title: 'Calma Matinal', description: 'Comece o dia com serenidade - 10 min', type: 'Meditação', image: 'https://picsum.photos/seed/dew/200/200', screen: 'meditate' },
  { id: 'm3', title: 'Jornada do Sono', description: 'Relaxe profundamente para um sono reparador', type: 'Meditação', image: 'https://picsum.photos/seed/stars/200/200', screen: 'meditate' },
  { id: 'e1', title: 'Dr. Ricardo Silva', description: 'Cardiologista • CRM 12345', type: 'Especialista', image: 'https://picsum.photos/seed/doctor_r/200/200', screen: 'consultations' },
  { id: 'e2', title: 'Dra. Sofia Lima', description: 'Clínico Geral • CRM 67890', type: 'Especialista', image: 'https://picsum.photos/seed/doc_suggest_1/200/200', screen: 'consultations' },
  { id: 'a1', title: 'Corrida Matinal', description: 'Cardio intenso para ativar o metabolismo', type: 'Atividade', image: 'https://picsum.photos/seed/activity/200/200', screen: 'activity' },
  { id: 'a2', title: 'Yoga Restaurativo', description: 'Flexibilidade e relaxamento muscular', type: 'Atividade', image: 'https://picsum.photos/seed/yoga/200/200', screen: 'activity' },
  { id: 'd1', title: 'Exames de Sangue', description: 'Relatório completo de Março 2024', type: 'Documento', image: 'https://picsum.photos/seed/doc/200/200', screen: 'profile' },
  { id: 'd2', title: 'Receita Médica', description: 'Prescrições ativas e histórico', type: 'Documento', image: 'https://picsum.photos/seed/folder/200/200', screen: 'profile' },
];

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentScreen('dashboard');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simple navigation helper
  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'onboarding' && <Onboarding key="onboarding" onStart={(s) => navigateTo(s || 'signup')} />}
          {currentScreen === 'dashboard' && <Dashboard key="dashboard" onNavigate={navigateTo} user={user} />}
          {currentScreen === 'settings' && <Settings key="settings" />}
          {currentScreen === 'consultations' && <Consultations key="consultations" onNavigate={navigateTo} />}
          {currentScreen === 'sleep' && <SleepInsights key="sleep" />}
          {currentScreen === 'meditate' && <Meditate key="meditate" onNavigate={navigateTo} />}
          {currentScreen === 'activity' && <Activity key="activity" onNavigate={navigateTo} />}
          {currentScreen === 'profile' && <Profile key="profile" setScreen={navigateTo} user={user} />}
          {currentScreen === 'search' && <SearchScreen key="search" setScreen={navigateTo} />}
          {currentScreen === 'login' && <Login key="login" onNavigate={navigateTo} />}
          {currentScreen === 'signup' && <Signup key="signup" onNavigate={navigateTo} />}
        </AnimatePresence>
      </div>

      {/* Navigation Bars (Only visible after onboarding and not on auth screens) */}
      {currentScreen !== 'onboarding' && currentScreen !== 'login' && currentScreen !== 'signup' && (
        <BottomNavBar currentScreen={currentScreen} onNavigate={navigateTo} />
      )}
    </div>
  );
}

/**
 * COMPONENTS
 */

// --- LAYOUT COMPONENTS ---

function TopAppBar({ title, rightElement, leftElement, onSearchClick }: { title: string, rightElement?: ReactNode, leftElement?: ReactNode, onSearchClick?: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {leftElement || (
          <button className="text-primary hover:bg-primary/5 p-2 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        )}
        <h1 className="text-2xl font-black text-primary tracking-tighter font-display uppercase">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {onSearchClick && (
          <button 
            onClick={onSearchClick}
            className="p-2.5 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
          >
            <Search size={22} strokeWidth={2.5} />
          </button>
        )}
        {rightElement || (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm">
            <img 
              referrerPolicy="no-referrer"
              src="https://picsum.photos/seed/user123/100/100" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}

function BottomNavBar({ currentScreen, onNavigate }: { currentScreen: Screen, onNavigate: (s: Screen) => void }) {
  const tabs: { id: Screen, label: string, icon: any }[] = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'activity', label: 'Foco', icon: ActivityIcon },
    { id: 'consultations', label: 'Saúde', icon: Calendar },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl z-50 border-t border-surface-container flex justify-around items-center px-4 pt-3 pb-8 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id || (tab.id === 'profile' && currentScreen === 'settings');
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-sky-100 text-primary' : 'text-outline-variant hover:text-primary'}`}
          >
            <tab.icon size={24} className={isActive ? 'fill-current' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * SEARCH SCREEN COMPONENT
 */
interface SearchScreenProps { setScreen: (s: Screen) => void; key?: string; }
function SearchScreen({ setScreen }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const filtered = SEARCH_DATA.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  return (
    <motion.div 
      key="search"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="min-h-screen bg-background"
    >
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl px-6 py-4 flex items-center gap-4 border-b border-surface-container shadow-sm">
        <button 
          onClick={() => setScreen('dashboard')}
          className="p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-outline px-3">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input 
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm"
            placeholder="Pesquisar meditações, médicos, treinos..."
          />
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto pb-40">
        <AnimatePresence mode="popLayout">
          {query === '' ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-20 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-outline">
                <Search size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-on-surface">Comece a digitar...</h3>
                <p className="text-on-surface-variant text-sm font-medium">Explore tudo o que Aura tem para oferecer.</p>
              </div>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest px-1">Resultados Encontrados ({results.length})</h3>
              <div className="space-y-4">
                {results.map((item) => (
                  <motion.button
                    layout
                    key={item.id}
                    onClick={() => setScreen(item.screen)}
                    className="w-full flex items-center p-4 bg-white rounded-3xl border border-surface-container shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-none shadow-inner bg-surface-container">
                      <img 
                        referrerPolicy="no-referrer"
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                    </div>
                    <div className="ml-4 flex-1 text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{item.type}</span>
                      </div>
                      <h4 className="font-extrabold text-lg leading-tight text-on-surface">{item.title}</h4>
                      <p className="text-xs text-on-surface-variant font-medium line-clamp-1">{item.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-outline transition-transform group-hover:translate-x-1" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-20 text-center space-y-4"
            >
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-error/40">
                <HelpCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-on-surface">Nenhum resultado</h3>
                <p className="text-on-surface-variant text-sm font-medium">Tente uma palavra-chave diferente como "Yoga" ou "Médico".</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

interface OnboardingProps { onStart: (screen?: Screen) => void; key?: string; }
function Onboarding({ onStart }: OnboardingProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative flex flex-col"
    >
      <div className="relative h-[65vh] overflow-hidden">
        <img 
          referrerPolicy="no-referrer"
          src="https://picsum.photos/seed/meditation_relax/1000/1500" 
          alt="Yoga" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute top-12 left-8">
          <span className="text-primary font-black tracking-tighter text-3xl font-display">SANCTUARY</span>
        </div>
      </div>

      <div className="flex-1 bg-background -mt-16 relative z-10 px-8 pt-12 pb-16 flex flex-col max-w-2xl mx-auto w-full">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl font-extrabold text-on-surface tracking-tight leading-[1.1] font-display">
            Bem-vindo ao Aura Wellness
          </h1>
          <p className="text-lg text-on-surface-variant font-light leading-relaxed">
            Sua jornada para o equilíbrio começa aqui. Monitore sua saúde em tempo real e agende consultas com especialistas de forma simplificada e intuitiva.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-16">
          <div className="bg-surface-container/50 p-5 rounded-3xl space-y-3 shadow-sm border border-surface-container">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <ActivityIcon className="text-primary" size={24} />
            </div>
            <p className="text-sm font-bold text-primary">Monitoramento inteligente</p>
          </div>
          <div className="bg-surface-container/50 p-5 rounded-3xl space-y-3 translate-y-4 shadow-sm border border-surface-container">
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
              <Calendar className="text-secondary" size={24} />
            </div>
            <p className="text-sm font-bold text-secondary">Agendamento rápido</p>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => onStart()}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all duration-300 flex justify-center items-center gap-2 group"
          >
            Começar Agora
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-center mt-6 text-sm text-on-surface-variant/60 font-medium">
            Já possui uma conta? <button onClick={() => onStart('login')} className="text-primary font-bold hover:underline">Entrar</button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * LOGIN SCREEN
 */
function Login({ onNavigate }: ScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase não configurado.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      key="login"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background px-8 py-12 flex flex-col max-w-md mx-auto w-full"
    >
      <button 
        onClick={() => onNavigate('onboarding')}
        className="self-start p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors mb-10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <div className="space-y-3 mb-12">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-display">Benvindo</h1>
        <p className="text-on-surface-variant font-medium">Inicie sessão para continuar a sua jornada de bem-estar.</p>
      </div>

      <form className="space-y-6" onSubmit={handleLogin}>
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full bg-white border border-surface-container rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Palavra-passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-surface-container rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium shadow-sm"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button type="button" className="text-xs font-bold text-primary hover:underline">Esqueceu-se da senha?</button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-12 space-y-6">
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-surface-container"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-outline-variant uppercase tracking-widest">Ou continue com</span>
          <div className="flex-grow border-t border-surface-container"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center p-4 bg-white border border-surface-container rounded-2xl hover:bg-surface-container-low transition-colors shadow-sm">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">Google</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-white border border-surface-container rounded-2xl hover:bg-surface-container-low transition-colors shadow-sm">
             <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            <span className="font-bold text-sm">GitHub</span>
          </button>
        </div>
      </div>

      <p className="text-center mt-auto pt-8 text-sm text-on-surface-variant font-medium">
        Novo por aqui? <button onClick={() => onNavigate('signup')} className="text-primary font-black hover:underline">Crie uma conta</button>
      </p>
    </motion.div>
  );
}

/**
 * SIGNUP SCREEN
 */
function Signup({ onNavigate }: ScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase não configurado.');
      setLoading(false);
      return;
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      key="signup"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background px-8 py-12 flex flex-col max-w-md mx-auto w-full"
    >
      <button 
        onClick={() => onNavigate('onboarding')}
        className="self-start p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors mb-10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <div className="space-y-3 mb-10">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-display">Começar</h1>
        <p className="text-on-surface-variant font-medium">Crie a sua conta e dê o primeiro passo para uma vida mais saudável.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSignup}>
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Nome Completo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <User size={18} />
            </div>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sara Silva"
              className="w-full bg-white border border-surface-container rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Mail size={18} />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full bg-white border border-surface-container rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Palavra-passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Criar senha forte"
              className="w-full bg-white border border-surface-container rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium shadow-sm"
            />
          </div>
          <p className="text-[10px] text-on-surface-variant ml-1 font-bold uppercase tracking-wide">Mínimo de 8 caracteres</p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
        >
          {loading ? 'Criando Conta...' : 'Criar Conta'}
        </button>
      </form>

      <div className="mt-10">
        <p className="text-center text-xs text-on-surface-variant/70 leading-relaxed px-4">
          Ao registar-se, concorda com os nossos <button className="font-bold underline">Termos de Serviço</button> e <button className="font-bold underline">Política de Privacidade</button>.
        </p>
      </div>

      <p className="text-center mt-auto pt-8 text-sm text-on-surface-variant font-medium">
        Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-primary font-black hover:underline">Iniciar Sessão</button>
      </p>
    </motion.div>
  );
}

interface ScreenProps { onNavigate: (s: Screen) => void; key?: string; }
interface AuthenticatedScreenProps extends ScreenProps { user: SupabaseUser | null; }

function Dashboard({ onNavigate, user }: AuthenticatedScreenProps) {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <TopAppBar title="Sanctuary" onSearchClick={() => onNavigate('search')} />
      
      <main className="px-6 py-8 space-y-10 max-w-5xl mx-auto">
        <section className="space-y-1">
          <p className="text-on-surface-variant font-medium text-sm">Bem-vinda de volta, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sara'}</p>
          <h2 className="text-[2.75rem] font-extrabold tracking-tight font-display leading-tight">Vitalidade de Hoje</h2>
          <div className="h-1.5 w-12 bg-primary rounded-full mt-3"></div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-white rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-surface-container">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <ActivityIcon className="text-secondary" size={18} />
                <span className="text-on-surface-variant font-bold text-xs tracking-widest uppercase">META DIÁRIA</span>
              </div>
              <div>
                <span className="text-6xl font-black tracking-tighter text-on-surface">10,240</span>
                <span className="text-xl font-medium text-on-surface-variant ml-2">passos</span>
              </div>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto md:mx-0 font-light leading-relaxed">
                Alcançou <span className="text-secondary font-bold">85%</span> da sua meta de movimento. Faltam apenas 1,760 passos!
              </p>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-container" cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12"></circle>
                <circle className="text-secondary" cx="96" cy="96" r="88" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="552.92" strokeDashoffset="82.93" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">85%</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Concluído</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-primary rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Heart fill="currentColor" size={24} />
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">Repouso</span>
              </div>
              <div className="mt-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">72</span>
                  <span className="text-lg opacity-80 font-medium tracking-normal">BPM</span>
                </div>
                <p className="mt-4 text-sm opacity-90 leading-relaxed font-light">
                  Seus batimentos cardíacos estão na zona ideal hoje.
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none scale-150 translate-x-12 translate-y-12">
              <ActivityIcon size={120} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface-container-low rounded-[2rem] p-8 flex flex-col space-y-4 border border-surface-container-high transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <Moon className="text-tertiary" size={28} />
              <span className="text-tertiary font-bold text-[10px] uppercase tracking-widest">Qualidade Boa</span>
            </div>
            <div>
              <span className="text-5xl font-black tracking-tighter leading-none">7h 45m</span>
              <p className="text-on-surface-variant font-medium mt-2">Sono Total</p>
            </div>
            <div className="mt-auto pt-6 space-y-2">
               <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                 <span>REM / Profundo</span>
                 <span>78%</span>
               </div>
               <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-tertiary rounded-full" style={{ width: '78%' }}></div>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-tertiary to-[#004944dd] rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:col-span-2 relative overflow-hidden shadow-lg group">
             <div className="relative z-10 text-center md:text-left space-y-5">
                <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">Sugestão Inteligente</span>
                <h4 className="text-3xl font-extrabold tracking-tight leading-tight">Sessão de Yoga Noturna</h4>
                <p className="text-white/70 max-w-sm font-light leading-relaxed">Com base nos seus níveis de atividade, um alongamento suave de 15 minutos melhorará seu sono hoje.</p>
                <button className="bg-white text-tertiary font-bold px-8 py-3.5 rounded-2xl shadow-xl active:scale-95 transition-all text-sm group-hover:bg-sky-50">
                  Iniciar Rotina
                </button>
             </div>
             <div className="relative z-10 flex justify-center items-center">
                <div className="w-40 h-40 rounded-full border-8 border-white/10 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset="110" strokeLinecap="round" />
                    </svg>
                   <div className="text-center">
                      <span className="block text-3xl font-black">75%</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Proteínas</span>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
}

function Consultations({ onNavigate }: ScreenProps) {
  return (
    <motion.div 
      key="consultations"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <TopAppBar title="Sanctuary" onSearchClick={() => onNavigate('search')} />
      
      <main className="px-6 py-8 space-y-10 max-w-5xl mx-auto">
        <section className="space-y-8">
          <div className="space-y-2">
            <p className="text-on-surface-variant font-bold text-[10px] tracking-widest uppercase mb-1">Cuidado Personalizado</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-primary font-display">Sua Saúde em Foco</h2>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Search size={22} strokeWidth={2.5} />
            </div>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border-none rounded-2xl py-5 pl-14 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium"
              placeholder="Buscar por especialista ou área..."
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
            {['Geral', 'Nutrição', 'Psicologia', 'Dermatologia', 'Fisio'].map((cat, i) => (
              <button 
                key={cat}
                className={`flex-none px-6 py-3 rounded-full font-bold text-sm transition-all shadow-sm ${i === 0 ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-extrabold tracking-tight">Próximas Consultas</h3>
            <button className="text-sm font-bold text-primary hover:underline">Ver tudo</button>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 flex flex-col space-y-7 shadow-sm border border-surface-container transition-transform hover:scale-[1.01]">
            <div className="flex justify-between items-start">
              <div className="flex gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner ring-4 ring-surface-container">
                  <img src="https://picsum.photos/seed/doctor_r/300/300" alt="Specialist" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xl leading-tight">Dr. Ricardo Silva</h4>
                  <p className="text-sm text-on-surface-variant font-medium">Cardiologista • CRM 12345</p>
                </div>
              </div>
              <span className="bg-secondary-container text-secondary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Confirmado</span>
            </div>
            
            <div className="bg-surface-container-low rounded-[1.5rem] p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Calendar size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Data & Hora</p>
                  <p className="text-base font-bold">Hoje, às 14:30</p>
                </div>
              </div>
              <button className="bg-primary text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-primary/10 active:scale-95 transition-transform hover:bg-primary-container">
                Entrar
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-extrabold tracking-tight px-2">Especialistas Sugeridos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="bg-white p-6 rounded-[2rem] text-center space-y-4 shadow-sm border border-surface-container-low hover:border-primary transition-all group cursor-pointer">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-surface-container group-hover:ring-primary/10 transition-all border-4 border-white">
                  <img src={`https://picsum.photos/seed/doc_suggest_${id}/300/300`} alt="Doc" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-base leading-none mb-1">Dra. Sofia Lima</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Clínico Geral</p>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-secondary">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-black">5.0</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 active:scale-90 transition-transform z-40">
        <Plus size={32} strokeWidth={3} />
      </button>
    </motion.div>
  );
}

function Settings() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <TopAppBar title="Configurações" />
      
      <main className="max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-14">
          <p className="text-primary font-black tracking-[0.2em] uppercase text-[10px] mb-3">Preferências do Sistema</p>
          <h2 className="text-5xl font-black tracking-tighter font-display mb-5">Configurações</h2>
          <div className="h-2 w-12 bg-primary rounded-full"></div>
        </div>

        <div className="space-y-14">
          <section className="space-y-8">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-2xl font-extrabold tracking-tight uppercase text-[12px] tracking-[0.1em] text-on-surface-variant">Notificações</h3>
               <SettingsIcon size={20} className="text-outline" />
            </div>
            <div className="space-y-4">
               {[
                 { title: 'Lembretes de Hidratação', sub: 'Alertas diários para beber água', checked: true },
                 { title: 'Resumo Semanal', sub: 'Relatório de progresso aos domingos', checked: false }
               ].map((item) => (
                 <div key={item.title} className="flex items-center justify-between p-7 bg-white rounded-[2rem] shadow-sm border border-surface-container hover:bg-sky-50 transition-colors">
                   <div>
                     <p className="font-extrabold text-lg text-on-surface leading-tight mb-1">{item.title}</p>
                     <p className="text-sm text-on-surface-variant font-medium">{item.sub}</p>
                   </div>
                   <div className={`w-14 h-8 rounded-full relative transition-all cursor-pointer ${item.checked ? 'bg-secondary' : 'bg-surface-container-highest'}`}>
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${item.checked ? 'left-7' : 'left-1'}`}></div>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-8">
             <h3 className="text-2xl font-extrabold tracking-[0.1em] text-[12px] uppercase text-on-surface-variant">Privacidade e Segurança</h3>
             <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-surface-container">
                <button className="w-full flex items-center justify-between p-7 hover:bg-sky-50 transition-colors border-b border-surface-container-low group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Lock size={22} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg">Biometria (FaceID/Digital)</span>
                  </div>
                  <ChevronRight size={24} className="text-outline transition-transform group-hover:translate-x-1" />
                </button>
                <button className="w-full flex items-center justify-between p-7 hover:bg-sky-50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <RefreshCcw size={22} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg">Ocultar Dados Sensíveis</span>
                  </div>
                  <ChevronRight size={24} className="text-outline transition-transform group-hover:translate-x-1" />
                </button>
             </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
}

function Profile({ setScreen, user }: { setScreen: (s: Screen) => void; user: SupabaseUser | null; key?: string; }) {
  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      setScreen('login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <TopAppBar 
        title="Sanctuary" 
        rightElement={
          <button onClick={() => setScreen('settings')} className="p-3.5 bg-primary rounded-2xl text-white shadow-xl active:scale-95 transition-all hover:bg-primary-container">
            <Edit2 size={20} strokeWidth={2.5} />
          </button>
        }
      />
      
      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-12">
        <section className="space-y-8">
          <div className="space-y-2">
            <span className="text-secondary font-black tracking-[0.2em] text-[10px] uppercase">Wellness Member</span>
            <h2 className="text-5xl font-black tracking-tighter text-primary font-display">{user?.user_metadata?.full_name || 'Isabella Rossi'}</h2>
            <p className="text-on-surface-variant font-bold text-lg">{user?.email || 'isabella.rossi@sanctuary.health'}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-3 bg-error/10 text-error rounded-2xl font-bold text-sm hover:bg-error hover:text-white transition-all shadow-sm"
          >
            Sair da Conta
          </button>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-surface-container flex flex-col gap-3 group transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-secondary">
                <Droplet size={18} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Blood Type</span>
              </div>
              <span className="text-5xl font-black tracking-widest text-on-surface group-hover:text-primary transition-colors">O+</span>
            </div>
            <div className="bg-white p-7 rounded-[2rem] shadow-sm border border-surface-container flex flex-col gap-3 group transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-2 text-error">
                <PlusCircle size={18} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Allergies</span>
              </div>
              <span className="text-base font-extrabold text-on-surface leading-tight">Penicilina, Amendoim</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-black tracking-tight px-1 font-display">Health Records</h3>
          <div className="space-y-4">
            {[
              { title: 'Meus Documentos', sub: 'Exam reports & ID cards', icon: Folder, color: 'bg-primary/10 text-primary' },
              { title: 'Histórico Médico', sub: 'Past procedures & diagnoses', icon: History, color: 'bg-secondary-container/50 text-secondary' },
              { title: 'Configurações Extras', sub: 'Privacidade & Preferências', icon: SettingsIcon, color: 'bg-tertiary-fixed-dim/40 text-tertiary' }
            ].map((item) => (
              <button key={item.title} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white hover:bg-sky-50 transition-all group border border-surface-container shadow-sm">
                <div className="flex items-center gap-5">
                  <div className={`${item.color} p-4 rounded-2xl transition-colors group-hover:bg-primary group-hover:text-white`}>
                    <item.icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-left space-y-0.5">
                    <p className="font-extrabold text-lg leading-none">{item.title}</p>
                    <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-outline-variant group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </section>

        <section className="bg-primary rounded-[2.75rem] p-10 overflow-hidden relative group shadow-2xl shadow-primary/20">
          <div className="relative z-10 max-w-[75%] space-y-5">
            <h4 className="text-white text-3xl font-black leading-[1.1] tracking-tight">Ready for your annual check-up?</h4>
            <p className="text-primary-fixed-dim text-base font-light leading-relaxed">Your preventive health metrics suggest a visit next month.</p>
            <button className="bg-white text-primary px-10 py-4 rounded-[1.25rem] font-bold text-sm shadow-xl active:scale-95 transition-all hover:bg-sky-50">
                Schedule Now
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-56 h-56 opacity-10 transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
             <ActivityIcon size={200} className="text-white" />
          </div>
        </section>
      </main>
    </motion.div>
  );
}

function SleepInsights() {
  return (
    <motion.div 
      key="sleep"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-32 px-6 pt-10 space-y-10 max-w-2xl mx-auto"
    >
      <section className="relative overflow-hidden rounded-[2.5rem] p-8 bg-gradient-to-br from-primary to-primary-container text-white shadow-xl">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-white/60 font-bold tracking-widest text-[10px] uppercase mb-1">QUALIDADE DESTA NOITE</p>
            <h2 className="text-5xl font-black tracking-tighter">Excelente</h2>
          </div>
          <div className="text-6xl font-black">85<span className="text-xl font-medium opacity-60">/100</span></div>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3 relative z-10">
          {['Adormecida', 'Latência', 'Eficiência'].map((label, i) => (
            <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-center text-center">
              <p className="text-[10px] font-bold uppercase opacity-60 mb-2">{label}</p>
              <p className="text-lg font-bold">{['7h 42m', '12m', '94%'][i]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight font-display">Arquitetura do Sono</h3>
          <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">14 - 15 Abr</span>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 border border-surface-container shadow-sm">
          <div className="h-44 w-full flex items-end gap-[4px] mb-8">
            {[40, 70, 85, 45, 60, 95, 30, 75, 50, 80, 20, 65, 90, 40, 55, 75].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-lg transition-all hover:scale-y-105 shadow-sm ${i % 4 === 0 ? 'bg-primary' : i % 4 === 1 ? 'bg-primary/60' : i % 4 === 2 ? 'bg-secondary' : 'bg-primary-container/20'}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-surface-container">
            {['Acordado', 'REM', 'Leve', 'Profundo'].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-primary-container/20' : i === 1 ? 'bg-primary/60' : i === 2 ? 'bg-secondary' : 'bg-primary'}`}></div>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6 p-8 bg-surface-container rounded-[2.5rem] relative overflow-hidden">
        <div className="relative z-10 max-w-[80%] space-y-4">
           <span className="text-primary font-black italic text-sm">Aura Wisdom</span>
           <h4 className="text-3xl font-extrabold tracking-tight leading-tight">"O sono é a ponte entre o desespero e a esperança."</h4>
           <p className="text-on-surface-variant text-base font-medium">— C.L. Harper</p>
        </div>
      </section>
    </motion.div>
  );
}

function Meditate({ onNavigate }: ScreenProps) {
  return (
    <motion.div 
      key="meditate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-32"
    >
      <TopAppBar title="Aura" onSearchClick={() => onNavigate('search')} />
      <main className="pt-8 px-6 max-w-2xl mx-auto space-y-10">
        <section>
          <div className="relative group cursor-pointer overflow-hidden rounded-[3rem] bg-surface-container shadow-2xl">
             <div className="aspect-[16/11] overflow-hidden">
                <img src="https://picsum.photos/seed/lake_dawn/1200/800" alt="Lake" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-10 w-full space-y-4">
                <span className="bg-secondary-container text-secondary font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-widest">Sessão em Destaque</span>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-sm">Quietude da Montanha</h2>
                <div className="flex items-center gap-3 text-white/90 text-sm font-medium">
                   <ActivityIcon size={16} /> 15 min • Guided by Elena Vance
                </div>
                <button className="bg-white text-primary px-10 py-4 rounded-[1.25rem] font-black shadow-2xl flex items-center gap-3 group/btn text-sm active:scale-95 transition-all">
                   <Play size={20} fill="currentColor" className="group-hover/btn:scale-125 transition-transform" /> Começar Sessão
                </button>
             </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-2xl font-black tracking-tight text-primary font-display">Explorar Caminhos</h3>
            <span className="text-[10px] font-black text-outline-variant uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Ver Todos</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
            {['Relaxamento', 'Foco', 'Sono', 'Ansiedade', 'Energia'].map((cat, i) => (
              <div key={cat} className={`flex-none px-10 py-4 rounded-[1.75rem] flex items-center gap-3 transition-all cursor-pointer shadow-sm ${i === 0 ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}>
                 <span className="text-sm font-extrabold">{cat}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
           <h3 className="text-2xl font-black tracking-tight text-primary font-display px-2">Prática Diária</h3>
           <div className="space-y-4">
              {[
                { title: 'Calma Matinal', time: '10 MIN', teacher: 'SARAH JENKINS', img: 'dew' },
                { title: 'Jornada do Sono', time: '45 MIN', teacher: 'MARCUS THORNE', img: 'stars' },
                { title: 'Pausa Criativa', time: '15 MIN', teacher: 'ELENA VANCE', img: 'creativity' }
              ].map((item) => (
                <div key={item.title} className="flex items-center p-5 bg-white rounded-[2.5rem] shadow-sm border border-surface-container hover:shadow-xl transition-all group cursor-pointer">
                   <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-inner flex-none ring-4 ring-background">
                      <img src={`https://picsum.photos/seed/${item.img}/300/300`} alt="Practice" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   </div>
                   <div className="ml-6 flex-grow space-y-1.5">
                      <h4 className="font-black text-on-surface text-xl leading-none">{item.title}</h4>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">{item.time} • {item.teacher}</p>
                   </div>
                   <div className="w-12 h-12 rounded-full bg-surface-container text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <Play size={24} fill="currentColor" strokeWidth={0} />
                   </div>
                </div>
              ))}
           </div>
        </section>
      </main>
    </motion.div>
  );
}

function Activity({ onNavigate }: ScreenProps) {
  return (
    <motion.div 
      key="activity"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32"
    >
      <TopAppBar title="Sanctuary" onSearchClick={() => onNavigate('search')} />
      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
           <div className="md:col-span-12 space-y-8">
              <div className="space-y-2">
                 <span className="text-on-surface-variant font-black tracking-widest uppercase text-[10px]">Visão Geral Diária</span>
                 <h2 className="text-6xl font-black font-display tracking-tighter text-primary leading-[0.9]">Energia & <br/>Vitalidade</h2>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-surface-container relative overflow-hidden">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left space-y-3">
                       <span className="text-sm font-bold text-on-surface-variant uppercase tracking-[0.1em]">Calorias Restantes</span>
                       <div className="flex items-baseline gap-3">
                          <span className="text-[5rem] font-black text-primary tracking-tighter leading-none">1,420</span>
                          <span className="text-2xl font-bold text-on-surface-variant">kcal</span>
                       </div>
                    </div>
                    <div className="flex gap-14 pr-4">
                       {[
                         { label: 'Gasto', color: 'bg-secondary', pct: 65 },
                         { label: 'Consumo', color: 'bg-primary', pct: 40 }
                       ].map((m) => (
                         <div key={m.label} className="flex flex-col items-center gap-2">
                            <div className="w-2.5 h-24 bg-surface-container rounded-full overflow-hidden flex flex-col justify-end">
                               <div className={`${m.color} w-full rounded-full transition-all duration-[1500ms] shadow-[0_0_20px_rgba(0,0,0,0.1)]`} style={{ height: `${m.pct}%` }}></div>
                            </div>
                            <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mt-2">{m.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-surface-container-low p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm border border-surface-container-high transition-transform hover:scale-[1.02]">
                <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase text-on-surface-variant tracking-[0.2em] mb-1">Queimadas</p>
                   <p className="text-4xl font-black text-on-surface">540 <span className="text-lg font-bold text-on-surface-variant">kcal</span></p>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Flame size={32} fill="currentColor" strokeWidth={0} />
                </div>
              </div>
              <div className="bg-primary p-8 rounded-[2.5rem] flex items-center justify-between text-white shadow-xl transition-transform hover:scale-[1.02]">
                <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase text-white/50 tracking-[0.2em] mb-1">Consumidas</p>
                   <p className="text-4xl font-black">1,120 <span className="text-lg font-medium text-white/60">kcal</span></p>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                    <Utensils size={32} strokeWidth={2.5} />
                </div>
              </div>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <button className="bg-gradient-to-br from-primary to-[#074469dd] text-white py-8 px-10 rounded-[2rem] flex items-center justify-between group active:scale-95 transition-all shadow-2xl shadow-primary/20">
              <div className="text-left space-y-1.5">
                 <span className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em]">Fluxo de Treino</span>
                 <span className="text-2xl font-black tracking-tight">Registrar Exercício</span>
              </div>
              <PlusCircle size={40} strokeWidth={2.5} className="group-hover:rotate-180 transition-transform duration-500" />
           </button>
           <button className="bg-white text-primary py-8 px-10 rounded-[2rem] flex items-center justify-between group active:scale-95 transition-all border border-surface-container shadow-sm hover:shadow-md transition-shadow">
              <div className="text-left space-y-1.5">
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Alimentação</span>
                 <span className="text-2xl font-black tracking-tight">Adicionar Refeição</span>
              </div>
              <div className="bg-primary/5 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Utensils size={36} strokeWidth={2.5} />
              </div>
           </button>
        </section>

        <section className="space-y-8">
           <div className="flex justify-between items-end px-4">
              <h3 className="text-3xl font-black font-display tracking-tight leading-none text-primary">Atividades Recentes</h3>
              <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Ver tudo</button>
           </div>
           <div className="space-y-5">
              {[
                { title: 'Corrida Matinal', time: 'Hoje, 07:30 • 45 min', kcal: '+320', color: 'bg-secondary text-white', icon: ActivityIcon },
                { title: 'Yoga Restaurativo', time: 'Ontem, 18:00 • 60 min', kcal: '+120', color: 'bg-tertiary text-white', icon: User },
                { title: 'Treino de Força', time: '22 Out • 50 min', kcal: '+280', color: 'bg-primary text-white', icon: ActivityIcon }
              ].map((act, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm border border-surface-container hover:shadow-lg transition-all group cursor-pointer">
                   <div className={`${act.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-none shadow-md transition-transform group-hover:scale-110`}>
                      <act.icon size={28} strokeWidth={2.5} />
                   </div>
                   <div className="flex-1 space-y-1">
                      <h4 className="font-extrabold text-xl leading-none">{act.title}</h4>
                      <p className="text-sm text-on-surface-variant font-bold uppercase tracking-wider opacity-60">{act.time}</p>
                   </div>
                   <div className="text-right">
                      <span className="block font-black text-3xl leading-none text-secondary tracking-tighter mb-1">{act.kcal}</span>
                      <span className="text-[10px] font-black text-outline uppercase tracking-widest">kcal</span>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </main>
    </motion.div>
  );
}
