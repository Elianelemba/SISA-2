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
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  MoveRight
} from 'lucide-react';

/**
 * SCREEN DEFINITIONS
 */
type Screen = 'onboarding' | 'tutorial' | 'quiz' | 'dashboard' | 'settings' | 'consultations' | 'sleep' | 'meditate' | 'activity' | 'profile' | 'search' | 'login' | 'signup' | 'all_specialists' | 'all_units';

/**
 * SEARCHABLE CONTENT DATA
 */
interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: 'Meditação' | 'Especialista' | 'Atividade' | 'Documento' | 'Hospital';
  image: string;
  screen: Screen;
}

const SEARCH_DATA: SearchItem[] = [
  { id: 'm1', title: 'Quietude da Montanha', description: 'Meditação guiada de 15 min por Elena Vance', type: 'Meditação', image: 'https://picsum.photos/seed/lake_dawn/200/200', screen: 'meditate' },
  { id: 'm2', title: 'Calma Matinal', description: 'Comece o dia com serenidade - 10 min', type: 'Meditação', image: 'https://picsum.photos/seed/dew/200/200', screen: 'meditate' },
  { id: 'm3', title: 'Jornada do Sono', description: 'Relaxe profundamente para um sono reparador', type: 'Meditação', image: 'https://picsum.photos/seed/stars/200/200', screen: 'meditate' },
  { id: 'e1', title: 'Dr. Ricardo Silva', description: 'Cardiologista • CRM 12345', type: 'Especialista', image: 'https://picsum.photos/seed/doc_1/200/200', screen: 'consultations' },
  { id: 'e2', title: 'Dra. Sofia Lima', description: 'Clínico Geral • CRM 67890', type: 'Especialista', image: 'https://picsum.photos/seed/doc_2/200/200', screen: 'consultations' },
  { id: 'e3', title: 'Dr. Marcos Santos', description: 'Nutricionista • CRN 7788', type: 'Especialista', image: 'https://picsum.photos/seed/doc_3/200/200', screen: 'consultations' },
  { id: 'e4', title: 'Dra. Ana Paula', description: 'Psicóloga • CRP 9900', type: 'Especialista', image: 'https://picsum.photos/seed/doc_4/200/200', screen: 'consultations' },
  { id: 'e5', title: 'Dr. Lucas Ferreira', description: 'Fisioterapeuta • CREFITO 1122', type: 'Especialista', image: 'https://picsum.photos/seed/doc_5/200/200', screen: 'consultations' },
  { id: 'h1', title: 'Hospital Central', description: 'Rua Principal, 123 • Aberto 24h', type: 'Hospital', image: 'https://picsum.photos/seed/hospital_1/200/200', screen: 'consultations' },
  { id: 'h2', title: 'Clínica Aura Wellness', description: 'Av. Saúde, 456 • Especialidades diversas', type: 'Hospital', image: 'https://picsum.photos/seed/clinic_1/200/200', screen: 'consultations' },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);

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
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-sans selection:bg-primary/20 overflow-x-hidden relative">
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={navigateTo} 
        user={user} 
      />
      
      {/* Dynamic Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {currentScreen === 'onboarding' && <Onboarding key="onboarding" onStart={(s) => navigateTo(s || 'signup')} />}
        {currentScreen === 'tutorial' && <Tutorial key="tutorial" onNavigate={navigateTo} />}
        {currentScreen === 'quiz' && <HealthQuiz key="quiz" onNavigate={navigateTo} onComplete={(data) => setQuizData(data)} />}
        {currentScreen === 'dashboard' && <Dashboard key="dashboard" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} user={user} quizData={quizData} />}
        {currentScreen === 'settings' && <Settings key="settings" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'consultations' && <Consultations key="consultations" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'all_specialists' && <AllSpecialists key="all_specialists" onNavigate={navigateTo} />}
        {currentScreen === 'all_units' && <AllHealthcareUnits key="all_units" onNavigate={navigateTo} />}
        {currentScreen === 'sleep' && <SleepInsights key="sleep" onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'meditate' && <Meditate key="meditate" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'activity' && <Activity key="activity" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'profile' && <Profile key="profile" setScreen={navigateTo} onMenuClick={() => setIsMenuOpen(true)} user={user} />}
        {currentScreen === 'search' && <SearchScreen key="search" setScreen={navigateTo} />}
        {currentScreen === 'login' && <Login key="login" onNavigate={navigateTo} />}
        {currentScreen === 'signup' && <Signup key="signup" onNavigate={navigateTo} />}
      </div>

      {/* Navigation Bars (Only visible after onboarding, tutorial, quiz and not on auth screens) */}
      {!['onboarding', 'tutorial', 'quiz', 'login', 'signup', 'all_specialists', 'all_units'].includes(currentScreen) && (
        <BottomNavBar currentScreen={currentScreen} onNavigate={navigateTo} />
      )}
    </div>
  );
}

/**
 * COMPONENTS
 */

// --- LAYOUT COMPONENTS ---

function Sidebar({ isOpen, onClose, onNavigate, user }: { isOpen: boolean, onClose: () => void, onNavigate: (s: Screen) => void, user: SupabaseUser | null }) {
  return (
    <div className={`fixed inset-0 z-[100] flex transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      <aside className={`relative w-[80%] max-w-[300px] bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-surface-container flex items-center justify-between">
          <h2 className="text-sm font-black text-primary tracking-tighter uppercase font-display">SISA</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-2 flex-1 overflow-y-auto">
          <div className="mb-4 flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
             <div className="w-10 h-10 rounded-full overflow-hidden bg-primary shadow-sm border-2 border-white">
                <img referrerPolicy="no-referrer" src="https://picsum.photos/seed/user123/100/100" alt="Me" className="w-full h-full object-cover" />
             </div>
             <div className="overflow-hidden">
                <p className="font-black text-xs text-primary tracking-tight truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}</p>
                <p className="text-[8px] text-primary/60 font-bold uppercase tracking-widest">Wellness Member</p>
             </div>
          </div>
          {[
            { id: 'dashboard', icon: Home, label: 'Início' },
            { id: 'activity', icon: ActivityIcon, label: 'Atividade' },
            { id: 'consultations', icon: Calendar, label: 'Consultas' },
            { id: 'meditate', icon: Moon, label: 'Meditar' },
            { id: 'sleep', icon: RefreshCcw, label: 'Sono' },
            { id: 'profile', icon: User, label: 'Perfil' },
            { id: 'settings', icon: SettingsIcon, label: 'Ajustes' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all font-bold group"
            >
              <item.icon size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-surface-container space-y-3">
           <div className="flex items-center gap-2 text-on-surface-variant px-2">
              <HelpCircle size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Suporte</span>
           </div>
           <p className="text-[8px] text-center text-outline font-medium opacity-60">v1.0.5 • SISA Health</p>
        </div>
      </aside>
    </div>
  );
}

function TopAppBar({ title, rightElement, leftElement, onSearchClick, onMenuClick }: { title: string, rightElement?: ReactNode, leftElement?: ReactNode, onSearchClick?: () => void, onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {leftElement || (
          <button 
            onClick={onMenuClick}
            className="text-primary hover:bg-primary/5 p-2 rounded-full transition-colors active:scale-90"
          >
            <Menu width={24} height={24} strokeWidth={2.5} />
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
    <div className="min-h-screen bg-background">
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
            placeholder="Meditações, médicos, hospitais..."
          />
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto pb-40">
        {query === '' ? (
          <div className="mt-16 text-center space-y-4">
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-outline">
              <Search size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">Comece a digitar...</h3>
              <p className="text-on-surface-variant text-xs font-medium">Explore tudo o que Aura tem para oferecer.</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">Resultados ({results.length})</h3>
            <div className="space-y-3">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.screen)}
                  className="w-full flex items-center p-3 bg-white rounded-2xl border border-surface-container shadow-sm group active:bg-surface-container"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-none bg-surface-container">
                    <img 
                      referrerPolicy="no-referrer"
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="ml-3 flex-1 text-left space-y-0.5">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none">{item.type}</span>
                    <h4 className="font-bold text-base leading-tight text-on-surface">{item.title}</h4>
                    <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">{item.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-outline" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-16 text-center space-y-4">
            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto text-error/40">
              <HelpCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">Nenhum resultado</h3>
              <p className="text-on-surface-variant text-xs font-medium">Tente uma palavra-chave diferente.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

interface OnboardingProps { onStart: (screen?: Screen) => void; key?: string; }
function Onboarding({ onStart }: OnboardingProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Header Image Section */}
      <div className="relative w-full h-[52vh] overflow-hidden">
        <img 
          referrerPolicy="no-referrer"
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000" 
          alt="Meditation" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-12 left-8">
          <span className="text-[#1a73e8] font-black tracking-tight text-3xl font-display uppercase">SISA</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-8 pt-8 pb-10 flex flex-col items-center text-center max-w-md mx-auto w-full">
        <div className="space-y-4 mb-10 w-full text-left px-2">
          <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight leading-[1.1] font-display">
            Bem-vindo ao<br />SISA Wellness
          </h1>
          <p className="text-lg text-[#5f6368] font-light leading-snug">
            Sua jornada para o equilíbrio começa aqui. Monitore sua saúde em tempo real e agende consultas com especialistas de forma simplificada e intuitiva.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-12 w-full">
          <div className="bg-[#f0f3f4] p-6 rounded-[2rem] flex flex-col items-start gap-4 shadow-sm h-full">
            <TrendingUp size={32} className="text-[#1a4d6e]" strokeWidth={2.5} />
            <p className="text-sm font-bold text-[#1a4d6e] leading-tight text-left">Monitoramento inteligente</p>
          </div>
          <div className="bg-[#f0f3f4] p-6 rounded-[2rem] flex flex-col items-start gap-4 shadow-sm h-full">
            <Calendar size={32} className="text-[#1a4d6e]" strokeWidth={2.5} />
            <p className="text-sm font-bold text-[#1a4d6e] leading-tight text-left">Agendamento rápido</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto w-full space-y-6">
          <button 
            onClick={() => onStart('tutorial')}
            className="w-full bg-[#1a4d6e] text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all flex justify-center items-center gap-3"
          >
            Começar
            <MoveRight size={24} strokeWidth={2.5} />
          </button>
          
          <p className="text-center text-[#5f6368] text-sm font-medium">
            Já possui uma conta? <button onClick={() => onStart('login')} className="text-[#1a4d6e] font-black hover:underline ml-1">Entrar</button>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * TUTORIAL SCREEN
 */
function Tutorial({ onNavigate }: ScreenProps) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Monitoramento 24/7",
      description: "Acompanhe seus sinais vitais, passos e sono em tempo real com precisão clínica.",
      icon: ActivityIcon,
      color: "bg-blue-500"
    },
    {
      title: "Consultas Rápidas",
      description: "Agende especialistas em segundos e realize teleconsultas diretamente pelo app.",
      icon: Calendar,
      color: "bg-emerald-500"
    },
    {
      title: "Mente Sã",
      description: "Acesse centenas de meditações guiadas e exercícios de respiração para controle da ansiedade.",
      icon: Moon,
      color: "bg-indigo-500"
    },
    {
      title: "Sua Saúde, Seus Dados",
      description: "Histórico médico completo e centralizado com segurança de ponta a ponta.",
      icon: Lock,
      color: "bg-rose-500"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onNavigate('quiz');
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 pt-20 pb-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className={`w-24 h-24 ${currentStep.color} rounded-3xl flex items-center justify-center text-white shadow-2xl mb-12`}>
          <currentStep.icon size={48} strokeWidth={2.5} />
        </div>
        
        <div className="space-y-4 max-w-xs">
          <h2 className="text-3xl font-black text-on-surface tracking-tighter leading-tight font-display">
            {currentStep.title}
          </h2>
          <p className="text-base text-on-surface-variant font-medium leading-relaxed">
            {currentStep.description}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-surface-container'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full bg-primary text-white py-4 rounded-xl font-black text-base shadow-xl active:scale-95 transition-all"
        >
          {step === steps.length - 1 ? 'Continuar' : 'Próximo'}
        </button>
      </div>
    </div>
  );
}

/**
 * HEALTH QUIZ SCREEN
 */
interface HealthQuizProps extends ScreenProps {
  onComplete: (data: any) => void;
}
function HealthQuiz({ onNavigate, onComplete }: HealthQuizProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<{
    goal: string[];
    gender: string;
    weight: string;
    height: string;
    activity: string;
  }>({
    goal: [],
    gender: '',
    weight: '',
    height: '',
    activity: ''
  });

  const steps = [
    {
      id: 'goal',
      question: "Qual o seu principal objetivo?",
      options: ['Melhorar Saúde', 'Emagrecer', 'Ganhar Músculo', 'Dormir Melhor'],
      multi: true
    },
    {
      id: 'gender',
      question: "Qual o seu sexo biológico?",
      options: ['Feminino', 'Masculino', 'Outro']
    },
    {
      id: 'weight',
      question: "Qual o seu peso atual?",
      type: 'input',
      placeholder: 'Peso em kg'
    },
    {
      id: 'height',
      question: "Qual a sua altura?",
      type: 'input',
      placeholder: 'Altura em cm'
    },
    {
      id: 'activity',
      question: "Qual seu nível de atividade?",
      options: ['Sedentário', 'Moderado', 'Ativo', 'Atleta']
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
      onNavigate('signup');
    }
  };

  const toggleOption = (option: string) => {
    const currentId = steps[step].id as keyof typeof data;
    const currentValues = data[currentId] as string[];
    
    if (currentValues.includes(option)) {
      setData({ ...data, [currentId]: currentValues.filter(o => o !== option) });
    } else {
      setData({ ...data, [currentId]: [...currentValues, option] });
    }
  };

  const handleOptionSelect = (option: string) => {
    if (steps[step].multi) {
      toggleOption(option);
    } else {
      setData({ ...data, [steps[step].id]: option });
      handleNext();
    }
  };

  const currentStep = (steps as any)[step];
  const isSelected = (option: string) => {
    const val = (data as any)[currentStep.id];
    return Array.isArray(val) ? val.includes(option) : val === option;
  };

  return (
    <div className="min-h-screen bg-surface px-8 pt-20 pb-12 flex flex-col">
      <div className="flex items-center justify-between mb-12">
        <div className="flex gap-1.5 flex-1">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-surface-container'}`} 
            />
          ))}
        </div>
        <span className="ml-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">{step + 1}/{steps.length}</span>
      </div>

      <div className="flex-1">
        <h2 className="text-3xl font-black text-on-surface tracking-tighter leading-tight font-display mb-10">
          {currentStep.question}
        </h2>

        <div className="space-y-3">
          {currentStep.options ? (
            <>
              <div className="space-y-3">
                {currentStep.options.map((option: string) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 ${
                      isSelected(option)
                      ? 'bg-primary/5 border-primary text-primary' 
                      : 'bg-white border-transparent text-on-surface hover:border-surface-container'
                    } shadow-sm active:scale-[0.98]`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      {currentStep.multi && isSelected(option) && <CheckCircle size={20} />}
                    </div>
                  </button>
                ))}
              </div>
              
              {currentStep.multi && (
                <button 
                  onClick={handleNext}
                  disabled={(data[currentStep.id as keyof typeof data] as string[]).length === 0}
                  className="w-full mt-8 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 active:scale-95 transition-all"
                >
                  Continuar
                </button>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <input 
                type="number"
                placeholder={currentStep.placeholder}
                value={(data as any)[currentStep.id]}
                onChange={(e) => setData({ ...data, [currentStep.id]: e.target.value })}
                className="w-full bg-white border-2 border-surface-container rounded-2xl p-5 text-xl font-black focus:border-primary outline-none transition-colors"
                autoFocus
              />
              <button 
                onClick={handleNext}
                disabled={!(data as any)[currentStep.id]}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 active:scale-95 transition-all"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-8">
        Essas informações nos ajudam a<br />personalizar sua experiência
      </p>
    </div>
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
    <div className="min-h-screen bg-background px-8 py-10 flex flex-col max-w-md mx-auto w-full">
      <button 
        onClick={() => onNavigate('onboarding')}
        className="self-start p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors mb-6"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <div className="space-y-2 mb-10">
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-display">Benvindo</h1>
        <p className="text-sm text-on-surface-variant font-medium">Inicie sessão para continuar.</p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[11px] font-bold">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline">
              <Mail size={16} />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full bg-white border border-surface-container rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Palavra-passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline">
              <Lock size={16} />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-surface-container rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm shadow-sm"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" className="text-[11px] font-bold text-primary hover:underline">Esqueceu-se da senha?</button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/30 active:scale-95 transition-all mt-2 disabled:opacity-50 text-sm"
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
    </div>
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
    <div className="min-h-screen bg-background px-8 py-10 flex flex-col max-w-md mx-auto w-full">
      <button 
        onClick={() => onNavigate('onboarding')}
        className="self-start p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors mb-6"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </button>

      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-extrabold text-on-surface tracking-tight font-display">Começar</h1>
        <p className="text-sm text-on-surface-variant font-medium">Crie a sua conta para uma vida mais saudável.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSignup}>
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-[11px] font-bold">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Nome Completo</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline">
              <User size={16} />
            </div>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sara Silva"
              className="w-full bg-white border border-surface-container rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">E-mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline">
              <Mail size={16} />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full bg-white border border-surface-container rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Palavra-passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-outline">
              <Lock size={16} />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Criar senha forte"
              className="w-full bg-white border border-surface-container rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm shadow-sm"
            />
          </div>
          <p className="text-[9px] text-on-surface-variant ml-1 font-bold uppercase tracking-wide">Mínimo de 8 caracteres</p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-xl font-black shadow-lg shadow-primary/30 active:scale-95 transition-all mt-4 disabled:opacity-50 text-sm"
        >
          {loading ? 'Criando Conta...' : 'Criar Conta'}
        </button>
      </form>

      <div className="mt-8">
        <p className="text-center text-[10px] text-on-surface-variant/70 leading-relaxed px-4">
          Ao registar-se, concorda com os nossos <button className="font-bold underline">Termos</button> e <button className="font-bold underline">Privacidade</button>.
        </p>
      </div>

      <p className="text-center mt-auto pt-8 text-sm text-on-surface-variant font-medium">
        Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-primary font-black hover:underline">Iniciar Sessão</button>
      </p>
    </div>
  );
}

interface ScreenProps { onNavigate: (s: Screen) => void; onMenuClick?: () => void; key?: string; }
interface AuthenticatedScreenProps extends ScreenProps { user: SupabaseUser | null; quizData?: any; }

function Dashboard({ onNavigate, onMenuClick, user, quizData }: AuthenticatedScreenProps) {
  const goals = quizData?.goal || [];
  
  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="px-6 py-6 space-y-8 max-w-5xl mx-auto">
        <section className="space-y-1">
          <p className="text-on-surface-variant font-medium text-xs">Bem-vinda, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sara'}</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight font-display">Vitalidade</h2>
            {goals.length > 0 && (
              <div className="flex gap-1">
                {goals.map((g: string) => (
                  <span key={g} className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="h-1 w-10 bg-primary rounded-full mt-2"></div>
        </section>

        {/* PERSONALIZED WIDGETS */}
        {goals.includes('Dormir Melhor') && (
          <section className="bg-surface-container-low rounded-3xl p-6 border-2 border-tertiary/20 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-tertiary">
                <Moon size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Dica de Sono</span>
              </div>
              <h4 className="font-bold text-sm">Prepare seu ambiente</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">Mantenha o quarto escuro e fresco para melhorar a qualidade do sono hoje.</p>
            </div>
            <button onClick={() => onNavigate('sleep')} className="bg-tertiary text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-all">
              <ChevronRight size={20} />
            </button>
          </section>
        )}

        {goals.includes('Melhorar Saúde') && (
          <section className="bg-gradient-to-r from-secondary/10 to-transparent rounded-3xl p-6 border border-secondary/20 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 space-y-2">
               <div className="flex items-center gap-2 text-secondary">
                 <ActivityIcon size={16} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Saúde Geral</span>
               </div>
               <h4 className="font-bold text-sm">Check-up Preventivo</h4>
               <p className="text-xs text-on-surface-variant leading-relaxed">Lembre-se de agendar seus exames anuais para manter tudo sob controle.</p>
            </div>
            <button onClick={() => onNavigate('consultations')} className="bg-secondary text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all">
               Ver Hospitais
            </button>
          </section>
        )}

        {goals.includes('Emagrecer') && (
          <section className="bg-orange-50 rounded-3xl p-6 border border-orange-100 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-orange-600">
                <Flame size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Queima Calórica</span>
              </div>
              <h4 className="font-bold text-sm">Mantenha a constância</h4>
              <p className="text-xs text-on-surface-variant">Você já queimou 540kcal hoje. Faltam 260kcal!</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600 flex items-center justify-center text-[10px] font-black text-orange-600">
              67%
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 bg-white rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-surface-container">
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <ActivityIcon className="text-secondary" size={16} />
                <span className="text-on-surface-variant font-black text-[9px] tracking-widest uppercase">META DIÁRIA</span>
              </div>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-4xl font-black tracking-tighter text-on-surface">10,240</span>
                <span className="text-sm font-medium text-on-surface-variant">passos</span>
              </div>
              <p className="text-on-surface-variant text-[11px] max-w-xs mx-auto md:mx-0 font-medium leading-relaxed">
                Alcançou <span className="text-secondary font-black">85%</span> da sua meta. Faltam 1,760 passos!
              </p>
            </div>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-container" cx="72" cy="72" r="64" fill="transparent" stroke="currentColor" strokeWidth="10"></circle>
                <circle className="text-secondary" cx="72" cy="72" r="64" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray="402.12" strokeDashoffset="60.31" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">85%</span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Meta</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-primary rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
                  <Heart fill="currentColor" size={20} />
                </div>
                <span className="text-[9px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-widest">Repouso</span>
              </div>
              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tighter">72</span>
                  <span className="text-sm opacity-80 font-medium">BPM</span>
                </div>
                <p className="mt-3 text-[11px] opacity-90 leading-relaxed font-medium">
                  Seus batimentos cardíacos estão ideais.
                </p>
              </div>
            </div>
            <ActivityIcon size={80} className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-6 translate-y-6" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col space-y-4 border border-surface-container group">
            <div className="flex items-center justify-between">
              <Moon className="text-tertiary" size={24} />
              <span className="text-tertiary font-black text-[9px] uppercase tracking-widest">Qualidade Boa</span>
            </div>
            <div>
              <span className="text-3xl font-black tracking-tighter leading-none">7h 45m</span>
              <p className="text-on-surface-variant text-xs font-bold mt-1.5 uppercase tracking-wide">Sono Total</p>
            </div>
            <div className="mt-auto pt-4 space-y-1.5">
               <div className="flex items-center justify-between text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                 <span>REM / Profundo</span>
                 <span>78%</span>
               </div>
               <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                 <div className="h-full bg-tertiary rounded-full" style={{ width: '78%' }}></div>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-tertiary to-[#004944dd] rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:col-span-2 relative overflow-hidden shadow-lg">
             <div className="relative z-10 text-center md:text-left space-y-4">
                <span className="bg-white/20 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest inline-block">Sugestão</span>
                <h4 className="text-xl font-extrabold tracking-tight">Yoga Noturna</h4>
                <p className="text-white/70 max-w-sm text-xs leading-relaxed font-medium">Um alongamento suave de 15 minutos melhorará seu sono hoje.</p>
                <button className="bg-white text-tertiary font-bold px-6 py-3 rounded-xl shadow-xl active:scale-95 transition-all text-xs">
                  Iniciar Agora
                </button>
             </div>
             <div className="relative z-10 flex justify-center items-center">
                <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                        <circle cx="60" cy="60" r="54" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle cx="60" cy="60" r="54" fill="transparent" stroke="white" strokeWidth="8" strokeDasharray="339.29" strokeDashoffset="84.82" strokeLinecap="round" />
                    </svg>
                   <div className="text-center">
                      <span className="block text-2xl font-black">75%</span>
                      <span className="text-[8px] uppercase font-bold tracking-widest opacity-60">Meta</span>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Consultations({ onNavigate, onMenuClick }: ScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  
  const categories = ['Geral', 'Nutrição', 'Psicologia', 'Hospitais'];

  const filteredItems = SEARCH_DATA.filter(item => {
    if (selectedCategory === 'Hospitais') return item.type === 'Hospital';
    if (selectedCategory === 'Geral') return item.type === 'Especialista';
    
    return item.type === 'Especialista' && (
      item.title.toLowerCase().includes(selectedCategory.toLowerCase()) || 
      item.description.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }).slice(0, 4);

  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="px-6 py-6 space-y-8 max-w-5xl mx-auto">
        <section className="space-y-6">
          <div className="space-y-1">
            <p className="text-on-surface-variant font-bold text-[9px] tracking-widest uppercase">Cuidado</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-primary font-display">Saúde em Foco</h2>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm"
              placeholder="Especialista, hospital ou área..."
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-6 px-6">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-none px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-sm ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-white text-on-surface-variant'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface">Unidades de Saúde</h3>
            <button onClick={() => onNavigate('all_units')} className="text-xs font-bold text-primary">Ver tudo</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
            {[
              { name: 'Hospital Central', sub: 'Aberto 24h', img: 'hospital_1' },
              { name: 'Clínica Aura', sub: 'Especializada', img: 'clinic_1' },
              { name: 'Centro Clínico', sub: 'Consultas rápidas', img: 'clinic_2' }
            ].map((unit, i) => (
              <div key={i} className="flex-none w-48 bg-white p-4 rounded-3xl space-y-3 shadow-sm border border-surface-container active:bg-surface-container transition-colors cursor-pointer">
                <div className="w-full h-24 rounded-2xl overflow-hidden mb-2 bg-surface-container border border-surface-container shadow-sm">
                  <img src={`https://picsum.photos/seed/${unit.img}/400/300`} alt="Unit" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight text-on-surface">{unit.name}</p>
                  <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mt-1">{unit.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-extrabold tracking-tight text-on-surface">Próximas Consultas</h3>
            <button className="text-xs font-bold text-primary">Ver tudo</button>
          </div>

          <div className="bg-white rounded-3xl p-5 flex flex-col space-y-5 shadow-sm border border-surface-container">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container shrink-0">
                  <img src="https://picsum.photos/seed/doctor_r/300/300" alt="Specialist" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-base leading-tight">Dr. Ricardo Silva</h4>
                  <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wide">Cardiologista</p>
                </div>
              </div>
              <span className="bg-secondary-container text-secondary px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">OK</span>
            </div>
            
            <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-primary" />
                <div>
                  <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Data & Hora</p>
                  <p className="text-xs font-bold">Hoje, 14:30</p>
                </div>
              </div>
              <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/10 active:scale-95 transition-transform">
                Entrar
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-extrabold tracking-tight">{selectedCategory === 'Geral' ? 'Especialistas Sugeridos' : `Resultados: ${selectedCategory}`}</h3>
            <button onClick={() => onNavigate(selectedCategory === 'Hospitais' ? 'all_units' : 'all_specialists')} className="text-xs font-bold text-primary">Ver tudo</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-surface-container active:bg-surface-container transition-colors cursor-pointer">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm leading-tight text-on-surface">{item.title}</p>
                  <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-center gap-1 text-secondary">
                  <Star size={12} fill="currentColor" />
                  <span className="text-[10px] font-black">5.0</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-40">
        <Plus size={24} />
      </button>
    </div>
  );
}

function Settings({ onNavigate, onMenuClick }: ScreenProps) {
  return (
    <div className="pb-32">
      <TopAppBar title="Configurações" onMenuClick={onMenuClick} />
      
      <main className="max-w-3xl mx-auto w-full px-6 py-6">
        <div className="mb-10">
          <p className="text-primary font-black tracking-[0.2em] uppercase text-[9px] mb-2">Preferências</p>
          <h2 className="text-3xl font-black tracking-tighter font-display">Configurações</h2>
          <div className="h-1 w-10 bg-primary rounded-full mt-2"></div>
        </div>

        <div className="space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-on-surface-variant">Notificações</h3>
               <SettingsIcon size={16} className="text-outline" />
            </div>
            <div className="space-y-3">
               {[
                 { title: 'Lembretes de Hidratação', sub: 'Alertas diários para beber água', checked: true },
                 { title: 'Resumo Semanal', sub: 'Relatório de progresso aos domingos', checked: false }
               ].map((item) => (
                 <div key={item.title} className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-surface-container active:bg-sky-50 transition-colors">
                   <div>
                     <p className="font-bold text-base text-on-surface leading-tight mb-1">{item.title}</p>
                     <p className="text-xs text-on-surface-variant font-medium">{item.sub}</p>
                   </div>
                   <div className={`w-12 h-6.5 rounded-full relative transition-all cursor-pointer ${item.checked ? 'bg-secondary' : 'bg-surface-container-highest'}`}>
                     <div className={`absolute top-0.5 w-5.5 h-5.5 bg-white rounded-full shadow-md transition-all ${item.checked ? 'left-6' : 'left-0.5'}`}></div>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
             <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-on-surface-variant px-1">Privacidade</h3>
             <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-surface-container">
                <button className="w-full flex items-center justify-between p-5 active:bg-sky-50 transition-colors border-b border-surface-container-low group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Lock size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-sm">Biometria (FaceID)</span>
                  </div>
                  <ChevronRight size={18} className="text-outline" />
                </button>
                <button className="w-full flex items-center justify-between p-5 active:bg-sky-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <RefreshCcw size={18} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-sm">Dados Sensíveis</span>
                  </div>
                  <ChevronRight size={18} className="text-outline" />
                </button>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Profile({ setScreen, onMenuClick, user }: { setScreen: (s: Screen) => void; onMenuClick?: () => void; user: SupabaseUser | null; key?: string; }) {
  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      setScreen('login');
    }
  };

  return (
    <div className="pb-32">
      <TopAppBar 
        title="SISA" 
        onMenuClick={onMenuClick}
        rightElement={
          <button onClick={() => setScreen('settings')} className="p-3 bg-primary rounded-xl text-white shadow-xl active:scale-95 transition-all">
            <Edit2 size={18} strokeWidth={2.5} />
          </button>
        }
      />
      
      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-10">
        <section className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-secondary font-black tracking-[0.2em] text-[9px] uppercase">Wellness Member</span>
            <h2 className="text-3xl font-black tracking-tighter text-primary font-display">{user?.user_metadata?.full_name || 'Isabella Rossi'}</h2>
            <p className="text-on-surface-variant font-bold text-sm">{user?.email || 'isabella.rossi@sanctuary.health'}</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-5 py-2.5 bg-error/10 text-error rounded-xl font-bold text-xs active:bg-error active:text-white transition-all shadow-sm"
          >
            Sair da Conta
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col gap-2">
              <div className="flex items-center gap-2 text-secondary">
                <Droplet size={14} fill="currentColor" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Blood Type</span>
              </div>
              <span className="text-3xl font-black tracking-widest text-on-surface">O+</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col gap-2">
              <div className="flex items-center gap-2 text-error">
                <PlusCircle size={14} fill="currentColor" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Allergies</span>
              </div>
              <span className="text-sm font-extrabold text-on-surface leading-tight">Penicilina</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-black tracking-tight px-1 font-display">Health Records</h3>
          <div className="space-y-3">
            {[
              { title: 'Meus Documentos', sub: 'Exames & IDs', icon: Folder, color: 'bg-primary/10 text-primary' },
              { title: 'Histórico Médico', sub: 'Procedimentos passados', icon: History, color: 'bg-secondary-container/50 text-secondary' },
              { title: 'Privacidade', sub: 'Configurações de Dados', icon: SettingsIcon, color: 'bg-tertiary-fixed-dim/40 text-tertiary' }
            ].map((item) => (
              <button key={item.title} className="w-full flex items-center justify-between p-4 rounded-3xl bg-white active:bg-sky-50 transition-all border border-surface-container shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`${item.color} p-3.5 rounded-2xl`}>
                    <item.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="text-left space-y-0.5">
                    <p className="font-bold text-base leading-none">{item.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-outline-variant" />
              </button>
            ))}
          </div>
        </section>

        <section className="bg-primary rounded-3xl p-8 overflow-hidden relative group shadow-2xl">
          <div className="relative z-10 max-w-[75%] space-y-4">
            <h4 className="text-white text-xl font-black leading-tight">Ready for your annual check-up?</h4>
            <p className="text-primary-fixed-dim text-xs font-medium opacity-80 leading-relaxed">Your metrics suggest a visit next month.</p>
            <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-xs active:bg-sky-50 transition-all">
                Schedule
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SleepInsights({ onMenuClick }: { onMenuClick?: () => void; key?: string; }) {
  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onMenuClick={onMenuClick} />
      <main className="px-6 pt-6 space-y-8 max-w-2xl mx-auto">
      <section className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-primary to-primary-container text-white shadow-xl">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-white/60 font-bold tracking-widest text-[9px] uppercase mb-1">QUALIDADE</p>
            <h2 className="text-2xl font-black tracking-tighter">Excelente</h2>
          </div>
          <div className="text-3xl font-black">85<span className="text-base font-medium opacity-60">/100</span></div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2.5 relative z-10">
          {['Adormecida', 'Latência', 'Eficiência'].map((label, i) => (
            <div key={label} className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex flex-col justify-center text-center">
              <p className="text-[9px] font-bold uppercase opacity-60 mb-1.5">{label}</p>
              <p className="text-sm font-bold">{['7h 42m', '12m', '94%'][i]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight font-display">Arquitetura do Sono</h3>
          <span className="text-on-surface-variant text-[9px] font-black uppercase tracking-widest">14 - 15 Abr</span>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm">
          <div className="h-32 w-full flex items-end gap-[3px] mb-6">
            {[40, 70, 85, 45, 60, 95, 30, 75, 50, 80, 20, 65, 90, 40, 55, 75].map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-md shadow-sm ${i % 4 === 0 ? 'bg-primary' : i % 4 === 1 ? 'bg-primary/60' : i % 4 === 2 ? 'bg-secondary' : 'bg-primary-container/20'}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-surface-container">
            {['Acordado', 'REM', 'Leve', 'Profundo'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary-container/20' : i === 1 ? 'bg-primary/60' : i === 2 ? 'bg-secondary' : 'bg-primary'}`}></div>
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 p-6 bg-surface-container rounded-3xl relative overflow-hidden">
        <div className="relative z-10 max-w-[85%] space-y-3">
           <span className="text-primary font-black italic text-xs">Wisdom</span>
           <h4 className="text-lg font-extrabold tracking-tight leading-tight italic opacity-90">"O sono é a ponte entre o desespero e a esperança."</h4>
           <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">— C.L. Harper</p>
        </div>
      </section>
      </main>
    </div>
  );
}

function Meditate({ onNavigate, onMenuClick }: ScreenProps) {
  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      <main className="pt-6 px-6 max-w-2xl mx-auto space-y-8">
        <section>
          <div className="relative overflow-hidden rounded-[2rem] bg-surface-container shadow-xl">
             <div className="aspect-[16/10] overflow-hidden">
                <img src="https://picsum.photos/seed/lake_dawn/1200/800" alt="Lake" className="w-full h-full object-cover" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-6 w-full space-y-3">
                <span className="bg-secondary-container text-secondary font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest">Destaque</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Quietude da Montanha</h2>
                <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                   <ActivityIcon size={14} /> 15 min • Elena Vance
                </div>
                <button className="bg-white text-primary px-6 py-3 rounded-xl font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all text-xs">
                   <Play size={16} fill="currentColor" /> Começar Agora
                </button>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-lg font-black tracking-tight text-primary font-display">Categorias</h3>
            <span className="text-[9px] font-black text-outline-variant uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Ver Todos</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6">
            {['Relaxamento', 'Foco', 'Sono', 'Ansiedade'].map((cat, i) => (
              <div key={cat} className={`flex-none px-6 py-3 rounded-2xl flex items-center gap-2 shadow-sm ${i === 0 ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-on-surface-variant'}`}>
                 <span className="text-xs font-bold">{cat}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
           <h3 className="text-lg font-black tracking-tight text-primary font-display px-1">Prática Diária</h3>
           <div className="space-y-3">
              {[
                { title: 'Calma Matinal', time: '10 MIN', teacher: 'SARAH J.', img: 'dew' },
                { title: 'Jornada do Sono', time: '45 MIN', teacher: 'MARCUS T.', img: 'stars' }
              ].map((item) => (
                <div key={item.title} className="flex items-center p-3.5 bg-white rounded-3xl shadow-sm border border-surface-container active:bg-sky-50 transition-all cursor-pointer">
                   <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container shrink-0">
                      <img src={`https://picsum.photos/seed/${item.img}/300/300`} alt="Practice" className="w-full h-full object-cover" />
                   </div>
                   <div className="ml-4 flex-grow space-y-0.5">
                      <h4 className="font-bold text-base leading-tight text-on-surface">{item.title}</h4>
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">{item.time} • {item.teacher}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center">
                      <Play size={18} fill="currentColor" />
                   </div>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}

function Activity({ onNavigate, onMenuClick }: ScreenProps) {
  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      <main className="max-w-4xl mx-auto px-6 pt-6 space-y-8">
        <section className="space-y-6">
           <div className="space-y-1">
              <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Visão Diária</span>
              <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Energia & Vitalidade</h2>
           </div>
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-surface-container relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="text-center md:text-left space-y-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Restantes</span>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black text-primary tracking-tighter leading-none">1,420</span>
                       <span className="text-lg font-bold text-on-surface-variant">kcal</span>
                    </div>
                 </div>
                 <div className="flex gap-10">
                    {[
                      { label: 'Gasto', color: 'bg-secondary', pct: 65 },
                      { label: 'Consumo', color: 'bg-primary', pct: 40 }
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col items-center gap-2">
                         <div className="w-2 h-16 bg-surface-container rounded-full overflow-hidden flex flex-col justify-end">
                            <div className={`${m.color} w-full rounded-full`} style={{ height: `${m.pct}%` }}></div>
                         </div>
                         <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-5 rounded-2xl flex items-center justify-between border border-surface-container-high">
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest">Queimadas</p>
                   <p className="text-xl font-black text-on-surface">540 <span className="text-xs font-bold opacity-60">kcal</span></p>
                </div>
                <Flame size={20} className="text-secondary" />
              </div>
              <div className="bg-primary p-5 rounded-2xl flex items-center justify-between text-white shadow-xl">
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase text-white/60 tracking-widest">Consumidas</p>
                   <p className="text-xl font-black">1,120 <span className="text-xs font-medium opacity-60">kcal</span></p>
                </div>
                <Utensils size={20} />
              </div>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button className="bg-gradient-to-br from-primary to-[#074469dd] text-white py-6 px-6 rounded-3xl flex items-center justify-between active:scale-95 transition-all shadow-xl shadow-primary/20">
              <div className="text-left space-y-1">
                 <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Treino</span>
                 <span className="text-lg font-black tracking-tight">Registrar Exercício</span>
              </div>
              <PlusCircle size={28} />
           </button>
           <button className="bg-white text-primary py-6 px-6 rounded-3xl flex items-center justify-between active:scale-95 transition-all border border-surface-container shadow-sm">
              <div className="text-left space-y-1">
                 <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Alimentação</span>
                 <span className="text-lg font-black tracking-tight">Adicionar Refeição</span>
              </div>
              <Utensils size={28} />
           </button>
        </section>

        <section className="space-y-6">
           <div className="flex justify-between items-end px-1">
              <h3 className="text-lg font-black font-display tracking-tight text-primary">Recentes</h3>
              <button className="text-primary font-black text-[9px] uppercase tracking-widest">Ver tudo</button>
           </div>
           <div className="space-y-3">
              {[
                { title: 'Corrida Matinal', time: 'Hoje, 07:30', kcal: '+320', color: 'bg-secondary text-white', icon: ActivityIcon },
                { title: 'Yoga', time: 'Ontem, 18:00', kcal: '+120', color: 'bg-tertiary text-white', icon: User }
              ].map((act, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-surface-container active:bg-sky-50 transition-all cursor-pointer">
                   <div className={`${act.color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                      <act.icon size={20} />
                   </div>
                   <div className="flex-1 space-y-0.5">
                      <h4 className="font-bold text-base leading-none">{act.title}</h4>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">{act.time}</p>
                   </div>
                   <div className="text-right">
                      <span className="block font-black text-xl text-secondary tracking-tighter">{act.kcal}</span>
                      <span className="text-[8px] font-black text-outline uppercase tracking-widest">kcal</span>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}

/**
 * ALL SPECIALISTS SCREEN
 */
function AllSpecialists({ onNavigate }: ScreenProps) {
  const [q, setQ] = useState('');
  const specialists = SEARCH_DATA.filter(i => i.type === 'Especialista' && (i.title.toLowerCase().includes(q.toLowerCase()) || i.description.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-surface-container shadow-sm">
        <button onClick={() => onNavigate('consultations')} className="p-2 -ml-2 text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-lg font-black tracking-tight">Especialistas</h1>
      </header>

      <main className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar especialista..."
            className="w-full bg-white border border-surface-container rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {specialists.map((spec) => (
            <button key={spec.id} onClick={() => onNavigate('search')} className="flex items-center p-4 bg-white rounded-[2rem] border border-surface-container shadow-sm active:scale-[0.98] transition-all">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-surface-container">
                <img src={spec.image} alt={spec.title} className="w-full h-full object-cover" />
              </div>
              <div className="ml-4 text-left flex-1 min-w-0">
                <h4 className="font-black text-on-surface leading-tight truncate">{spec.title}</h4>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mt-1">{spec.description.split(' • ')[0]}</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex items-center gap-0.5 text-secondary">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-black">4.9</span>
                   </div>
                   <span className="text-outline text-[10px]">•</span>
                   <span className="text-on-surface-variant text-[10px] font-bold">128 avaliações</span>
                </div>
              </div>
              <ChevronRight size={20} className="text-outline ml-2" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * ALL HEALTHCARE UNITS SCREEN
 */
function AllHealthcareUnits({ onNavigate }: ScreenProps) {
  const [q, setQ] = useState('');
  const units = SEARCH_DATA.filter(i => i.type === 'Hospital' && (i.title.toLowerCase().includes(q.toLowerCase()) || i.description.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-surface-container shadow-sm">
        <button onClick={() => onNavigate('consultations')} className="p-2 -ml-2 text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="text-lg font-black tracking-tight">Unidades de Saúde</h1>
      </header>

      <main className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar hospital ou clínica..."
            className="w-full bg-white border border-surface-container rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {units.map((unit) => (
            <div key={unit.id} onClick={() => onNavigate('consultations')} className="bg-white rounded-[2rem] border border-surface-container shadow-sm overflow-hidden flex flex-col group active:scale-[0.99] transition-all cursor-pointer">
              <div className="h-40 w-full bg-surface-container overflow-hidden">
                <img src={unit.image.replace('200/200', '800/400')} alt={unit.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-black text-on-surface tracking-tight">{unit.title}</h4>
                  <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">Aberto</span>
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-4">{unit.description}</p>
                <div className="flex items-center gap-4">
                  <button className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20">Agendar</button>
                  <button className="flex-1 bg-surface-container-high text-on-surface py-2.5 rounded-xl font-bold text-xs">Instruções</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
