import React, { useEffect, useState, useRef, ReactNode } from 'react';
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
  MoveRight,
  Share,
  Loader2,
  Check,
  SkipBack,
  SkipForward,
  Pause,
  Apple,
  Zap,
  FileText,
  Clock,
  Pill,
  BriefcaseMedical,
  Stethoscope,
  Brain,
  Video,
  Mic,
  Send,
  Paperclip,
  Scale,
  Ruler,
  Wifi,
  WifiOff,
  Bell,
  Thermometer,
  HeartPulse,
  Syringe,
  Dna
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * SCREEN DEFINITIONS
 */
type Screen = 'onboarding' | 'tutorial' | 'quiz' | 'dashboard' | 'settings' | 'consultations' | 'sleep' | 'meditate' | 'activity' | 'profile' | 'search' | 'login' | 'signup' | 'all_specialists' | 'all_units' | 'prescriptions' | 'appointments' | 'ai' | 'mental_health';

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
        {currentScreen === 'prescriptions' && <Prescriptions key="prescriptions" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'appointments' && <Appointments key="appointments" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'ai' && <AIAssistant key="ai" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'mental_health' && <MentalHealth key="mental_health" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
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
            { id: 'ai', icon: Zap, label: 'SISA AI', highlight: true },
            { id: 'mental_health', icon: Brain, label: 'Equilíbrio' },
            { id: 'activity', icon: ActivityIcon, label: 'Foco' },
            { id: 'consultations', icon: BriefcaseMedical, label: 'Telemedicina' },
            { id: 'prescriptions', icon: FileText, label: 'Receitas' },
            { id: 'appointments', icon: Clock, label: 'Agenda' },
            { id: 'meditate', icon: Moon, label: 'Meditar' },
            { id: 'sleep', icon: RefreshCcw, label: 'Sono' },
            { id: 'profile', icon: User, label: 'Perfil' },
            { id: 'settings', icon: SettingsIcon, label: 'Ajustes' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold group ${item.highlight ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-container hover:text-primary' : 'hover:bg-primary/5 text-on-surface-variant hover:text-primary'}`}
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
  const tabs: { id: Screen, label: string, icon: any, highlight?: boolean }[] = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'activity', label: 'Foco', icon: ActivityIcon },
    { id: 'ai', label: 'SISA AI', icon: Zap, highlight: true },
    { id: 'consultations', label: 'Saúde', icon: Calendar },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl z-50 border-t border-surface-container flex justify-around items-center px-2 pt-3 pb-8 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id || (tab.id === 'profile' && currentScreen === 'settings');
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center px-3 sm:px-5 py-2 rounded-2xl transition-all duration-300 ${isActive ? (tab.highlight ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-sky-100 text-primary') : 'text-outline-variant hover:text-primary'} ${tab.highlight && !isActive ? 'text-primary animate-pulse' : ''}`}
          >
            <tab.icon size={tab.highlight ? 28 : 24} className={isActive ? 'fill-current' : ''} />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider mt-1">{tab.label}</span>
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
      
      <main className="px-6 py-6 space-y-8 max-w-5xl mx-auto text-left">
        <section className="space-y-1">
          <p className="text-on-surface-variant font-medium text-xs">Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold tracking-tight font-display text-primary">Status de Vitalidade</h2>
            {goals.length > 0 && (
              <div className="flex gap-1 flex-wrap justify-end">
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
        {(goals.includes('Reduzir Ansiedade') || goals.includes('Foco')) && (
          <section 
            onClick={() => onNavigate('meditate')}
            className="bg-primary text-white rounded-[2.5rem] p-8 space-y-6 shadow-2xl shadow-primary/30 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                   <span className="bg-white/20 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Sua Jornada</span>
                   <h3 className="text-2xl font-black tracking-tight leading-tight">Momento de Foco</h3>
                   <p className="text-white/70 text-xs font-medium max-w-[200px]">Baseado no seu objetivo de {goals.find((g: string) => g === 'Reduzir Ansiedade' || g === 'Foco')}, preparamos sessões especiais.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                   <Play size={28} fill="currentColor" />
                </div>
            </div>
            <ActivityIcon size={120} className="absolute -bottom-6 -right-6 text-white opacity-10 rotate-12" />
          </section>
        )}
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

        {/* UPCOMING APPOINTMENT WIDGET */}
        <section 
          onClick={() => onNavigate('appointments')}
          className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm flex items-center justify-between group cursor-pointer active:bg-surface-container transition-all"
        >
          <div className="flex gap-4">
             <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Clock size={24} />
             </div>
             <div>
                <p className="text-[9px] font-black text-secondary tracking-widest uppercase">Próxima Consulta</p>
                <h4 className="font-black text-on-surface tracking-tight">Hoje, 14:30</h4>
                <p className="text-[10px] text-on-surface-variant font-bold">Dr. Ricardo Silva • Cardiologia</p>
             </div>
          </div>
          <ChevronRight size={20} className="text-outline group-hover:translate-x-1 transition-transform" />
        </section>

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
    
    const searchTerms: Record<string, string[]> = {
      'Nutrição': ['nutri', 'alimento', 'dieta'],
      'Psicologia': ['psico', 'mente', 'terapia', 'ansiedade'],
    };

    const terms = searchTerms[selectedCategory] || [selectedCategory.toLowerCase()];
    
    return item.type === 'Especialista' && (
      terms.some(t => item.title.toLowerCase().includes(t) || item.description.toLowerCase().includes(t))
    );
  }).slice(0, 4);

  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="px-6 py-6 space-y-8 max-w-5xl mx-auto">
        <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col items-center text-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-2xl relative z-10">
            <Video size={32} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black text-primary tracking-tight font-display uppercase tracking-tight">Telemedicina Express</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-2 leading-relaxed">Atendimento imediato via chat ou vídeo com clínicos, pediatras e psicólogos de plantão 24h.</p>
          </div>
          <div className="flex gap-4 w-full relative z-10">
            <button className="flex-1 bg-white border border-surface-container py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:bg-surface-container transition-all shadow-sm">
               <MessageSquare size={16} className="text-primary" />
               Chat Online
            </button>
            <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all">
               <Video size={16} />
               Chamada Vídeo
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
             <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
             <span className="text-[8px] font-black uppercase tracking-widest text-secondary">Médicos Disponíveis Agora</span>
          </div>
        </section>

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
  const [notifications, setNotifications] = useState({
    hydration: true,
    summary: false,
    push: true,
    offline: true
  });
  const [privacy, setPrivacy] = useState({
    biometry: true,
    shareData: false,
    anonymousAnalytics: true
  });
  const [isSensitiveDataOpen, setIsSensitiveDataOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [clearStatus, setClearStatus] = useState<'idle' | 'processing' | 'done'>('idle');

  const handleExport = () => {
    if (exportStatus !== 'idle') return;
    setExportStatus('processing');
    setTimeout(() => {
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 3000);
    }, 2000);
  };

  const handleClearHistory = () => {
    if (clearStatus !== 'idle') return;
    setClearStatus('processing');
    setTimeout(() => {
      setClearStatus('done');
      setTimeout(() => setClearStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="pb-32 min-h-screen bg-surface">
      <TopAppBar title="Configurações" onMenuClick={onMenuClick} />
      
      <main className="max-w-3xl mx-auto w-full px-6 py-6 text-left">
        <div className="mb-10">
          <p className="text-primary font-black tracking-[0.2em] uppercase text-[9px] mb-2">Preferências</p>
          <h2 className="text-3xl font-black tracking-tighter font-display">Opções</h2>
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
                 { id: 'hydration', title: 'Lembretes de Hidratação', sub: 'Alertas diários para beber água', checked: notifications.hydration },
                 { id: 'push', title: 'Notificações Push', sub: 'Alertas em tempo real sobre sua saúde', checked: (notifications as any).push },
                 { id: 'summary', title: 'Resumo Semanal', sub: 'Relatório de progresso aos domingos', checked: notifications.summary },
                 { id: 'offline', title: 'Modo Offline', sub: 'Salvar dados localmente sem internet', checked: (notifications as any).offline }
               ].map((item) => (
                 <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-surface-container active:bg-sky-50 transition-colors">
                   <div className="flex-1 pr-4">
                     <p className="font-bold text-base text-on-surface leading-tight mb-1">{item.title}</p>
                     <p className="text-xs text-on-surface-variant font-medium">{item.sub}</p>
                   </div>
                   <button 
                     onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                     className={`w-12 h-6 rounded-full relative transition-all duration-300 ${item.checked ? 'bg-secondary shadow-[0_0_12px_rgba(34,197,94,0.3)]' : 'bg-surface-container-highest'}`}
                   >
                     <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${item.checked ? 'left-6.5' : 'left-0.5'}`}></div>
                   </button>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-on-surface-variant px-1">Privacidade & Segurança</h3>
               <Lock size={16} className="text-outline" />
             </div>
             <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-surface-container">
                <div className="flex items-center justify-between p-5 border-b border-surface-container-low">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                         <Search size={18} strokeWidth={2.5} />
                     </div>
                     <div className="text-left">
                        <span className="font-bold text-sm block">Biometria (FaceID/TouchID)</span>
                        <span className="text-[10px] text-on-surface-variant font-medium italic">Acesso rápido e seguro</span>
                     </div>
                   </div>
                   <button 
                     onClick={() => setPrivacy(prev => ({ ...prev, biometry: !prev.biometry }))}
                     className={`w-12 h-6 rounded-full relative transition-all duration-300 ${privacy.biometry ? 'bg-primary' : 'bg-surface-container-highest'}`}
                   >
                     <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${privacy.biometry ? 'left-6.5' : 'left-0.5'}`}></div>
                   </button>
                </div>

                <button 
                  onClick={() => setIsSensitiveDataOpen(true)}
                  className="w-full flex items-center justify-between p-5 active:bg-sky-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <RefreshCcw size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                       <span className="font-bold text-sm block">Gerenciar Dados Sensíveis</span>
                       <span className="text-[10px] text-on-surface-variant font-medium">Excluir ou exportar seu histórico</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-outline group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </section>

          <section className="bg-error/5 border border-error/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-error">
                 <Lock size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Zona Crítica</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">Suas preferências de privacidade controlam como o SISA protege suas informações de saúde.</p>
          </section>
        </div>
      </main>

      {/* SENSITIVE DATA MODAL */}
      <AnimatePresence>
        {isSensitiveDataOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-error p-8 text-white relative text-left">
                 <button onClick={() => setIsSensitiveDataOpen(false)} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors"><X size={20} /></button>
                 <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter">Dados Sensíveis</h3>
                 <p className="text-white/60 text-[10px] font-bold mt-1 uppercase tracking-widest">Controle de Privacidade SISA</p>
              </div>
              <div className="p-8 space-y-6 text-left">
                 <div className="space-y-4">
                    <div className="p-4 bg-surface-container rounded-2xl space-y-3">
                       <p className="font-bold text-xs">Visibilidade do Histórico</p>
                       <div className="flex items-center justify-between">
                          <span className="text-[11px] text-on-surface-variant">Compartilhar com médicos parceiros</span>
                          <button 
                            onClick={() => setPrivacy(prev => ({ ...prev, shareData: !prev.shareData }))}
                            className={`w-10 h-5 rounded-full relative transition-all ${privacy.shareData ? 'bg-secondary' : 'bg-outline-variant'}`}
                          >
                             <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${privacy.shareData ? 'left-5.5' : 'left-0.5'}`}></div>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <button 
                        onClick={handleExport}
                        disabled={exportStatus === 'processing'}
                        className="w-full flex items-center justify-between p-4 bg-surface-container-low border border-surface-container rounded-2xl text-xs font-bold active:bg-sky-50 transition-all disabled:opacity-50"
                       >
                          <div className="flex items-center gap-3">
                            {exportStatus === 'processing' ? <Loader2 size={14} className="animate-spin text-primary" /> : exportStatus === 'done' ? <Check size={14} className="text-secondary" /> : <Download size={14} className="text-primary" />}
                            {exportStatus === 'processing' ? 'Exportando...' : exportStatus === 'done' ? 'Dados Exportados!' : 'Exportar meus dados (JSON)'}
                          </div>
                          {exportStatus === 'idle' && <ChevronRight size={14} className="opacity-40" />}
                       </button>

                       <button 
                        onClick={handleClearHistory}
                        disabled={clearStatus === 'processing'}
                        className="w-full flex items-center justify-between p-4 bg-error/5 border border-error/10 rounded-2xl text-xs font-bold text-error active:bg-error/10 transition-colors disabled:opacity-50"
                       >
                          <div className="flex items-center gap-3">
                            {clearStatus === 'processing' ? <Loader2 size={14} className="animate-spin" /> : clearStatus === 'done' ? <CheckCircle size={14} /> : <History size={14} />}
                            {clearStatus === 'processing' ? 'Limpando...' : clearStatus === 'done' ? 'Histórico Limpo!' : 'Limpar Histórico de Consultas'}
                          </div>
                          {clearStatus === 'idle' && <ChevronRight size={14} className="opacity-40" />}
                       </button>
                    </div>
                 </div>

                 <p className="text-[10px] text-on-surface-variant leading-relaxed text-center px-4 font-medium italic">Essas ações são permanentes e não podem ser desfeitas para garantir sua segurança total.</p>
                 
                 <button 
                   onClick={() => setIsSensitiveDataOpen(false)}
                   className="w-full bg-on-surface text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl"
                 >
                   Fechar
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      
      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-10 text-left">
        <section className="space-y-6 text-left">
          <div className="space-y-1.5">
            <span className="text-secondary font-black tracking-[0.2em] text-[9px] uppercase">Membro Wellness</span>
            <h2 className="text-3xl font-black tracking-tighter text-primary font-display">{user?.user_metadata?.full_name || 'Isabella Rossi'}</h2>
            <p className="text-on-surface-variant font-bold text-sm">{user?.email || 'usuario@sisa.health'}</p>
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
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Tipo Sanguíneo</span>
              </div>
              <span className="text-3xl font-black tracking-widest text-on-surface">O+</span>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-surface-container flex flex-col gap-2">
              <div className="flex items-center gap-2 text-error">
                <PlusCircle size={14} fill="currentColor" />
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Alergias</span>
              </div>
              <span className="text-sm font-extrabold text-on-surface leading-tight">Penicilina</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-black tracking-tight px-1 font-display">Registos de Saúde</h3>
          <div className="space-y-3">
            {[
              { title: 'Prescrições Médicas', sub: 'Receitas & Exames', icon: Pill, color: 'bg-primary/10 text-primary', screen: 'prescriptions' },
              { title: 'Agenda de Consultas', sub: 'Histórico & Próximas', icon: Calendar, color: 'bg-secondary-container/50 text-secondary', screen: 'appointments' },
              { title: 'Privacidade', sub: 'Configurações de Dados', icon: SettingsIcon, color: 'bg-tertiary-fixed-dim/40 text-tertiary', screen: 'settings' }
            ].map((item) => (
              <button 
                key={item.title} 
                onClick={() => setScreen(item.screen as Screen)}
                className="w-full flex items-center justify-between p-4 rounded-3xl bg-white active:bg-sky-50 transition-all border border-surface-container shadow-sm"
              >
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
          <div className="relative z-10 max-w-[75%] space-y-4 text-left">
            <h4 className="text-white text-xl font-black leading-tight">Pronto para o seu check-up anual?</h4>
            <p className="text-primary-fixed-dim text-xs font-medium opacity-80 leading-relaxed">Suas métricas sugerem uma visita no próximo mês.</p>
            <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-xs active:bg-sky-50 transition-all">
                Agendar
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
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const [activeSession, setActiveSession] = useState<SearchItem | null>(null);
  
  const categories = ['Geral', 'Relaxamento', 'Foco', 'Sono', 'Ansiedade'];
  
  const meditations = SEARCH_DATA.filter(item => {
    if (item.type !== 'Meditação') return false;
    if (selectedCategory === 'Geral') return true;
    return item.title.toLowerCase().includes(selectedCategory.toLowerCase()) || 
           item.description.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="pt-6 px-6 max-w-2xl mx-auto space-y-8">
        {/* Banner Section */}
        <section>
          <div className="relative overflow-hidden rounded-[2rem] bg-surface-container shadow-xl">
             <div className="aspect-[16/10] overflow-hidden">
                <img src="https://picsum.photos/seed/lake_dawn/1200/800" alt="Lake" className="w-full h-full object-cover" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-6 w-full space-y-3 text-left">
                <span className="bg-secondary-container text-secondary font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-widest inline-block">Destaque</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Quietude da Montanha</h2>
                <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                   <ActivityIcon size={14} /> 15 min • Elena Vance
                </div>
                <button 
                  onClick={() => setActiveSession(SEARCH_DATA[0])}
                  className="bg-white text-primary px-6 py-3 rounded-xl font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all text-xs"
                >
                   <Play size={16} fill="currentColor" /> Começar Agora
                </button>
             </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-lg font-black tracking-tight text-primary font-display">Categorias</h3>
            <span className="text-[9px] font-black text-outline-variant uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Ver Todos</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-6 px-6">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`flex-none px-6 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}
              >
                 <span className="text-xs font-bold">{cat}</span>
              </button>
            ))}
          </div>
        </section>

        {/* List Section */}
        <section className="space-y-4">
           <h3 className="text-lg font-black tracking-tight text-primary font-display px-1">
             {selectedCategory === 'Geral' ? 'Prática Diária' : `Meditações de ${selectedCategory}`}
           </h3>
           <div className="space-y-3">
              {meditations.length > 0 ? meditations.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setActiveSession(item)}
                  className="flex items-center p-3.5 bg-white rounded-3xl shadow-sm border border-surface-container active:bg-sky-50 transition-all cursor-pointer group"
                >
                   <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container shrink-0">
                      <img src={item.image} alt="Practice" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                   </div>
                   <div className="ml-4 flex-grow text-left space-y-0.5">
                      <h4 className="font-bold text-base leading-tight text-on-surface">{item.title}</h4>
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60 leading-tight">
                        {item.description}
                      </p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Play size={18} fill="currentColor" />
                   </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-white/50 border border-dashed border-surface-container rounded-3xl">
                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Nenhuma meditação encontrada</p>
                </div>
              )}
           </div>
        </section>
      </main>

      {/* MEDITATION PLAYER MODAL */}
      {activeSession && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-primary overflow-hidden">
          {/* Blurred Background */}
          <div className="absolute inset-0 z-0">
            <img src={activeSession.image} alt="" className="w-full h-full object-cover blur-3xl opacity-40 scale-150" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          </div>

          {/* Header */}
          <div className="relative z-10 p-8 flex justify-between items-center text-white">
             <button onClick={() => setActiveSession(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
               <ChevronDown size={32} />
             </button>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Meditação</p>
                <p className="text-sm font-bold truncate max-w-[200px]">{activeSession.title}</p>
             </div>
             <button className="p-2 hover:bg-white/10 rounded-full">
               <Share size={24} />
             </button>
          </div>

          {/* Album Art */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-12">
             <div className="w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/20">
                <img src={activeSession.image.replace('200/200', '800/800')} alt="" className="w-full h-full object-cover" />
             </div>
          </div>

          {/* Controls */}
          <div className="relative z-10 p-12 space-y-10">
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">{activeSession.title}</h2>
                <p className="text-white/60 font-medium text-lg leading-tight px-4">{activeSession.description.split(' por ')[1] || 'Elena Vance'}</p>
             </div>

             {/* Progress Bar */}
             <div className="space-y-3">
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full w-1/3 bg-white rounded-full relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                   </div>
                </div>
                <div className="flex justify-between text-[10px] font-black text-white/40 tracking-widest uppercase">
                   <span>04:15</span>
                   <span>15:00</span>
                </div>
             </div>

             <div className="flex items-center justify-between px-4">
                <button className="text-white/40 hover:text-white transition-colors">
                   <SkipBack size={32} fill="currentColor" />
                </button>
                <button className="w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                   <Pause size={40} fill="currentColor" />
                </button>
                <button className="text-white/40 hover:text-white transition-colors">
                   <SkipForward size={32} fill="currentColor" />
                </button>
             </div>
          </div>
          
          <div className="h-12 relative z-10" />
        </div>
      )}
    </div>
  );
}

function Activity({ onNavigate, onMenuClick }: ScreenProps) {
  const [activeTab, setActiveTab] = useState<'visão' | 'treinos' | 'nutrição' | 'vitais'>('visão');
  const [isRegistering, setIsRegistering] = useState<'treino' | 'refeição' | null>(null);
  const [regDescription, setRegDescription] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<SearchItem | null>(null);
  const [recentActivities, setRecentActivities] = useState([
    { title: 'Corrida Matinal', time: 'Hoje, 07:30', kcal: '+320', color: 'bg-secondary text-white', icon: ActivityIcon },
    { title: 'Yoga', time: 'Ontem, 18:00', kcal: '+120', color: 'bg-tertiary text-white', icon: User }
  ]);

  const activities = SEARCH_DATA.filter(item => item.type === 'Atividade');

  const handleConfirmRegistration = () => {
    if (!regDescription.trim()) return;

    const isTreino = isRegistering === 'treino';
    const newReg = {
      title: regDescription,
      time: 'Agora',
      kcal: isTreino ? '+250' : '-350', // Simple mock values
      color: isTreino ? 'bg-secondary text-white' : 'bg-primary text-white',
      icon: isTreino ? ActivityIcon : Utensils
    };

    setRecentActivities([newReg, ...recentActivities]);
    setRegDescription('');
    setIsRegistering(null);
  };

  return (
    <div className="pb-32">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="max-w-4xl mx-auto px-6 pt-6 space-y-8">
        {/* Tabs */}
        <div className="flex bg-surface-container rounded-2xl p-1.5 shadow-inner">
           {(['visão', 'treinos', 'nutrição', 'vitais'] as const).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        {activeTab === 'visão' && (
          <>
        <section className="space-y-6">
           <div className="space-y-1 text-left">
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
           
           <div className="grid grid-cols-2 gap-4 text-left">
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
           <button 
             onClick={() => setIsRegistering('treino')}
             className="bg-gradient-to-br from-primary to-[#074469dd] text-white py-6 px-6 rounded-3xl flex items-center justify-between active:scale-95 transition-all shadow-xl shadow-primary/20"
           >
              <div className="text-left space-y-1">
                 <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Treino</span>
                 <span className="text-lg font-black tracking-tight">Registrar Exercício</span>
              </div>
              <PlusCircle size={28} />
           </button>
           <button 
             onClick={() => setIsRegistering('refeição')}
             className="bg-white text-primary py-6 px-6 rounded-3xl flex items-center justify-between active:scale-95 transition-all border border-surface-container shadow-sm"
           >
              <div className="text-left space-y-1">
                 <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Alimentação</span>
                 <span className="text-lg font-black tracking-tight">Adicionar Refeição</span>
              </div>
              <Utensils size={28} />
           </button>
        </section>

        <section className="space-y-6 text-left">
           <div className="flex justify-between items-end px-1">
              <h3 className="text-lg font-black font-display tracking-tight text-primary">Recentes</h3>
              <button className="text-primary font-black text-[9px] uppercase tracking-widest">Ver tudo</button>
           </div>
           <div className="space-y-3">
              {recentActivities.map((act, i) => (
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
          </>
        )}

        {activeTab === 'treinos' && (
          <section className="space-y-6 text-left">
            <div className="space-y-1">
               <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Biblioteca</span>
               <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Sessões de Treino</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
               {activities.map((act) => (
                 <div 
                   key={act.id} 
                   onClick={() => setSelectedActivity(act)}
                   className="bg-white rounded-[2rem] border border-surface-container shadow-sm overflow-hidden flex flex-col group active:scale-[0.98] transition-all cursor-pointer"
                 >
                   <div className="h-40 w-full overflow-hidden relative">
                      <img src={act.image.replace('200/200', '800/400')} alt={act.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                   </div>
                   <div className="p-6">
                      <h4 className="text-lg font-black text-on-surface tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">{act.title}</h4>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-4">{act.description}</p>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 text-primary">
                            <ActivityIcon size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">25m</span>
                         </div>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          </section>
        )}

        {activeTab === 'nutrição' && (
          <section className="space-y-6 text-left pb-10">
            {/* Existing nutrição content remains... macros etc */}
            <div className="space-y-1">
               <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Diário Alimentar</span>
               <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Nutrição & Saúde</h2>
            </div>

            {/* Macros Counter */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Carbs', val: '120g', pct: 45, color: 'bg-primary' },
                { label: 'Proteína', val: '85g', pct: 60, color: 'bg-secondary' },
                { label: 'Gordura', val: '40g', pct: 30, color: 'bg-amber-500' }
              ].map(m => (
                <div key={m.label} className="bg-white p-4 rounded-3xl border border-surface-container flex flex-col items-center gap-2">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-surface-container" />
                      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * m.pct) / 100} className={`${m.color.replace('bg-', 'text-')} transition-all duration-1000`} />
                    </svg>
                    <span className="absolute text-[8px] font-black">{m.pct}%</span>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-on-surface-variant tracking-widest leading-none">{m.label}</p>
                    <p className="text-xs font-bold text-on-surface">{m.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-secondary-container/30 border border-secondary/20 rounded-3xl p-6 flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
                  <Apple size={24} />
               </div>
               <div className="text-left">
                  <h4 className="font-bold text-sm text-secondary">Excelente progresso!</h4>
                  <p className="text-xs text-on-surface-variant">Você atingiu 70% da sua meta hoje.</p>
               </div>
            </div>
            <div className="space-y-4">
               {['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'].map((meal) => (
                 <div 
                   key={meal} 
                   onClick={() => {
                     setRegDescription(meal);
                     setIsRegistering('refeição');
                   }}
                   className="bg-white p-5 rounded-3xl border border-surface-container shadow-sm flex items-center justify-between group cursor-pointer active:bg-surface-container transition-colors"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Utensils size={20} />
                       </div>
                       <div className="text-left">
                          <p className="font-extrabold text-sm text-on-surface">{meal}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Adicionar</p>
                       </div>
                    </div>
                    <Plus size={20} />
                 </div>
               ))}
            </div>
          </section>
        )}

        {activeTab === 'vitais' && (
          <section className="space-y-6 text-left pb-10">
            <div className="space-y-1">
               <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Monitoramento Principal</span>
               <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Sinais Vitais</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Batimento', val: '72', unit: 'bpm', icon: HeartPulse, color: 'text-error', bg: 'bg-error/10' },
                { label: 'Pressão', val: '12/8', unit: 'mmHg', icon: ActivityIcon, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Glicose', val: '95', unit: 'mg/dL', icon: Droplet, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
                { label: 'Saturação', val: '98', unit: '%', icon: Zap, color: 'text-secondary', bg: 'bg-secondary/10' },
                { label: 'Peso', val: '74.5', unit: 'kg', icon: Scale, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                { label: 'Altura', val: '1.78', unit: 'm', icon: Ruler, color: 'text-amber-600', bg: 'bg-amber-600/10' },
                { label: 'Temperatura', val: '36.6', unit: '°C', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { label: 'Sono', val: '7h 12m', unit: '', icon: Moon, color: 'text-primary', bg: 'bg-primary/10' }
              ].map((v) => (
                <div key={v.label} className="bg-white p-5 rounded-[2rem] border border-surface-container shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center`}>
                      <v.icon size={20} />
                    </div>
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container px-2 py-1 rounded-full">Atualizado</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">{v.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-on-surface tracking-tighter">{v.val}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant">{v.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
               <div className="flex items-center gap-3 mb-3">
                  <WifiOff size={16} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Modo Offline</span>
               </div>
               <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">Seus dados vitais estão sendo salvos localmente e serão sincronizados assim que você recuperar a internet. Nada se perde.</p>
            </div>
          </section>
        )}
      </main>

      {/* REGISTRATION MODAL */}
      {isRegistering && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-primary p-8 text-white relative text-left">
                 <button onClick={() => setIsRegistering(null)} className="absolute top-6 right-6 p-2"><X size={20} /></button>
                 <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter">Registrar {isRegistering}</h3>
                 <p className="text-white/60 text-xs font-bold mt-1 uppercase tracking-widest">SISA Health Tracker</p>
              </div>
              <div className="p-8 space-y-6 text-left">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">O que você fez?</label>
                    <input 
                      type="text" 
                      value={regDescription}
                      onChange={(e) => setRegDescription(e.target.value)}
                      placeholder={isRegistering === 'treino' ? "Ex: Corrida de 5km" : "Ex: Salada de Frutas"} 
                      className="w-full bg-surface-container rounded-2xl px-5 py-4 text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" 
                    />
                 </div>
                 <button 
                   onClick={handleConfirmRegistration}
                   className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
                 >
                   Confirmar Registro
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-surface overflow-hidden">
           <div className="relative h-[45vh] w-full overflow-hidden">
              <img src={selectedActivity.image} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setSelectedActivity(null)} className="absolute top-10 left-6 p-3 bg-white/20 rounded-2xl text-white"><ChevronDown size={24} /></button>
           </div>
           <div className="p-8 space-y-8 flex-1 text-left flex flex-col">
              <div>
                <h2 className="text-4xl font-black text-on-surface tracking-tighter leading-none">{selectedActivity.title}</h2>
                <p className="text-on-surface-variant font-medium leading-relaxed mt-4">{selectedActivity.description}</p>
              </div>
              <div className="mt-auto">
                <button onClick={() => setSelectedActivity(null)} className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-lg">Iniciar Treino</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

/**
 * PRESCRIPTIONS SCREEN
 */
function Prescriptions({ onNavigate, onMenuClick }: ScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'Ativas' | 'Histórico'>('Ativas');

  const prescriptions = [
    { id: '1', doc: 'Dr. Ricardo Silva', date: '20 Abr 2024', med: 'Amoxicilina 500mg', instructions: 'Tomar de 8 em 8 horas por 7 dias.', active: true },
    { id: '2', doc: 'Dra. Ana Paula', date: '15 Abr 2024', med: 'Sertralina 50mg', instructions: '1 comprimido pela manhã após o pequeno-almoço.', active: true },
    { id: '3', doc: 'Dr. Marcos Santos', date: '02 Jan 2024', med: 'Complexo B', instructions: 'Uso contínuo.', active: false },
  ];

  const filtered = prescriptions.filter(p => activeFilter === 'Ativas' ? p.active : !p.active);

  return (
    <div className="pb-32 bg-surface min-h-screen">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="px-6 py-8 space-y-10 max-w-2xl mx-auto text-left">
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="text-primary font-black tracking-[0.2em] uppercase text-[9px]">Cuidados Médicos</span>
            <h2 className="text-3xl font-black tracking-tighter text-on-surface font-display">Receitas Clínicas</h2>
          </div>
          
          <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-surface-container">
            {['Ativas', 'Histórico'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab as any)}
                className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeFilter === tab ? 'bg-white text-primary shadow-lg shadow-primary/10' : 'text-on-surface-variant'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-surface-container space-y-6 relative overflow-hidden group">
                <div className="flex justify-between items-start relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                         <Pill size={24} />
                      </div>
                      <div className="space-y-0.5">
                         <h4 className="text-xl font-black text-on-surface tracking-tight leading-none">{p.med}</h4>
                         <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{p.doc}</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-black text-outline uppercase tracking-widest">{p.date}</span>
                </div>

                <div className="bg-surface-container-low rounded-[2rem] p-6 text-xs text-on-surface-variant font-medium leading-relaxed relative z-10">
                   <p className="font-bold text-[10px] uppercase tracking-widest text-primary mb-2">Instruções</p>
                   {p.instructions}
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-2xl border border-secondary/10 relative z-10">
                   <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                      <CheckCircle size={14} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary">Assinatura Digital</p>
                      <p className="text-[9px] text-on-surface-variant font-medium">Verificado e assinado eletronicamente por {p.doc}</p>
                   </div>
                   <Dna size={16} className="text-secondary opacity-40" />
                </div>

                <div className="flex gap-3 relative z-10">
                   <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-primary/20">
                      <Download size={14} />
                      Baixar PDF
                   </button>
                   <button className="w-14 h-14 bg-surface-container-low text-primary rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-primary/10">
                      <Share size={20} />
                   </button>
                </div>
                <BriefcaseMedical size={100} className="absolute -bottom-6 -right-6 text-primary opacity-[0.03] rotate-12" />
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto text-outline">
                  <FileText size={32} />
               </div>
               <p className="text-on-surface-variant font-bold text-sm">Nenhuma receita encontrada no histórico.</p>
            </div>
          )}
        </section>

        <section className="bg-gradient-to-br from-secondary to-secondary-container p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl shadow-secondary/20 border border-white/10">
           <h4 className="text-xl font-black tracking-tight leading-tight">Telemedicina 24h</h4>
           <p className="text-white/80 text-xs font-medium leading-relaxed">Precisa de uma nova receita ou orientação? Fale agora com um médico clínico geral.</p>
           <button className="bg-white text-secondary py-4 px-8 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-xl">
              Iniciar Consulta On-line
           </button>
        </section>
      </main>
    </div>
  );
}

/**
 * APPOINTMENTS SCREEN
 */
function Appointments({ onNavigate, onMenuClick }: ScreenProps) {
  const [view, setView] = useState<'Abertos' | 'Finalizados'>('Abertos');

  const appointments = [
    { id: '1', doc: 'Dr. Ricardo Silva', spec: 'Cardiologista', date: 'Hoje, 14:30', status: 'Confirmado', type: 'Online' },
    { id: '2', doc: 'Dra. Ana Paula', spec: 'Psicóloga', date: 'Amanhã, 09:00', status: 'A confirmar', type: 'Presencial' },
    { id: '3', doc: 'Dr. Marcos Santos', spec: 'Nutricionista', date: '25 Abr, 16:15', status: 'Confirmado', type: 'Presencial' },
    { id: 'prev1', doc: 'Dra. Sofia Lima', spec: 'Clínico Geral', date: '12 Mar 2024', status: 'Concluído', type: 'Online' },
  ];

  const filtered = appointments.filter(a => view === 'Abertos' ? a.status !== 'Concluído' : a.status === 'Concluído');

  return (
    <div className="pb-32 bg-surface min-h-screen">
      <TopAppBar title="SISA" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      <main className="px-6 py-8 space-y-10 max-w-2xl mx-auto text-left">
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="text-secondary font-black tracking-[0.2em] uppercase text-[9px]">Sua Agenda</span>
            <h2 className="text-3xl font-black tracking-tighter text-on-surface font-display">Minhas Consultas</h2>
          </div>

          <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-surface-container">
            {['Abertos', 'Finalizados'].map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab as any)}
                className={`flex-1 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${view === tab ? 'bg-white text-secondary shadow-lg shadow-secondary/10' : 'text-on-surface-variant'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white rounded-3xl p-6 shadow-sm border border-surface-container space-y-6 group active:bg-surface-container-low transition-all cursor-pointer">
               <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 overflow-hidden shadow-inner border border-surface-container">
                        <img src={`https://picsum.photos/seed/doc_${a.id}/200/200`} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-0.5 min-w-0">
                        <h4 className="font-black text-lg text-on-surface tracking-tight leading-none truncate">{a.doc}</h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{a.spec}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${a.status === 'Confirmado' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>{a.status}</span>
                           <span className="text-[8px] font-bold text-outline uppercase tracking-widest">•</span>
                           <span className="text-[8px] font-black text-primary uppercase tracking-widest">{a.type}</span>
                        </div>
                     </div>
                  </div>
                  <div className="text-right shrink-0">
                     <div className="p-3 bg-secondary/5 text-secondary rounded-2xl inline-flex items-center justify-center">
                        <Calendar size={20} />
                     </div>
                  </div>
               </div>

               <div className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                     <Clock size={16} className="text-secondary" />
                     <div>
                        <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Data & Hora Selecionada</p>
                        <p className="text-xs font-black text-on-surface">{a.date}</p>
                     </div>
                  </div>
                  {a.status !== 'Concluído' ? (
                    <button className="bg-secondary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 transition-all">
                       {a.type === 'Online' ? 'Entrar' : 'Mapa'}
                    </button>
                  ) : (
                    <button onClick={() => onNavigate('prescriptions')} className="text-secondary font-black text-[10px] uppercase tracking-widest hover:underline">Ver Receitas</button>
                  )}
               </div>
            </div>
          ))}
          
          <button 
            onClick={() => onNavigate('consultations')}
            className="w-full py-6 rounded-3xl border-2 border-dashed border-secondary/20 text-secondary font-black text-sm hover:bg-secondary/5 transition-all flex flex-col items-center justify-center gap-2 mt-4"
          >
             <PlusCircle size={24} />
             Agendar Nova Consulta
          </button>
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

/**
 * NEW: SISA AI ASSISTANT
 */
function AIAssistant({ onNavigate, onMenuClick }: ScreenProps) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, attachment?: {type: string, data: string}}[]>([
    { role: 'ai', text: 'Olá! Sou o SISA AI. Como posso ajudar com sua saúde hoje? Agora você pode me enviar fotos de exames, receitas ou sintomas para eu analisar!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, data: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const base64 = readerEvent.target?.result as string;
      const data = base64.split(',')[1];
      setAttachedFile({
        name: file.name,
        data: data,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isTyping) return;
    
    const userMsg = input.trim() || (attachedFile?.type.startsWith('image/') ? "Analise esta imagem." : "Analise este documento.");
    const currentAttachment = attachedFile;
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      text: userMsg,
      attachment: currentAttachment ? { type: currentAttachment.type, data: currentAttachment.data } : undefined
    }]);
    
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents = messages.map(m => {
        const parts: any[] = [{ text: m.text }];
        if (m.attachment) {
          parts.unshift({
            inlineData: {
              data: m.attachment.data,
              mimeType: m.attachment.type
            }
          });
        }
        return { role: m.role === 'user' ? 'user' : 'model' as any, parts };
      });

      const currentParts: any[] = [{ text: userMsg }];
      if (currentAttachment) {
        currentParts.unshift({
          inlineData: {
            data: currentAttachment.data,
            mimeType: currentAttachment.type
          }
        });
      }
      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "Você é o SISA AI, um assistente de saúde amigável e profissional. Você pode analisar imagens de sintomas, receitas médicas e documentos/exames em PDF. Ajude o usuário com dúvidas sobre saúde, nutrição e bem-estar. Seja conciso e sempre recomende consultar um médico real para diagnósticos graves. Use um tom empático. Se o usuário enviar uma prescrição ou exame, explique os termos técnicos de forma simples.",
        },
        contents: contents,
      });
      
      const reply = response.text || "Desculpe, tive um problema ao processar sua solicitação.";
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Ocorreu um erro na conexão. Por favor, tente novamente." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      <TopAppBar title="SISA AI" onMenuClick={onMenuClick} rightElement={<Zap className="text-primary" size={20} />} />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-48">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i} 
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {m.attachment && (
              <div className="mb-2 max-w-[200px] rounded-xl overflow-hidden border border-surface-container bg-white p-1">
                {m.attachment.type.startsWith('image/') ? (
                  <img src={`data:${m.attachment.type};base64,${m.attachment.data}`} className="w-full h-auto rounded-lg" alt="Anexo" />
                ) : (
                  <div className="flex items-center gap-2 p-3 text-primary">
                    <FileText size={20} />
                    <span className="text-[10px] font-bold truncate">Documento PDF</span>
                  </div>
                )}
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm border ${m.role === 'user' ? 'bg-primary text-white border-primary/20 rounded-tr-none' : 'bg-white border-surface-container rounded-tl-none'}`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-surface-container p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-0 w-full px-6 bg-transparent pointer-events-none z-10">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* File Preview */}
          {attachedFile && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white border border-surface-container rounded-2xl p-2 mb-2 flex items-center gap-3 shadow-xl w-fit"
            >
              {attachedFile.type.startsWith('image/') ? (
                <img src={`data:${attachedFile.type};base64,${attachedFile.data}`} className="w-10 h-10 rounded-lg object-cover" alt="" />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <FileText size={18} />
                </div>
              )}
              <div className="flex-1 pr-2">
                <p className="text-[10px] font-black truncate max-w-[150px]">{attachedFile.name}</p>
                <p className="text-[8px] text-on-surface-variant font-bold uppercase tracking-widest">Pronto para enviar</p>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="w-6 h-6 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}

          <div className="bg-white border border-surface-container rounded-2xl py-2 px-3 shadow-2xl flex items-center gap-2 mb-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 transition-colors ${attachedFile ? 'text-primary' : 'text-outline-variant hover:text-primary'}`}
            >
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Descreva o sintoma ou anexe um exame..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3"
            />
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || isTyping}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NEW: MENTAL HEALTH (EQUILÍBRIO)
 */
function MentalHealth({ onNavigate, onMenuClick }: ScreenProps) {
  const [mood, setMood] = useState<number | null>(null);

  const moodEmojis = [
    { label: 'Muito Mal', emoji: '😞', value: 1 },
    { label: 'Mal', emoji: '😕', value: 2 },
    { label: 'Neutro', emoji: '😐', value: 3 },
    { label: 'Bem', emoji: '😊', value: 4 },
    { label: 'Ótimo', emoji: '🤩', value: 5 },
  ];

  return (
    <div className="pb-32 min-h-screen bg-[#FDF8F5]">
      <TopAppBar title="Equilíbrio" onMenuClick={onMenuClick} rightElement={<Brain className="text-[#FF8A65]" size={20} />} />
      
      <main className="max-w-3xl mx-auto w-full px-6 py-6 text-left">
        <section className="mb-10 text-center">
          <p className="text-[#FF8A65] font-black tracking-widest uppercase text-[10px] mb-2">Saúde Mental</p>
          <h2 className="text-3xl font-black tracking-tighter text-[#4E342E] font-display">Como você está hoje?</h2>
          <div className="h-1 w-10 bg-[#FF8A65] rounded-full mx-auto mt-2"></div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#F2E7E2] mb-10">
          <div className="flex justify-between items-center mb-6">
            {moodEmojis.map((m) => (
              <button 
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-2 group transition-all ${mood === m.value ? 'scale-125' : 'opacity-40 hover:opacity-100'}`}
              >
                <span className="text-4xl filter drop-shadow-md">{m.emoji}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest ${mood === m.value ? 'text-[#FF8A65]' : 'text-outline-variant'}`}>{m.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 bg-[#FFF3E0] rounded-2xl flex items-center gap-3">
             <MessageSquare size={16} className="text-[#FB8C00]" />
             <p className="text-[10px] font-bold text-[#E65100]">Monitore seus sentimentos para identificar padrões de ansiedade ou depressão.</p>
          </div>
        </section>

        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#4E342E] px-2 flex items-center gap-2">
            <Video size={16} className="text-[#FF8A65]" />
            Tele-Psicologia
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Dra. Ana Paula', spec: 'Psicóloga Cognitivo-Comportamental', focus: 'Ansiedade & Stress', img: 'https://picsum.photos/seed/doc_4/300/300' },
              { name: 'Dr. Sílvio Santos', spec: 'Psicanalista', focus: 'Depressão & Trauma', img: 'https://picsum.photos/seed/doc_psy/300/300' }
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-sm border border-[#F2E7E2] flex items-center gap-5 group hover:border-[#FF8A65]/30 transition-all">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container shrink-0 shadow-inner">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-extrabold text-sm text-[#4E342E] truncate">{p.name}</h4>
                  <p className="text-[10px] text-[#FF8A65] font-black uppercase tracking-tight mb-1">{p.spec}</p>
                  <p className="text-[9px] text-[#8D6E63] font-medium italic">Foco: {p.focus}</p>
                </div>
                <button className="bg-[#FF8A65] text-white p-3 rounded-xl shadow-lg shadow-[#FF8A65]/20 active:scale-95 transition-all">
                   <Calendar size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-12 bg-[#4E342E] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <h3 className="text-xl font-black tracking-tight mb-2">SOS Bem-Estar</h3>
          <p className="text-xs text-white/70 mb-6 font-medium leading-relaxed">Em momentos de crise profunda de depressão ou ansiedade, conte com nossa linha de apoio 24h.</p>
          <button className="w-full bg-[#FF8A65] text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3">
             <MessageSquare size={18} />
             Falar Agora com SISA AI
          </button>
        </section>
      </main>
    </div>
  );
}
