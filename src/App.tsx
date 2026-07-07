import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase } from './lib/supabase';
import { dataService, ClinicalEvolution, Prescription, Consultation } from './services/dataService';
import { User as SupabaseUser } from '@supabase/supabase-js';
import SecurityHub from './components/SecurityHub';
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
  Volume2,
  VolumeX,
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
  Dna,
  Cloud,
  Phone,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Edit3,
  Library,
  Trash2,
  Smile,
  PenTool,
  ArrowLeft,
  Eye,
  ShieldCheck,
  Info,
  Upload,
  Music
} from 'lucide-react';

/**
 * SCREEN DEFINITIONS
 */
type Screen = 'onboarding' | 'tutorial' | 'quiz' | 'dashboard' | 'settings' | 'consultations' | 'sleep' | 'meditate' | 'activity' | 'profile' | 'search' | 'login' | 'signup' | 'all_specialists' | 'all_units' | 'prescriptions' | 'appointments' | 'ai' | 'mental_health' | 'diario' | 'terms' | 'security_hub';

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
  { id: 'a1', title: 'Corrida Matinal', description: 'Cardio intenso para ativar o metabolismo e aumentar disposição.', type: 'Atividade', image: 'https://picsum.photos/seed/activity/200/200', screen: 'activity' },
  { id: 'a2', title: 'Yoga Restaurativo', description: 'Treino de flexibilidade, respiração profunda e relaxamento muscular.', type: 'Atividade', image: 'https://picsum.photos/seed/yoga/200/200', screen: 'activity' },
  { id: 'a3', title: 'Treino HIIT Definição', description: 'Queima calórica aceleradora de metabolismo com força funcional intensa.', type: 'Atividade', image: 'https://picsum.photos/seed/hiit/200/200', screen: 'activity' },
  { id: 'a4', title: 'Pilates Postural (Core)', description: 'Fortalecimento abdominal profundo para estabilidade e alívio de dores nas costas.', type: 'Atividade', image: 'https://picsum.photos/seed/pilates/200/200', screen: 'activity' },
  { id: 'a5', title: 'Ciclismo de Resistência', description: 'Aprimore o ritmo cardíaco e queime gordura pedalando com potência.', type: 'Atividade', image: 'https://picsum.photos/seed/cycling/200/200', screen: 'activity' },
  { id: 'a6', title: 'Mobilidade & Articular', description: 'Soltura articular completa e alongamento progressivo relaxante.', type: 'Atividade', image: 'https://picsum.photos/seed/stretching/200/200', screen: 'activity' },
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
  const [activePractice, setActivePractice] = useState<SearchItem | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [evolutions, setEvolutions] = useState<ClinicalEvolution[]>([]);

  const fetchSyncData = async () => {
    const [p, c, e] = await Promise.all([
      dataService.getMyPrescriptions(),
      dataService.getMyConsultations(),
      dataService.getMyEvolutions()
    ]);
    setPrescriptions(p);
    setConsultations(c);
    setEvolutions(e);
  };

  useEffect(() => {
    // Check local session first
    const localSess = localStorage.getItem('sisa_local_session');
    if (localSess) {
      try {
        const parsed = JSON.parse(localSess);
        setUser(parsed);
        setCurrentScreen('dashboard');
        // Fetch data after setting the state
        setTimeout(() => {
          fetchSyncData();
        }, 100);
        setLoading(false);
        return;
      } catch (_) {}
    }

    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        const userSession = {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          isLocal: false
        };
        localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
        setUser(session.user);
        setCurrentScreen('dashboard');
        fetchSyncData();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        const userSession = {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          isLocal: false
        };
        localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
        setUser(session.user);
        setCurrentScreen('dashboard');
        fetchSyncData();
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('sisa_local_session');
        setUser(null);
        setCurrentScreen('login');
        setPrescriptions([]);
        setConsultations([]);
        setEvolutions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Simple navigation helper
  const navigateTo = (screen: Screen, practice?: SearchItem) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
    if (practice) {
      setActivePractice(practice);
    }
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
        {currentScreen === 'consultations' && <Consultations key="consultations" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} onRefresh={fetchSyncData} />}
        {currentScreen === 'all_specialists' && <AllSpecialists key="all_specialists" onNavigate={navigateTo} />}
        {currentScreen === 'all_units' && <AllHealthcareUnits key="all_units" onNavigate={navigateTo} />}
        {currentScreen === 'sleep' && <SleepInsights key="sleep" onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'meditate' && <Meditate key="meditate" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} activePractice={activePractice} setActivePractice={setActivePractice} />}
        {currentScreen === 'activity' && <Activity key="activity" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'prescriptions' && <Prescriptions key="prescriptions" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} data={prescriptions} />}
        {currentScreen === 'appointments' && <Appointments key="appointments" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} data={consultations} />}
        {currentScreen === 'ai' && <AIAssistant key="ai" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
        {currentScreen === 'mental_health' && <MentalHealth key="mental_health" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} evolutions={evolutions} />}
        {currentScreen === 'diario' && <DiarioScreen key="diario" onNavigate={navigateTo} />}
        {currentScreen === 'profile' && <Profile key="profile" setScreen={navigateTo} onMenuClick={() => setIsMenuOpen(true)} user={user} setUser={setUser} />}
        {currentScreen === 'search' && <SearchScreen key="search" setScreen={navigateTo} />}
        {currentScreen === 'signup' && <Signup key="signup" onNavigate={navigateTo} setUser={setUser} />}
        {currentScreen === 'login' && <Login key="login" onNavigate={navigateTo} setUser={setUser} />}
        {currentScreen === 'terms' && <TermsAndPrivacy key="terms" onBack={() => navigateTo(user ? 'settings' : 'login')} />}
        {currentScreen === 'security_hub' && <SecurityHub key="security_hub" onNavigate={navigateTo} onMenuClick={() => setIsMenuOpen(true)} />}
      </div>

      {/* Navigation Bars (Only visible after onboarding, tutorial, quiz and not on auth screens) */}
      {!['onboarding', 'tutorial', 'quiz', 'login', 'signup', 'all_specialists', 'all_units', 'security_hub'].includes(currentScreen) && (
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
            { id: 'security_hub', icon: ShieldCheck, label: 'Segurança' },
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
      placeholder: 'Altura em metros (ex: 1.75)'
    },
    {
      id: 'activity',
      question: "Qual seu nível de atividade?",
      options: ['Sedentário', 'Moderado', 'Ativo', 'Atleta']
    }
  ];

  const handleNext = () => {
    const currentId = steps[step].id;
    const val = (data as any)[currentId];

    if (currentId === 'weight') {
      const w = parseFloat(val);
      if (isNaN(w) || w < 10 || w > 350) {
        alert('Por favor, insira um peso válido entre 10kg e 350kg.');
        return;
      }
    }

    if (currentId === 'height') {
      const h = parseFloat(String(val).replace(',', '.'));
      if (isNaN(h) || h < 0.5 || h > 2.8) {
        alert('Por favor, insira uma altura válida entre 0.5m e 2.8m (Ex: 1.75).');
        return;
      }
    }

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
                min={currentStep.id === 'weight' ? 10 : 0.5}
                max={currentStep.id === 'weight' ? 450 : 2.8}
                step={currentStep.id === 'height' ? 0.01 : 0.1}
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
function Login({ onNavigate, setUser }: ScreenProps & { setUser: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let loggedIn = false;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError && data.session) {
          const userSession = {
            id: data.session.user.id,
            email: data.session.user.email,
            user_metadata: data.session.user.user_metadata,
            isLocal: false
          };
          localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
          setUser(data.session.user);
          loggedIn = true;
          onNavigate('dashboard');
        } else if (loginError) {
          console.warn('Supabase login failed, trying local fallback...', loginError.message);
        }
      } catch (err: any) {
        console.warn('Supabase network error, trying local fallback...', err.message);
      }
    }

    if (!loggedIn) {
      try {
        const localUsersStr = localStorage.getItem('sisa_local_users');
        const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
        const found = localUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (found) {
          const userSession = {
            id: found.id,
            email: found.email,
            user_metadata: { full_name: found.full_name, role: found.role || 'paciente' },
            isLocal: true
          };
          localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
          setUser(userSession as any);
          loggedIn = true;
          onNavigate('dashboard');
        }
      } catch (e) {
        console.error('Error during local user lookup:', e);
      }
    }

    if (!loggedIn) {
      setError('E-mail ou senha incorretos. Você também pode criar uma conta local nova para acesso imediato.');
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase não configurado.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (e: any) {
      setError('Erro na conexão social.');
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Mock user for demo purposes if they want to bypass login
    const guestUser = { id: 'guest', email: 'convidado@sisa.com', user_metadata: { full_name: 'Visitante' } };
    setUser(guestUser as any);
    onNavigate('dashboard');
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
          <button 
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center p-4 bg-white border border-surface-container rounded-2xl hover:bg-surface-container-low transition-colors shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">Google</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('github')}
            className="flex items-center justify-center p-4 bg-white border border-surface-container rounded-2xl hover:bg-surface-container-low transition-colors shadow-sm"
          >
             <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            <span className="font-bold text-sm">GitHub</span>
          </button>
        </div>

        <button 
          onClick={handleGuestLogin}
          className="w-full py-4 border-2 border-dashed border-primary/20 rounded-xl font-bold text-primary hover:bg-primary/5 transition-all text-sm"
        >
          Continuar como Convidado (Demo)
        </button>
      </div>

      <p className="text-center mt-auto pt-8 text-sm text-on-surface-variant font-medium">
        Novo por aqui? <button onClick={() => onNavigate('signup')} className="text-primary font-black hover:underline">Crie uma conta</button>
      </p>
      
      <p className="mt-4 text-center text-[10px] text-outline font-bold uppercase tracking-widest pb-4">
        <button onClick={() => onNavigate('terms')} className="hover:text-primary transition-colors italic">Termos de Uso e Privacidade</button>
      </p>
    </div>
  );
}

/**
 * SIGNUP SCREEN
 */
function Signup({ onNavigate, setUser }: ScreenProps & { setUser: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const localId = `local-user-${Date.now()}`;
    const localUser = {
      id: localId,
      email,
      password,
      full_name: name,
      role: 'paciente',
      created_at: new Date().toISOString()
    };

    try {
      const localUsersStr = localStorage.getItem('sisa_local_users');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      
      const exists = localUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!exists) {
        localUsers.push(localUser);
        localStorage.setItem('sisa_local_users', JSON.stringify(localUsers));
      }
    } catch (_) {}

    const supabase = getSupabase();
    if (!supabase) {
      const userSession = {
        id: localId,
        email,
        user_metadata: { full_name: name, role: 'paciente' },
        isLocal: true
      };
      localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
      setUser(userSession as any);
      onNavigate('dashboard');
      return;
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (signupError) {
        console.warn('Supabase signup failed, using local fallback:', signupError.message);
        const userSession = {
          id: localId,
          email,
          user_metadata: { full_name: name, role: 'paciente' },
          isLocal: true
        };
        localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
        setUser(userSession as any);
        onNavigate('dashboard');
      } else if (data?.session) {
        const userSession = {
          id: data.session.user.id,
          email: data.session.user.email,
          user_metadata: data.session.user.user_metadata,
          isLocal: false
        };
        localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
        setUser(data.session.user);
        onNavigate('dashboard');
      } else if (data?.user) {
        const userSession = {
          id: localId,
          email,
          user_metadata: { full_name: name, role: 'paciente' },
          isLocal: true
        };
        localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
        setUser(userSession as any);
        alert('Cadastro realizado com sucesso! Como o e-mail do Supabase precisa de confirmação, ativamos o Banco de Dados Local para você acessar o aplicativo imediatamente.');
        onNavigate('dashboard');
      }
    } catch (err: any) {
      const userSession = {
        id: localId,
        email,
        user_metadata: { full_name: name, role: 'paciente' },
        isLocal: true
      };
      localStorage.setItem('sisa_local_session', JSON.stringify(userSession));
      setUser(userSession as any);
      onNavigate('dashboard');
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
          Ao registar-se, concorda com os nossos <button onClick={() => onNavigate('terms')} className="font-bold underline hover:text-primary">Termos e Privacidade</button>.
        </p>
      </div>

      <p className="text-center mt-auto pt-8 text-sm text-on-surface-variant font-medium">
        Já tem uma conta? <button onClick={() => onNavigate('login')} className="text-primary font-black hover:underline">Iniciar Sessão</button>
      </p>
    </div>
  );
}

interface ScreenProps { 
  onNavigate: (s: Screen, practice?: SearchItem) => void; 
  onMenuClick?: () => void; 
  key?: string; 
}
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
          className="bg-white rounded-3xl p-6 border border-surface-container shadow-sm flex items-center justify-between group cursor-pointer active:bg-surface-container active:scale-[0.99] transition-all"
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
          <div 
            onClick={() => onNavigate('activity')}
            className="md:col-span-8 bg-white rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm border border-surface-container cursor-pointer active:scale-[0.99] transition-all group hover:border-primary/20"
          >
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
                <motion.circle 
                  initial={{ strokeDashoffset: 402.12 }}
                  animate={{ strokeDashoffset: 60.31 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="text-secondary" 
                  cx="72" cy="72" r="64" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="10" 
                  strokeDasharray="402.12" 
                  strokeLinecap="round"
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">85%</span>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Meta</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => onNavigate('activity')}
            className="md:col-span-4 bg-primary rounded-3xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-xl cursor-pointer active:scale-[0.99] transition-all hover:bg-primary-container group"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl group-hover:bg-white/20 transition-colors">
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

function Consultations({ onNavigate, onMenuClick, onRefresh }: ScreenProps & { onRefresh?: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const [telemedSearchQuery, setTelemedSearchQuery] = useState('');
  const [bookingItem, setBookingItem] = useState<SearchItem | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState<'booking' | 'starting'>('booking');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  
  // Custom navigation inside the Telemedicine Hub
  const [teleSubTab, setTeleSubTab] = useState<'hub' | 'solicitacoes' | 'telemonitor' | 'cartao'>('hub');
  
  // Virtual waiting room and video consultation state
  const [inWaitingRoom, setInWaitingRoom] = useState(false);
  const [inVideoCall, setInVideoCall] = useState(false);
  const [selectedDoctorForConsult, setSelectedDoctorForConsult] = useState<any>({
    name: 'Dr. Ricardo Silva',
    specialty: 'Cardiologista',
    crm: 'CRM 12345',
    image: 'https://picsum.photos/seed/doc_1/200/200',
    waitTime: '8 min',
    patientsAhead: 1
  });

  // Flow simulation (SISA system integration)
  const [sisaFlowStep, setSisaFlowStep] = useState<number>(0);
  const [isSimulatingSisaFlow, setIsSimulatingSisaFlow] = useState(false);
  const [sisaFlowStatusText, setSisaFlowStatusText] = useState('Nenhum processo ativo');

  // Video call parameters
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoChatOpen, setIsVideoChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'patient' | 'doctor', text: string, time: string }>>([
    { sender: 'doctor', text: 'Olá! Seja bem-vindo à teleconsulta SISA. Como posso ajudar você hoje?', time: '14:30' }
  ]);
  const [sharedFiles, setSharedFiles] = useState<Array<{ name: string, type: string, url: string }>>([]);

  // Telemonitoring state (Manual input health metrics)
  const [heartRate, setHeartRate] = useState<number>(76);
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<number>(120);
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<number>(80);
  const [oxygenSaturation, setOxygenSaturation] = useState<number>(98);
  const [glucose, setGlucose] = useState<number>(95);
  const [weight, setWeight] = useState<number>(74.5);
  const [telemonitoringLogs, setTelemonitoringLogs] = useState<Array<any>>([
    { date: 'Hoje', heartRate: 76, bp: '120/80', oxy: 98, glucose: 95, weight: 74.5, status: 'Normal' },
    { date: 'Ontem', heartRate: 82, bp: '122/81', oxy: 97, glucose: 104, weight: 74.6, status: 'Normal' },
    { date: '03 de Junho', heartRate: 74, bp: '118/79', oxy: 99, glucose: 92, weight: 74.3, status: 'Normal' }
  ]);

  // Exam result modal state
  const [selectedExamResult, setSelectedExamResult] = useState<any | null>(null);

  // Prescriptions state override/local database to complement main data
  const [digitalPrescriptions, setDigitalPrescriptions] = useState<Array<any>>([
    { id: 'pres-1', doc: 'Dr. Ricardo Silva', date: 'Hoje', meds: ['Atenolol 50mg - 1x ao dia', 'Dovato 1 comp - à noite'], signature: 'SISA-DIGI-883491', pdfUrl: '#', verified: true },
    { id: 'pres-2', doc: 'Dra. Sofia Lima', date: '15 de Maio', meds: ['Amoxicilina 500mg - 8h/8h por 7 dias', 'Paracetamol 750mg - se dor'], signature: 'SISA-DIGI-223405', pdfUrl: '#', verified: true }
  ]);
  const [activePrescriptionModal, setActivePrescriptionModal] = useState<any | null>(null);

  // Digital Clinical Card template
  const [clinicalCard, setClinicalCard] = useState({
    memberNumber: 'SISA-309-8874-02',
    bloodType: 'O_POS',
    allergies: 'Lactose, Penicilina, Corantes Amarelos',
    emergencyContact: 'Carlos Lemba (+55 11 98845-3321)',
    synced: true,
    lastSync: 'Sincronizado há 2 min'
  });

  // Simple copy/share simulation
  const handleShareClinicalCard = () => {
    alert(`Link de Compartilhamento do Cartão Clínico SISA copiado!\nNúmero: ${clinicalCard.memberNumber}\nTipo Sanguíneo: O+`);
  };

  // Smart notifications database
  const [notifications, setNotifications] = useState<Array<{ id: string, title: string, description: string, type: 'info' | 'success' | 'warning', time: string, action?: string }>>([
    { id: 'not-1', title: 'Consulta Confirmada', description: 'Sua teleconsulta com o Dr. Ricardo Silva foi confirmada pelo hospital SISA para hoje às 14:30.', type: 'success', time: 'Há 5 min', action: 'waiting_room' },
    { id: 'not-2', title: 'Médico Disponível', description: 'Dr. Ricardo Silva já está online aguardando na sala de videoconferência.', type: 'info', time: 'Há 2 min', action: 'waiting_room' },
    { id: 'not-3', title: 'Novos Resultados', description: 'O laudo do seu último Eletrocardiograma foi processado e está disponível.', type: 'success', time: 'Há 1 hora', action: 'solicitacoes' },
    { id: 'not-4', title: 'Prescrição Digital Sincronizada', description: 'Uma guia assinada eletronicamente foi adicionada ao seu prontuário.', type: 'success', time: 'Há 2 horas', action: 'prescriptions' }
  ]);

  // Request exam list
  const [examsList, setExamsList] = useState<Array<{ id: string, examType: string, date: string, doctor: string, status: 'Pendente' | 'Em Processamento' | 'Disponível', resultsData?: any }>>([
    { 
      id: 'ex-1', 
      examType: 'Eletrocardiograma (ECG)', 
      date: 'Hoje', 
      doctor: 'Dr. Ricardo Silva', 
      status: 'Disponível',
      resultsData: { bpm: 72, rhythm: 'Sinusal regular', interpretation: 'Eletrocardiograma dentro dos padrões da normalidade clínica.' }
    },
    { 
      id: 'ex-2', 
      examType: 'Hemograma Completo', 
      date: '01 de Junho', 
      doctor: 'Dra. Sofia Lima', 
      status: 'Disponível',
      resultsData: { hemoglobina: '14.2 g/dL (Normal)', leucocitos: '6.400 /mm³ (Normal)', plaquetas: '240.000 /mm³ (Normal)' }
    },
    { 
      id: 'ex-3', 
      examType: 'Ecocardiograma Transtorácico', 
      date: 'Agendado para 10 de Junho', 
      doctor: 'Dr. Ricardo Silva', 
      status: 'Pendente' 
    }
  ]);

  const categories = ['Geral', 'Nutrição', 'Psicologia', 'Hospitais'];

  const filteredItems = SEARCH_DATA.filter(item => {
    let matchesCategory = false;
    if (selectedCategory === 'Hospitais') {
      matchesCategory = item.type === 'Hospital';
    } else if (selectedCategory === 'Geral') {
      matchesCategory = item.type === 'Especialista';
    } else {
      const searchTerms: Record<string, string[]> = {
        'Nutrição': ['nutri', 'alimento', 'dieta'],
        'Psicologia': ['psico', 'mente', 'terapia', 'ansiedade'],
      };
      const terms = searchTerms[selectedCategory] || [selectedCategory.toLowerCase()];
      matchesCategory = item.type === 'Especialista' && (
        terms.some(t => item.title.toLowerCase().includes(t) || item.description.toLowerCase().includes(t))
      );
    }

    if (!matchesCategory) return false;

    if (telemedSearchQuery.trim()) {
      const q = telemedSearchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }

    return true;
  }).slice(0, 4);

  // SISA core integrated workflow simulation action
  const handleStartSisaFlowSimulation = () => {
    if (isSimulatingSisaFlow) return;
    setIsSimulatingSisaFlow(true);
    setSisaFlowStep(1);
    setSisaFlowStatusText('1. Paciente agendas e envia solicitação...');
    
    setTimeout(() => {
      setSisaFlowStep(2);
      setSisaFlowStatusText('2. Servidor SISA envia agendamento ao sistema hospitalar...');
      
      setTimeout(() => {
        setSisaFlowStep(3);
        setSisaFlowStatusText('3. Recepção central SISA ativa a validação e confirma a guia...');
        
        // Add a notification about confirmed appt
        const newNot = {
          id: String(Date.now()),
          title: 'SISA: Consulta Confirmada!',
          description: 'Seu agendamento foi validado pela recepção médica do SISA e encaminhado à fila ao vivo.',
          type: 'success' as const,
          time: 'Agora',
          action: 'waiting_room'
        };
        setNotifications(prev => [newNot, ...prev]);

        setTimeout(() => {
          setSisaFlowStep(4);
          setSisaFlowStatusText('4. Médico visualiza prontuário e enfileira na sala de telemedicina...');
          
          setTimeout(() => {
            setSisaFlowStep(5);
            setSisaFlowStatusText('5. Teleconsulta finalizada! Prontuário, prescrição e exames sincronizados com sucesso.');
            setIsSimulatingSisaFlow(false);
            
            // Add a mock prescription on completion
            const newPres = {
              id: 'pres-sim',
              doc: 'Dr. Lucas Ferreira',
              date: 'Agora',
              meds: ['Ibuprofeno 600mg - 12h/12h se dor', 'Relaxante muscular - ao deitar'],
              signature: 'SISA-SIMFLOW-' + Math.floor(Math.random() * 900000 + 10000),
              pdfUrl: '#',
              verified: true
            };
            setDigitalPrescriptions(prev => [newPres, ...prev]);

            // Add new exam release
            const newExam = {
              id: 'ex-sim',
              examType: 'Ressonância Magnética de Joelho',
              date: 'Hoje',
              doctor: 'Dr. Lucas Ferreira',
              status: 'Disponível' as const,
              resultsData: { observacao: 'Análise de ligamento cruzado intacto. Leve efusão articular presente.' }
            };
            setExamsList(prev => [newExam, ...prev]);

            alert('Sincronização Hospitalar Completa!\nFoi emitida uma receita digital e uma solicitação de exame de feedback.');
          }, 3500);
        }, 3000);
      }, 3000);
    }, 2500);
  };

  const handleBook = async () => {
    if (!bookingItem || !selectedTime) return;
    
    setIsBooking(true);
    setConfirmationMode('booking');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const [hours, minutes] = selectedTime.split(':');
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { error } = await dataService.createConsultation({
      specialty: bookingItem.title,
      date: tomorrow.toISOString(),
      status: 'Confirmado',
      notes: `Telemedicina agendada com ${bookingItem.title}`
    });

    if (error) {
      alert(`Erro ao agendar: ${error}`);
      setIsBooking(false);
      return;
    }

    // Register active scheduled doc
    setSelectedDoctorForConsult({
      name: bookingItem.title,
      specialty: bookingItem.description.split(' • ')[0] || 'Clínico Geral',
      crm: bookingItem.description.split(' • ')[1] || 'SISA Vital',
      image: bookingItem.image,
      waitTime: '5 min',
      patientsAhead: 1
    });

    setShowConfirmation(true);
    if (onRefresh) onRefresh();

    setTimeout(() => {
      setShowConfirmation(false);
      setBookingItem(null);
      setSelectedTime(null);
      setIsBooking(false);
      setInWaitingRoom(true); // Redireciona para a nova Sala de Espera Virtual immediately!
    }, 2500);
  };

  const handleStartSession = async () => {
    if (!bookingItem) return;
    setIsBooking(true);
    setConfirmationMode('starting');

    const { error } = await dataService.createConsultation({
      specialty: bookingItem.title,
      date: new Date().toISOString(),
      status: 'Confirmado',
      notes: `Telemedicina com início imediato com ${bookingItem.title}`
    });

    if (error) {
      alert(`Erro ao iniciar: ${error}`);
      setIsBooking(false);
      return;
    }

    setSelectedDoctorForConsult({
      name: bookingItem.title,
      specialty: bookingItem.description.split(' • ')[0] || 'Especialista',
      crm: bookingItem.description.split(' • ')[1] || 'SISA Med',
      image: bookingItem.image,
      waitTime: 'Imediato',
      patientsAhead: 0
    });

    setShowConfirmation(true);
    if (onRefresh) onRefresh();

    setTimeout(() => {
      setShowConfirmation(false);
      setBookingItem(null);
      setIsBooking(false);
      setInWaitingRoom(true); 
    }, 2500);
  };

  // Video call doctor auto responses simulator
  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMsg = {
      sender: 'patient' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatLog(prev => [...prev, newMsg]);
    setChatMessage('');

    // Preprogrammed empathy answers
    setTimeout(() => {
      let doctorText = 'Entendi as suas observações. Estou registrando no prontuário eletrônico do SISA.';
      const msgLower = chatMessage.toLowerCase();
      if (msgLower.includes('dor') || msgLower.includes('cabeça') || msgLower.includes('peito')) {
        doctorText = 'Sinto muito por esse desconforto. Há quanto tempo essa dor se manifesta e qual a intensidade de 1 a 10?';
      } else if (msgLower.includes('receita') || msgLower.includes('medicamento')) {
        doctorText = 'A receita digital assinada eletronicamente já foi gerada e enviada! Você poderá visualizá-la e baixá-la na área de Histórico.';
      } else if (msgLower.includes('exame') || msgLower.includes('resultado')) {
        doctorText = 'Vou liberar a requisição de exames no portal do SISA. Você receberá um alerta indicando a solicitação do check-up.';
      }

      setChatLog(prev => [...prev, {
        sender: 'doctor',
        text: doctorText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  // File upload simulator inside video consultation
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newFile = {
      name: file.name,
      type: file.type || 'application/pdf',
      url: '#'
    };

    setSharedFiles(prev => [...prev, newFile]);
    
    // Auto trigger chat alert doctor acknowledgement
    setChatLog(prev => [...prev, 
      { sender: 'patient', text: `[Arquivo Compartilhado]: ${file.name}`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
      { sender: 'doctor', text: `Recebi o documento "${file.name}"! Analisando os anexos agora mesmo.`, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  // Metrics update handling
  const handleRecordMetric = () => {
    const isNormal = heartRate >= 60 && heartRate <= 100 && oxygenSaturation >= 95 && bloodPressureSystolic < 130;
    const item = {
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      heartRate,
      bp: `${bloodPressureSystolic}/${bloodPressureDiastolic}`,
      oxy: oxygenSaturation,
      glucose,
      weight,
      status: isNormal ? 'Normal' : 'Atenção'
    };

    setTelemonitoringLogs(prev => [item, ...prev]);
    alert('Indicadores vitais de telemonitoramento atualizados localmente!');
  };

  return (
    <div className="pb-32 min-h-screen bg-surface">
      <TopAppBar title="Telemedicina" onSearchClick={() => onNavigate('search')} onMenuClick={onMenuClick} />
      
      {/* Dynamic Sub Tab controller for Telemedicine portal */}
      <div className="bg-white border-b border-surface-container sticky top-[56px] z-30">
        <div className="max-w-5xl mx-auto flex overflow-x-auto no-scrollbar py-2.5 px-6 gap-2">
          {[
            { id: 'hub', label: 'Dashboard', icon: Home },
            { id: 'solicitacoes', label: 'Receitas & Exames', icon: FileText },
            { id: 'telemonitor', label: 'Telemonitoramento', icon: ActivityIcon },
            { id: 'cartao', label: 'Meu Cartão Clínico', icon: BriefcaseMedical }
          ].map(tab => {
            const IconComp = tab.icon;
            const active = teleSubTab === tab.id && !inWaitingRoom && !inVideoCall;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setInWaitingRoom(false);
                  setInVideoCall(false);
                  setTeleSubTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shrink-0 transition-all ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
              >
                <IconComp size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="px-6 py-6 space-y-8 max-w-5xl mx-auto">
        
        {/* VIEW 1: WAITING ROOM OVERLAY */}
        {inWaitingRoom && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] border border-surface-container p-8 shadow-xl max-w-2xl mx-auto space-y-8 text-center"
          >
            <div className="flex flex-col items-center space-y-4">
              <span className="bg-secondary/10 text-secondary text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Sala de Espera Virtual</span>
              
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-secondary/30 shadow-lg bg-surface-container">
                  <img src={selectedDoctorForConsult.image} alt={selectedDoctorForConsult.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center animate-pulse border-2 border-white">
                  <Video size={14} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">{selectedDoctorForConsult.name}</h3>
                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{selectedDoctorForConsult.specialty} • {selectedDoctorForConsult.crm}</p>
              </div>
            </div>

            <div className="bg-secondary/5 rounded-3xl p-6 border border-secondary/10 space-y-3">
              <p className="text-sm text-secondary font-black tracking-tight flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-ping"></span>
                Consulta disponível em instantes
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                "Você está na sala virtual de espera. O profissional iniciará a consulta em breve."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container text-center">
                <p className="text-[9px] font-black text-outline uppercase tracking-widest">Tempo Estimado</p>
                <p className="text-lg font-black text-on-surface mt-1">{selectedDoctorForConsult.waitTime}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container text-center">
                <p className="text-[9px] font-black text-outline uppercase tracking-widest">Fila do Médico</p>
                <p className="text-lg font-black text-on-surface mt-1">
                  {selectedDoctorForConsult.patientsAhead === 0 ? 'Sua Vez' : `${selectedDoctorForConsult.patientsAhead} à frente`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
              <button
                onClick={() => {
                  setInWaitingRoom(false);
                  setInVideoCall(true); // Redireciona para o console de videoconferência ao vivo!
                }}
                className="w-full bg-primary text-white py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-102 active:scale-98 transition-all"
              >
                <Video size={16} />
                Entrar na Consulta
              </button>
              
              <button
                onClick={() => {
                  if (confirm("Deseja sair da sala de espera? Você continuará agendado.")) {
                    setInWaitingRoom(false);
                  }
                }}
                className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Voltar mais Tarde
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: VIDEO CONFERENCE LIVE INTERFACE */}
        {inVideoCall && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-zinc-950 text-white flex flex-col md:flex-row h-screen animate-none select-none"
          >
            {/* Left Main Screen: Active Doctor WebCam Stream + Controls */}
            <div className="flex-1 relative bg-zinc-900 flex flex-col justify-between p-6">
              
              {/* Header */}
              <div className="flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20">
                    <img src={selectedDoctorForConsult.image} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-none">{selectedDoctorForConsult.name}</h4>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block mt-1">● Consulta ao vivo</span>
                  </div>
                </div>
                
                <div className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono text-zinc-300">
                  SISA Connection High Speed
                </div>
              </div>

              {/* Dynamic Simulated Dr Camera Canvas */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
                <div className="text-center space-y-6">
                  {/* Glowing camera lens simulation */}
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.45, 0.15] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 rounded-full bg-teal-500/15 border border-teal-500/20"
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      className="absolute inset-6 rounded-full bg-teal-400/10 border border-teal-400/30"
                    />
                    <div className="relative w-28 h-28 rounded-full bg-zinc-800 border border-teal-500/40 flex items-center justify-center shadow-2xl overflow-hidden">
                      <img src={selectedDoctorForConsult.image} alt="Doctor Frame" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-teal-400 animate-pulse">Webcam do Profissional Ativa</p>
                    <p className="text-xl font-medium text-zinc-300">Dr. Ricardo analisando sua telemetria...</p>
                  </div>
                </div>
              </div>

              {/* Patient Floating Picture-in-Picture Frame */}
              <div className="absolute bottom-24 right-6 w-36 h-48 rounded-2xl bg-zinc-800 border border-white/20 overflow-hidden shadow-2xl z-20">
                {isCamOn ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 bg-zinc-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-zinc-400">Sua Câmera</span>
                    </div>
                    {/* Pulsing indicator to simulate real webcam active stream */}
                    <div className="absolute bottom-3 left-3 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Você
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-2">
                    <div className="p-2.5 bg-white/5 rounded-full text-zinc-400">
                      <Video size={18} />
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Vídeo Desligado</span>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Video Controls console bar */}
              <div className="relative z-10 shrink-0 w-full max-w-lg mx-auto bg-zinc-900/90 backdrop-blur-md p-4 rounded-3xl border border-white/10 flex items-center justify-around">
                
                {/* Micro Toggle */}
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-4 rounded-2xl active:scale-95 transition-all ${isMicOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}
                  title={isMicOn ? 'Desativar Microfone' : 'Ativar Microfone'}
                >
                  {isMicOn ? <Mic size={20} /> : <X size={20} />}
                </button>

                {/* Camera Toggle */}
                <button
                  onClick={() => setIsCamOn(!isCamOn)}
                  className={`p-4 rounded-2xl active:scale-95 transition-all ${isCamOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}
                  title={isCamOn ? 'Desligar Câmera' : 'Ligar Câmera'}
                >
                  <Video size={20} />
                </button>

                {/* Chat Panel Trigger */}
                <button
                  onClick={() => setIsVideoChatOpen(!isVideoChatOpen)}
                  className={`p-4 rounded-2xl active:scale-95 transition-all relative ${isVideoChatOpen ? 'bg-teal-500 text-white' : 'bg-white/10 text-white'}`}
                  title="Abrir Chat"
                >
                  <MessageSquare size={20} />
                  {!isVideoChatOpen && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full"></span>
                  )}
                </button>

                {/* Document Share Button */}
                <label className="p-4 rounded-2xl bg-white/10 text-white active:scale-95 transition-all cursor-pointer hover:bg-white/20">
                  <Paperclip size={20} />
                  <input type="file" onChange={handleVideoFileUpload} className="hidden" />
                </label>

                {/* Terminate Consultation */}
                <button
                  onClick={() => {
                    if (confirm("Você deseja finalizar esta teleconsulta com o médico? Suas receitas e solicitações serão geradas.")) {
                      setInVideoCall(false);
                      setTeleSubTab('solicitacoes');
                      alert("Consulta concluída!\nO Dr. encerrou a sessão e enviou as guias para seu histórico SISA.");
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Encerrar
                </button>
              </div>
            </div>

            {/* Right Chat panel */}
            {isVideoChatOpen && (
              <div className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col justify-between h-80 md:h-full shrink-0">
                
                {/* Chat Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-teal-400" />
                    <span className="text-xs font-black uppercase tracking-widest">Chat ao vivo SISA</span>
                  </div>
                  <button onClick={() => setIsVideoChatOpen(false)} className="text-zinc-500 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                {/* Chat Stream logs */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
                  {chatLog.map((log, i) => (
                    <div key={i} className={`flex flex-col ${log.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 ${log.sender === 'patient' ? 'bg-primary text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-100 rounded-tl-none'}`}>
                        <p>{log.text}</p>
                      </div>
                      <span className="text-[8px] text-zinc-500 mt-1 px-1">{log.time}</span>
                    </div>
                  ))}
                </div>

                {/* Shared Documents Inside Chat widget list */}
                {sharedFiles.length > 0 && (
                  <div className="px-4 py-2 border-t border-zinc-900 bg-zinc-900/50 space-y-1.5 shrink-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Documentos compartilhados</p>
                    {sharedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-800 p-2 rounded-xl text-[10px]">
                        <span className="truncate flex-1 pr-2 text-zinc-300">{file.name}</span>
                        <CheckCircle size={10} className="text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Chat Input Console */}
                <div className="p-4 border-t border-zinc-800 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Mensagem para o profissional..."
                    className="flex-1 bg-zinc-900 border-none rounded-xl px-3 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 outline-none placeholder:text-zinc-600"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="bg-teal-500 text-zinc-950 p-2.5 rounded-xl hover:bg-teal-400 active:scale-95 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* CHOOSE CORRESPONDING CONTAINER PORT BASED ON SUB-TAB SELECTED */}
        
        {/* TAB 1: MAIN PORTAL DASHBOARD */}
        {teleSubTab === 'hub' && !inWaitingRoom && !inVideoCall && (
          <div className="space-y-8 text-left animate-fade-in">
            
            {/* Quick SISA Telemedicina Express Banner */}
            <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 max-w-md">
                <div className="w-14 h-14 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-lg relative z-10">
                  <Video size={28} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-primary tracking-tight font-display uppercase">Telemedicina Express SISA</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                    Atendimento virtual imediato com plantão integrado. Conecte-se com especialistas sem sair de casa.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10 shrink-0">
                <button 
                  onClick={() => setInWaitingRoom(true)}
                  className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  <Video size={14} />
                  Entrar de Plantão
                </button>
                
                <button 
                  onClick={() => {
                    const el = document.getElementById('agendar-seccao-lista');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white border border-surface-container text-on-surface px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all"
                >
                  <Calendar size={14} className="text-primary" />
                  Agendar Especialista
                </button>
              </div>
            </section>

            {/* SUB-SECTION: NEXT SCHEDULED APPOINTMENT WIDGET */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-outline uppercase tracking-widest">Próxima Consulta Agendada</h3>
                <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container shrink-0 shadow-inner">
                    <img src={selectedDoctorForConsult.image} alt={selectedDoctorForConsult.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary-container text-secondary">
                        Confirmada SISA
                      </span>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                        Em Espera
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-on-surface leading-tight mt-1">{selectedDoctorForConsult.name}</h4>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{selectedDoctorForConsult.specialty} • {selectedDoctorForConsult.crm}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-3 shrink-0">
                  <div className="bg-surface-container-low px-4 py-3 rounded-2xl border border-surface-container flex items-center gap-3">
                    <Clock size={16} className="text-secondary" />
                    <div>
                      <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Horário da Consulta</p>
                      <p className="text-xs font-black text-on-surface">Hoje, 14:30</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setInWaitingRoom(true)}
                    className="bg-secondary text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/15 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    Entrar na Sala Virtual
                  </button>
                </div>
              </div>
            </section>

            {/* INTEGRATION: SISA SYSTEM FULL WORKFLOW FLOW-CHART SIMULATOR */}
            <section className="bg-white rounded-[2.5rem] border border-surface-container p-8 space-y-6">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Integração SISA System</span>
                <h3 className="text-xl font-black text-on-surface tracking-tight font-display">Acompanhamento do Fluxo de Atendimento</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Veja como seu agendamento sincroniza de ponta-a-ponta em tempo real no servidor hospitalar.
                </p>
              </div>

              {/* Stepper logs visual */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {[
                  { step: 1, title: 'Agendado', desc: 'Paciente marca pelo app', icon: Calendar },
                  { step: 2, title: 'Validação SISA', desc: 'Hospitais recebem dados', icon: ExternalLink },
                  { step: 3, title: 'Confirmado', desc: 'Recepção chancela vaga', icon: CheckCircle },
                  { step: 4, title: 'Fila Médica', desc: 'Profissional inicia chamada', icon: Stethoscope },
                  { step: 5, title: 'Receitas Pronto', desc: 'Diagnóstico & Prontuário', icon: FileText }
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  const active = sisaFlowStep >= item.step;
                  const current = sisaFlowStep === item.step;
                  
                  return (
                    <div key={idx} className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${current ? 'bg-primary/5 border-primary shadow-sm scale-102' : active ? 'bg-surface-container-low border-surface-container/60' : 'bg-transparent border-dashed border-surface-container/40'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-surface-container text-outline'}`}>
                        {active ? <Check size={16} strokeWidth={3} /> : <IconComp size={16} />}
                      </div>
                      <p className={`font-black text-xs leading-none ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{item.title}</p>
                      <p className="text-[9px] text-outline mt-1 font-medium">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Controller for simulator console */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isSimulatingSisaFlow ? 'bg-emerald-500 animate-pulse' : 'bg-outline'}`}></div>
                  <span className="text-xs font-bold text-on-surface-variant font-mono">{sisaFlowStatusText}</span>
                </div>

                <button
                  onClick={handleStartSisaFlowSimulation}
                  disabled={isSimulatingSisaFlow}
                  className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  {isSimulatingSisaFlow ? 'Simulando Integração...' : 'Testar Sincronização SISA'}
                </button>
              </div>
            </section>

            {/* NOTIFICATIONS FEED SYSTEM PORT */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black text-outline uppercase tracking-widest">Notificações Inteligentes SISA</h3>
                <button 
                  onClick={() => {
                    setNotifications([]);
                    alert("Todas as notificações limpas!");
                  }} 
                  className="text-[10px] font-black text-primary uppercase tracking-widest"
                >
                  Limpar tudo
                </button>
              </div>

              {notifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notifications.map((not) => (
                    <div key={not.id} className="bg-white rounded-3xl p-5 border border-surface-container flex items-start gap-4 shadow-sm relative overflow-hidden group">
                      <div className={`w-2.5 h-10 rounded-full shrink-0 ${not.type === 'success' ? 'bg-emerald-500' : 'bg-primary'}`}></div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="font-black text-sm text-on-surface leading-none truncate">{not.title}</p>
                          <span className="text-[8px] text-outline font-bold uppercase">{not.time}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed font-sans">{not.description}</p>
                        
                        {not.action && (
                          <button
                            onClick={() => {
                              if (not.action === 'waiting_room') {
                                setInWaitingRoom(true);
                              } else if (not.action === 'solicitacoes') {
                                setTeleSubTab('solicitacoes');
                              } else if (not.action === 'prescriptions') {
                                setTeleSubTab('solicitacoes');
                              }
                            }}
                            className="text-[9px] font-black text-primary uppercase tracking-widest mt-1.5 inline-block hover:underline"
                          >
                            Visualizar Evento
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-white border border-surface-container border-dashed text-center rounded-[2rem]">
                  <p className="text-xs text-on-surface-variant font-bold">Nenhum aviso ou notificação de prontuário ativo.</p>
                </div>
              )}
            </section>

            {/* SPECIALISTS BOOKING SEARCH */}
            <section id="agendar-seccao-lista" className="space-y-6">
              <div className="space-y-1 text-left">
                <p className="text-[9px] font-black text-outline uppercase tracking-widest">Procedimentos SISA</p>
                <h2 className="text-2xl font-black text-on-surface tracking-tight font-display">Agende um Novo Especialista</h2>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type="text" 
                  value={telemedSearchQuery}
                  onChange={(e) => setTelemedSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline font-medium text-sm border-0"
                  placeholder="Especialista, hospital ou área clínica..."
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setBookingItem(item)}
                    className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-surface-container hover:bg-surface-container-low active:scale-98 transition-all cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm leading-tight text-on-surface group-hover:text-primary transition-colors truncate">{item.title}</p>
                      <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-widest mt-1 opacity-70 truncate">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-secondary">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-black">5.0</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: RECEITAS DIGITAIS & LAUDOS DE EXAME */}
        {teleSubTab === 'solicitacoes' && !inWaitingRoom && !inVideoCall && (
          <div className="space-y-8 text-left animate-fade-in">
            
            {/* Header Description */}
            <div className="space-y-1">
              <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Documentos Médicos SISA</span>
              <h2 className="text-3xl font-black tracking-tight text-on-surface font-display">Minhas Receitas & Exames</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Acesse suas guias emitidas digitalmente durante as teleconsultas e assinas com assinatura e certificado digital da rede hospitalar.
              </p>
            </div>

            {/* Subsection digital receipts list */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-on-surface leading-none font-display">Receitas de Prontuário</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {digitalPrescriptions.map((pres) => (
                  <div key={pres.id} className="bg-white border border-surface-container rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Pill size={22} />
                        </div>
                        <div>
                          <h4 className="font-black text-md text-on-surface truncate leading-none">{pres.doc}</h4>
                          <p className="text-[9px] text-outline font-black uppercase tracking-widest mt-1">{pres.date}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-2xl p-4 font-sans text-xs space-y-1.5 border border-surface-container relative z-10">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest">Medicamentos descritos</p>
                      {pres.meds.map((med: string, i: number) => (
                        <p key={i} className="text-on-surface-variant font-medium">• {med}</p>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-secondary/5 rounded-xl border border-secondary/10 text-[9px] relative z-10 text-secondary">
                      <CheckCircle size={12} strokeWidth={3} />
                      <span className="font-black uppercase tracking-widest">Assinado Digitalmente por CRM SISA</span>
                    </div>

                    <div className="flex gap-3 relative z-10">
                      <button
                        onClick={() => setActivePrescriptionModal(pres)}
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-primary/25"
                      >
                        <Eye size={12} />
                        Ver Receita Full
                      </button>
                      <button
                        onClick={() => alert(`Baixando PDF da receita modelo ${pres.signature} ...`)}
                        className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant px-4 py-3 rounded-xl active:scale-95 transition-all"
                        title="Baixar em PDF"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => alert(`Receita digital compartilhada via SISA link!`)}
                        className="bg-surface-container-low hover:bg-surface-container text-on-surface-variant px-4 py-3 rounded-xl active:scale-95 transition-all"
                        title="Compartilhar Link"
                      >
                        <Share size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Subsection examining medical orders requests */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-on-surface leading-none font-display">Solicitações de Exames</h3>
              
              <div className="space-y-3">
                {examsList.map((exam) => (
                  <div key={exam.id} className="bg-white rounded-2xl p-5 border border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1.5 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${exam.status === 'Disponível' ? 'bg-emerald-500/10 text-emerald-500' : exam.status === 'Em Processamento' ? 'bg-amber-500/10 text-amber-500' : 'bg-surface-container text-outline'}`}>
                          {exam.status}
                        </span>
                        <span className="text-[9px] text-outline font-bold">{exam.date}</span>
                      </div>
                      <h4 className="font-extrabold text-base text-on-surface tracking-tight mt-1">{exam.examType}</h4>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Solicitante: {exam.doctor}</p>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {exam.status === 'Disponível' ? (
                        <button
                          onClick={() => setSelectedExamResult(exam)}
                          className="w-full sm:w-auto bg-primary text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          Visualizar Resultado
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-outline uppercase tracking-widest bg-surface-container-low px-4 py-3 rounded-xl border border-surface-container block text-center min-w-[150px]">
                          Pendente Laboratório
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: TELEMONITORAMENTO (HEALTH CHECK METRICS RECORDER) */}
        {teleSubTab === 'telemonitor' && !inWaitingRoom && !inVideoCall && (
          <div className="space-y-8 text-left animate-fade-in">
            
            {/* Telemetry Header */}
            <section className="space-y-2">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Acompanhamento Clínico Remoto</span>
              <h2 className="text-3xl font-black tracking-tight text-on-surface font-display">Painel de Telemonitoramento</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Atualize seus indicadores vitais recomendados pelos clínicos do SISA ou simule pareamentos com smartbands / balanças inteligentes.
              </p>
            </section>

            {/* Simulated Live Devices Integration Banner */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 shadow-lg shadow-primary/25">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="p-3 bg-white/15 rounded-2xl">
                  <ActivityIcon size={24} className="animate-pulse text-secondary" />
                </div>
                <div>
                  <h4 className="font-black text-sm tracking-tight">SISA Smart Sync</h4>
                  <p className="text-xs text-white/70 mt-0.5">Pareamento automático com wearables integrado via Bluetooth LE.</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setHeartRate(78);
                  setBloodPressureSystolic(118);
                  setBloodPressureDiastolic(78);
                  setOxygenSaturation(99);
                  setGlucose(90);
                  alert("Indicadores vitais recém-recebidos do seu SISA Smartwatch com sucesso!");
                }}
                className="bg-white text-primary px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shrink-0"
              >
                Forçar Sincronização Wearable
              </button>
            </div>

            {/* Metrics Interactive manual logging cards */}
            <section className="bg-white border border-surface-container rounded-[2rem] p-8 space-y-6">
              <h3 className="text-lg font-black text-on-surface leading-none font-display">Registrar Novas Métricas de Saúde</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                
                {/* Metric Heartrate */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block">Frequência Cardíaca</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl py-3 px-4 font-bold text-sm outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary font-mono">bpm</span>
                  </div>
                  <div className="flex justify-between items-center px-1 text-[9px] text-outline uppercase font-medium">
                    <span>Faixa Ideal: 60-100</span>
                    <span className={`${heartRate >= 60 && heartRate <= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {heartRate >= 60 && heartRate <= 100 ? 'Estável' : 'Alerta'}
                    </span>
                  </div>
                </div>

                {/* Metric Blood pressure */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block">Pressão Arterial</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Sis"
                        value={bloodPressureSystolic}
                        onChange={(e) => setBloodPressureSystolic(parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl py-3 px-3 font-bold text-sm outline-none text-center"
                      />
                    </div>
                    <span className="self-center font-bold text-outline">/</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="Dia"
                        value={bloodPressureDiastolic}
                        onChange={(e) => setBloodPressureDiastolic(parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl py-3 px-3 font-bold text-sm outline-none text-center"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1 text-[9px] text-outline uppercase font-medium">
                    <span>Faixa Ideal: 120/80</span>
                    <span className={`${bloodPressureSystolic < 130 && bloodPressureDiastolic < 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {bloodPressureSystolic < 130 && bloodPressureDiastolic < 85 ? 'Excelente' : 'Atenção'}
                    </span>
                  </div>
                </div>

                {/* Metric SpO2 */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block">Saturação de Oxigênio</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={oxygenSaturation}
                      onChange={(e) => setOxygenSaturation(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl py-3 px-4 font-bold text-sm outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant font-mono">% SpO2</span>
                  </div>
                  <div className="flex justify-between items-center px-1 text-[9px] text-outline uppercase font-medium">
                    <span>Faixa Ideal: ≥ 95</span>
                    <span className={`${oxygenSaturation >= 95 ? 'text-emerald-500' : 'text-red-500 font-extrabold'}`}>
                      {oxygenSaturation >= 95 ? 'Normal' : 'Baixa saturação'}
                    </span>
                  </div>
                </div>

                {/* Metric Glucose */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block">Glicemia de Prontuário</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={glucose}
                      onChange={(e) => setGlucose(parseInt(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl py-3 px-4 font-bold text-sm outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant font-mono">mg/dL</span>
                  </div>
                  <div className="flex justify-between items-center px-1 text-[9px] text-outline uppercase font-medium">
                    <span>Em jejum ideal: &lt; 100</span>
                    <span className={`${glucose < 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {glucose < 100 ? 'Normal' : 'Elevada'}
                    </span>
                  </div>
                </div>

                {/* Metric Weight */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block">Peso Corporal</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl py-3 px-4 font-bold text-sm outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant font-mono">kg</span>
                  </div>
                  <div className="flex justify-between items-center px-1 text-[9px] text-outline uppercase font-medium">
                    <span>Metas de Peso</span>
                    <span>Sincronizado</span>
                  </div>
                </div>

              </div>

              {/* Botao CTA para salvar novos indicadores */}
              <button
                onClick={handleRecordMetric}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/25 active:scale-98 hover:shadow-xl transition-all"
              >
                Salvar Indicadores de Acompanhamento SISA
              </button>
            </section>

            {/* Subsection telemetry historic log list */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-on-surface font-display leading-none">Histórico de Telemonitoramento</h3>
              
              <div className="bg-white border border-surface-container rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container">
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px]">Data</th>
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px]">FC (BPM)</th>
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px]">P. Arterial</th>
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px]">Saturação</th>
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px]">Glicose</th>
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px]">Peso</th>
                      <th className="p-4 font-black text-on-surface uppercase tracking-widest text-[9px] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemonitoringLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-surface-container last:border-none">
                        <td className="p-4 font-bold text-on-surface">{log.date}</td>
                        <td className="p-4 font-mono font-medium">{log.heartRate} bpm</td>
                        <td className="p-4 font-mono font-medium">{log.bp}</td>
                        <td className="p-4 font-mono font-medium">{log.oxy}%</td>
                        <td className="p-4 font-mono font-medium">{log.glucose} mg/dL</td>
                        <td className="p-4 font-mono font-medium">{log.weight} kg</td>
                        <td className="p-4 text-right">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${log.status === 'Normal' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: MEU CARTAO CLINICO DIGITAL INTEGRADO SISA */}
        {teleSubTab === 'cartao' && !inWaitingRoom && !inVideoCall && (
          <div className="space-y-8 text-left animate-fade-in max-w-lg mx-auto">
            
            <div className="space-y-1 text-center">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Identidade Médica SISA</span>
              <h2 className="text-3xl font-black text-on-surface font-display leading-none">Meu Cartão Clínico</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed px-4">
                Cartão de atendimento emergencial em saúde sincronizado com a central SISA System.
              </p>
            </div>

            {/* High visual fidelity iOS/Android smart clinica card mockup */}
            <div className="relative bg-gradient-to-tr from-sky-950 via-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10 overflow-hidden space-y-8">
              <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl"></div>
              
              {/* Header logo */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-secondary">SISA WELLNESS</p>
                  <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mt-0.5">Clinical Digital Member</p>
                </div>
                
                {/* Visual chip card */}
                <div className="w-10 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-amber-200 opacity-80 shadow-md"></div>
              </div>

              {/* Patient Basic metadata */}
              <div className="space-y-3">
                <p className="text-2xl font-black tracking-tight leading-none">Eliane Lemba</p>
                <div className="flex items-center gap-2">
                  <span className="bg-white/15 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    ID: {clinicalCard.memberNumber}
                  </span>
                  <span className="bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                    SISA Sync Ativo
                  </span>
                </div>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-2 gap-6 bg-white/5 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
                <div>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Tipo Sanguíneo</p>
                  <p className="text-base font-black text-secondary mt-0.5">O+ (Positivo)</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Alergias Conhecidas</p>
                  <p className="text-xs font-black text-red-400 truncate mt-0.5" title={clinicalCard.allergies}>
                    {clinicalCard.allergies}
                  </p>
                </div>
                <div className="col-span-2 border-t border-white/10 pt-4">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest block">Contato de Emergência</p>
                  <p className="text-xs font-black text-zinc-200 mt-0.5">{clinicalCard.emergencyContact}</p>
                </div>
              </div>

              {/* QR Code matrix simulator block */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/10">
                <div className="text-center sm:text-left space-y-0.5">
                  <p className="text-[8px] tracking-widest text-white/40 font-bold uppercase">Validação Rápida SISA</p>
                  <p className="text-xs text-white/80 font-medium">Apresente este código em recepções credenciadas.</p>
                </div>

                <div className="w-18 h-18 bg-white p-1 rounded-xl shadow-lg flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-950" fill="currentColor">
                    {/* Visual QR Code matrix representation */}
                    <rect x="5" y="5" width="20" height="20" />
                    <rect x="10" y="10" width="10" height="10" fill="white" />
                    <rect x="75" y="5" width="20" height="20" />
                    <rect x="80" y="10" width="10" height="10" fill="white" />
                    <rect x="5" y="75" width="20" height="20" />
                    <rect x="10" y="80" width="10" height="10" fill="white" />
                    <rect x="40" y="40" width="20" height="20" />
                    <rect x="35" y="15" width="10" height="10" />
                    <rect x="55" y="15" width="10" height="10" />
                    <rect x="15" y="35" width="10" height="10" />
                    <rect x="15" y="55" width="10" height="10" />
                    <rect x="75" y="45" width="15" height="15" />
                    <rect x="45" y="75" width="15" height="15" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sync feedback indicator */}
            <div className="bg-surface-container-low border border-surface-container rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCcw size={14} className="text-emerald-500 animate-spin" />
                <span className="text-xs font-bold text-on-surface-variant">{clinicalCard.lastSync}</span>
              </div>
              <button 
                onClick={handleShareClinicalCard}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
              >
                Compartilhar Cartão
              </button>
            </div>
          </div>
        )}

      </main>

      {/* MODAL ARCHIVE LAYER: PRESCRIPTION DIGITAL DETAIL DISPLAY */}
      <AnimatePresence>
        {activePrescriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-surface-container rounded-[2.5rem] p-8 max-w-lg w-full relative space-y-6 shadow-2xl text-left"
            >
              <button
                onClick={() => setActivePrescriptionModal(null)}
                className="absolute top-6 right-6 p-2 text-outline hover:text-error transition-all"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2 border-b border-surface-container pb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Receita Médica Digital Oficial SISA</p>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Prescrição e Orientação</h3>
                <p className="text-xs text-on-surface-variant">Prontuário de Atendimento nº {activePrescriptionModal.signature}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs border-b border-surface-container pb-3">
                  <span className="font-bold text-outline uppercase tracking-wider text-[10px]">Profissional Clinico</span>
                  <span className="font-black text-on-surface">{activePrescriptionModal.doc}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-surface-container pb-3">
                  <span className="font-bold text-outline uppercase tracking-wider text-[10px]">Data de Emissão</span>
                  <span className="font-black text-on-surface">{activePrescriptionModal.date}</span>
                </div>

                <div className="space-y-2 bg-surface-container-low p-5 rounded-2xl border border-surface-container font-sans text-xs">
                  <p className="font-black text-primary uppercase tracking-widest text-[10px] mb-2">Prescrição Farmacológica</p>
                  {activePrescriptionModal.meds.map((med: string, id: number) => (
                    <div key={id} className="flex gap-2 items-start py-1">
                      <span className="text-secondary font-bold">•</span>
                      <p className="text-on-surface font-medium leading-relaxed">{med}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/5 rounded-2xl p-4 border border-secondary/10 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-secondary shrink-0" />
                  <div className="text-[10px] leading-relaxed">
                    <p className="font-black uppercase tracking-widest text-secondary">Assinatura Eletrônica Certificada SISA</p>
                    <p className="text-on-surface-variant font-medium mt-0.5">Guia registrada no sistema integrado eletrônico sob número {activePrescriptionModal.signature}.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-container">
                <button
                  onClick={() => {
                    alert("Fazendo download de arquivo PDF certificado do SISA...");
                    setActivePrescriptionModal(null);
                  }}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  Confirmar e Baixar PDF
                </button>
                <button
                  onClick={() => {
                    alert("Compartilhado com sucesso!");
                    setActivePrescriptionModal(null);
                  }}
                  className="bg-surface-container-low text-on-surface-variant px-5 py-4 rounded-xl font-black text-xs uppercase tracking-widest"
                >
                  Compartilhar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ARCHIVE LAYER: EXAM DETAIL DISPLAY */}
      <AnimatePresence>
        {selectedExamResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-surface-container rounded-[2.5rem] p-8 max-w-lg w-full relative space-y-6 shadow-2xl text-left"
            >
              <button
                onClick={() => setSelectedExamResult(null)}
                className="absolute top-6 right-6 p-2 text-outline hover:text-error transition-all"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-2 border-b border-surface-container pb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Laudo Laboratorial Integrado SISA</p>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">{selectedExamResult.examType}</h3>
                <p className="text-xs text-on-surface-variant">Laudo Sincronizado Digitalmente em {selectedExamResult.date}</p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="flex justify-between border-b border-surface-container pb-2">
                  <span className="font-bold text-outline uppercase tracking-wider text-[10px]">Médico Solicitante</span>
                  <span className="font-black text-on-surface">{selectedExamResult.doctor}</span>
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container space-y-3">
                  <p className="font-black text-secondary uppercase tracking-widest text-[10px]">Resultados Biológicos Sincronizados</p>
                  
                  {selectedExamResult.resultsData && Object.entries(selectedExamResult.resultsData).map(([key, val]: any) => (
                    <div key={key} className="flex justify-between items-center py-1.5 border-b border-surface-container/60 last:border-none">
                      <span className="font-extrabold capitalize text-on-surface-variant">{key.replace('_', ' ')}:</span>
                      <span className="font-mono font-bold text-on-surface">{val}</span>
                    </div>
                  ))}
                  
                  {!selectedExamResult.resultsData && (
                    <p className="text-on-surface-variant font-medium">Os detalhes gráficos do laudo estão em processamento de imagem dicom.</p>
                  )}
                </div>

                <div className="flex gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-500 text-[9px] items-center">
                  <CheckCircle size={14} />
                  <span className="font-black uppercase tracking-widest">Resultado homologado sob normativas SISA</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-container">
                <button
                  onClick={() => setSelectedExamResult(null)}
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest text-center"
                >
                  Concluir Leitura
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Backdrop/Dialog */}
      <AnimatePresence>
        {bookingItem && !showConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative shadow-2xl"
            >
               <button onClick={() => setBookingItem(null)} className="absolute top-6 right-6 p-2 text-outline hover:text-error transition-colors"><X size={24} /></button>
               
               <div className="flex gap-6 items-start text-left">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden bg-surface-container shrink-0 shadow-lg">
                    <img src={bookingItem.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{bookingItem.type}</span>
                    <h2 className="text-2xl font-black text-on-surface tracking-tight mt-1">{bookingItem.title}</h2>
                    <p className="text-xs text-on-surface-variant font-extrabold mt-1 uppercase tracking-widest">{bookingItem.description}</p>
                  </div>
               </div>

               <div className="space-y-4 text-left">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Selecione o Horário Disponível</p>
                  <div className="grid grid-cols-3 gap-2">
                     {['09:00', '10:30', '14:00', '14:30', '17:00'].map(h => (
                        <button 
                          key={h} 
                          onClick={() => setSelectedTime(h)}
                          className={`border py-3 rounded-xl text-xs font-black transition-all ${selectedTime === h ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container-low border-surface-container text-on-surface hover:bg-primary/10 hover:border-primary/20 hover:text-primary'}`}
                        >
                           {h}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleBook}
                   disabled={!selectedTime || isBooking}
                   className="w-full bg-primary text-white py-4.5 rounded-2xl font-black text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-primary disabled:opacity-50 disabled:grayscale"
                 >
                   {isBooking ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                   {isBooking ? 'Processando...' : 'Agendar Sessão'}
                 </button>
                 <button 
                   onClick={handleStartSession}
                   disabled={isBooking}
                   className="w-full bg-white text-primary py-4.5 rounded-2xl font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-primary/20 disabled:opacity-50"
                 >
                   {isBooking ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                   Iniciar Agora
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}

        {/* Dynamic confirmation overlay */}
        {showConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center text-white p-6"
          >
             <motion.div 
               initial={{ scale: 0.5, rotate: -10 }}
               animate={{ scale: 1, rotate: 0 }}
               className="w-24 h-24 bg-white text-primary rounded-[2rem] flex items-center justify-center shadow-2xl mb-8"
             >
                <Check size={48} strokeWidth={4} />
             </motion.div>
             <h2 className="text-3xl font-black tracking-tighter text-center leading-none">
               {confirmationMode === 'booking' ? 'Consulta Agendada!' : 'Iniciando Sessão...'}
             </h2>
             <p className="mt-4 text-white/70 text-sm font-medium text-center max-w-[250px]">
               {confirmationMode === 'booking' 
                 ? 'Enviamos um lembrete para o seu e-mail e ativamos a notificação em sua agenda.' 
                 : 'Prepare-se! Você será redirecionado para a sala virtual em instantes.'}
             </p>
             <Loader2 size={32} className="animate-spin mt-12 opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => {
          const el = document.getElementById('agendar-seccao-lista');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-transform z-40"
      >
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

                <button 
                  onClick={() => onNavigate('security_hub')}
                  className="w-full flex items-center justify-between p-5 active:bg-sky-50 transition-colors group border-t border-surface-container-low"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <ShieldCheck size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                       <span className="font-bold text-sm block text-emerald-700 font-extrabold">Central de Segurança SISA</span>
                       <span className="text-[10px] text-on-surface-variant font-medium">Controles e simulações Secure by Design (AES, MFA, Logs)</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => onNavigate('terms')}
                  className="w-full flex items-center justify-between p-5 active:bg-sky-50 transition-colors group border-t border-surface-container-low"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <ShieldCheck size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                       <span className="font-bold text-sm block">Termos e Privacidade</span>
                       <span className="text-[10px] text-on-surface-variant font-medium">Como protegemos sua privacidade</span>
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

function Profile({ setScreen, onMenuClick, user, setUser }: { setScreen: (s: Screen) => void; onMenuClick?: () => void; user: SupabaseUser | null; setUser: (u: any) => void; key?: string; }) {
  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    localStorage.removeItem('sisa_local_session');
    // Also reset locally for Guest mode or if event doesn't trigger
    setUser(null);
    setScreen('login');
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
          <div className="relative z-10 max-w-[75%] space-y-4 text-left text-white">
            <h4 className="text-xl font-black leading-tight">Pronto para o seu check-up anual?</h4>
            <p className="text-white/70 text-xs font-medium opacity-80 leading-relaxed">Suas métricas sugerem uma visita no próximo mês para manter seu progresso.</p>
            <button 
              onClick={() => setScreen('consultations')}
              className="bg-white text-primary px-8 py-3 rounded-2xl font-black text-xs active:bg-sky-50 active:scale-95 transition-all shadow-xl"
            >
                Agendar Agora
            </button>
          </div>
          <ActivityIcon size={120} className="absolute -bottom-6 -right-6 text-white opacity-10 rotate-12" />
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

function Meditate({ onNavigate, onMenuClick, activePractice, setActivePractice }: ScreenProps & { activePractice?: SearchItem | null, setActivePractice?: (s: SearchItem | null) => void }) {
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const [activeSession, setActiveSession] = useState<SearchItem | null>(null);
  
  // Real Audio Engine State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(600);
  const [isMuted, setIsMuted] = useState(false);

  // New selected upload category target
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('Minha Playlist');

  // Custom category map for downloaded tracks
  const [downloadedTrackCategories, setDownloadedTrackCategories] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sisa_downloaded_track_categories');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // Track the most recently downloaded standard track to ask for reorganization
  const [justDownloadedTrack, setJustDownloadedTrack] = useState<SearchItem | null>(null);

  // Download simulation state
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [downloadedIds, setDownloadedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sisa_downloaded_meditations');
      return saved ? JSON.parse(saved) : ['m1']; // 'm1' pre-downloaded as default
    } catch (_) {
      return ['m1'];
    }
  });

  // User's custom imported playlist from phone
  const [customPlaylist, setCustomPlaylist] = useState<SearchItem[]>(() => {
    try {
      const saved = localStorage.getItem('sisa_custom_playlist');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Native Audio Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle activePractice incoming from home screen or dashboard
  useEffect(() => {
    if (activePractice) {
      setActiveSession(activePractice);
      if (setActivePractice) setActivePractice(null);
    }
  }, [activePractice]);

  // Map pre-installed serene streams
  const getAudioSourceUrl = (item: SearchItem) => {
    // @ts-ignore
    if (item.audioUrl) return item.audioUrl;
    
    // Public domain calming high-quality instrumental audio streams
    if (item.id === 'm1') return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Quietude da Montanha (Calm Piano)
    if (item.id === 'm2') return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'; // Calma Matinal (Acoustic Guitar Sparkle)
    if (item.id === 'm3') return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'; // Jornada do Sono (Smooth Space Pads)
    
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'; // Fallback
  };

  const getDurationEstimator = (item: SearchItem) => {
    if (item.id === 'm1') return 900; // 15:00
    if (item.id === 'm2') return 600; // 10:00
    if (item.id === 'm3') return 1200; // 20:00
    // @ts-ignore
    return item.duration || 300; // 5:00 default
  };

  const duration = activeSession ? (audioDuration || getDurationEstimator(activeSession)) : 600;

  // Format Helper ticks
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync isMuted to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle active track change inside audio element
  useEffect(() => {
    if (activeSession) {
      const src = getAudioSourceUrl(activeSession);
      setIsPlaying(true);
      setCurrentTime(0);

      if (audioRef.current) {
        audioRef.current.src = src;
        audioRef.current.load();
        audioRef.current.play().catch(err => {
          console.warn('Playback error or blocked by autoplay restriction:', err);
        });
      }

      // Sync Native lock screen control widget (Media Session API)
      if ('mediaSession' in navigator) {
        try {
          // @ts-ignore
          navigator.mediaSession.metadata = new MediaMetadata({
            title: activeSession.title,
            artist: activeSession.description.replace('Meditação guiada de 15 min por ', '').replace('Comece o dia com serenidade - 10 min', 'SISA Saúde').replace('Relaxe profundamente para um sono reparador', 'SISA Sono'),
            album: 'SISA Integrado',
            artwork: [
              { src: activeSession.image, sizes: '192x192', type: 'image/jpeg' },
              { src: activeSession.image.replace('200/200', '512/512'), sizes: '512x512', type: 'image/jpeg' }
            ]
          });

          navigator.mediaSession.setActionHandler('play', () => {
            setIsPlaying(true);
            audioRef.current?.play();
          });

          navigator.mediaSession.setActionHandler('pause', () => {
            setIsPlaying(false);
            audioRef.current?.pause();
          });

          navigator.mediaSession.setActionHandler('previoustrack', () => {
            handleSkipBackward();
          });

          navigator.mediaSession.setActionHandler('nexttrack', () => {
            handleSkipForward();
          });
        } catch (e) {
          console.warn('MediaSession initialization failed safely:', e);
        }
      }
    } else {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [activeSession]);

  // Setup standard audio list event callbacks
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setAudioDuration(audio.duration || 600);
    };

    const onEnded = () => {
      // Loop forever or close
      audio.currentTime = 0;
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const handlePlayToggle = () => {
    if (!activeSession) return;
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
    } else {
      setIsPlaying(true);
      audioRef.current?.play().catch(() => {});
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      const next = Math.min(audioRef.current.currentTime + 15, duration);
      audioRef.current.currentTime = next;
      setCurrentTime(next);
    }
  };

  const handleSkipBackward = () => {
    if (audioRef.current) {
      const next = Math.max(audioRef.current.currentTime - 15, 0);
      audioRef.current.currentTime = next;
      setCurrentTime(next);
    }
  };

  // Trigger download with live percentage loader
  const handleDownload = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (downloadedIds.includes(trackId) || downloadingIds[trackId] !== undefined) return;

    setDownloadingIds(prev => ({ ...prev, [trackId]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadingIds(prev => {
          const next = { ...prev };
          delete next[trackId];
          return next;
        });
        setDownloadedIds(prev => {
          const next = [...prev, trackId];
          localStorage.setItem('sisa_downloaded_meditations', JSON.stringify(next));
          return next;
        });

        // Trigger prompt pop-up to let user select category immediately after download
        const found = SEARCH_DATA.find(t => t.id === trackId);
        if (found) {
          setJustDownloadedTrack(found);
        }
      } else {
        setDownloadingIds(prev => ({ ...prev, [trackId]: progress }));
      }
    }, 150);
  };

  // File Upload handler for user's own telephone music
  const handleLocalPlaylistUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: SearchItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      
      newTracks.push({
        id: `phone-music-${Date.now()}-${i}`,
        title: file.name.replace(/\.[^/.]+$/, ''), // strip extension
        description: 'Música carregada do seu Telefone',
        type: 'Meditação',
        image: `https://picsum.photos/seed/phone_track_${i}/200/200`,
        screen: 'meditate',
        // @ts-ignore
        audioUrl: objectUrl,
        isCustom: true,
        customCategory: selectedUploadCategory, // Dynamically assign custom category
        duration: 300 // default mock duration until loaded
      });
    }

    const updatedPlaylist = [...customPlaylist, ...newTracks];
    setCustomPlaylist(updatedPlaylist);
    
    // Save metadata back (Note: Blob ObjectURLs won't revive across full resets, but they work perfectly for active app lifecycle!)
    try {
      localStorage.setItem('sisa_custom_playlist', JSON.stringify(updatedPlaylist.map(t => ({
        ...t,
        audioUrl: '' // clean blob url for privacy and storage limitations
      }))));
    } catch (_) {}
  };

  const deleteCustomTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    const updated = customPlaylist.filter(t => t.id !== trackId);
    setCustomPlaylist(updated);
    try {
      localStorage.setItem('sisa_custom_playlist', JSON.stringify(updated.map(t => ({ ...t, audioUrl: '' }))));
    } catch (_) {}
  };

  const categories = ['Geral', 'Minha Playlist', 'Relaxamento', 'Foco', 'Sono', 'Ansiedade'];
  
  // Consolidate default tracks plus user's uploaded telephone tracks
  const meditations = [
    ...SEARCH_DATA.filter(item => {
      if (item.type !== 'Meditação') return false;
      if (selectedCategory === 'Geral') return true;
      if (selectedCategory === 'Minha Playlist') return false; // Rendered isolated or separately
      
      const customCat = downloadedTrackCategories[item.id];
      if (customCat) {
        return customCat === selectedCategory;
      }

      return item.title.toLowerCase().includes(selectedCategory.toLowerCase()) || 
             item.description.toLowerCase().includes(selectedCategory.toLowerCase());
    }),
    ...customPlaylist.filter(item => {
      if (selectedCategory === 'Geral' || selectedCategory === 'Minha Playlist') return true;
      // @ts-ignore
      return item.customCategory === selectedCategory;
    })
  ];

  return (
    <div className="pb-32">
      {/* Background Audio Element */}
      <audio ref={audioRef} loop className="hidden" />

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
                   <ActivityIcon size={14} /> 15 min • SISA Saúde Offline
                </div>
                <button 
                  onClick={() => {
                    const track = SEARCH_DATA.find(i => i.id === 'm1');
                    if (track) setActiveSession(track);
                  }}
                  className="bg-white text-primary px-6 py-3 rounded-xl font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all text-xs"
                >
                   <Play size={16} fill="currentColor" /> Começar Agora
                </button>
             </div>
          </div>
        </section>

        {/* Upload Audio from Phone Container */}
        <section className="bg-primary-container/20 border border-primary/10 rounded-[2rem] p-6 space-y-4 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Upload size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-on-surface">Minha Playlist Pessoal</h3>
            <p className="text-xs font-medium text-on-surface-variant max-w-sm mx-auto">
              Carregue as suas próprias músicas de relaxamento diretamente do seu telefone para ouvir de forma contínua com ecrã bloqueado.
            </p>
          </div>

          <div className="max-w-xs mx-auto space-y-1.5 text-left bg-white/50 p-3.5 rounded-2xl border border-primary/5 shadow-sm">
            <label className="block text-[9px] font-black uppercase tracking-wider text-primary">
              Destinar novas importações para:
            </label>
            <select
              value={selectedUploadCategory}
              onChange={(e) => setSelectedUploadCategory(e.target.value)}
              className="w-full bg-white text-on-surface text-xs font-bold px-3 py-2 rounded-xl border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              {categories.filter(c => c !== 'Geral').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 bg-primary text-white text-xs font-black px-6 py-3 rounded-2xl cursor-pointer hover:bg-primary-dark shadow-md active:scale-95 transition-all">
              <Plus size={16} /> Importar Músicas do Aparelho
              <input 
                type="file" 
                accept="audio/*" 
                multiple 
                onChange={handleLocalPlaylistUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-lg font-black tracking-tight text-primary font-display">Categorias</h3>
            <span className="text-[9px] font-black text-outline-variant uppercase tracking-widest">SISA Sound</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all text-left ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white text-on-surface-variant hover:bg-surface-container border border-surface-container'}`}
              >
                 <span className="text-xs font-bold whitespace-nowrap">
                   {cat} {cat === 'Minha Playlist' && customPlaylist.length > 0 ? `(${customPlaylist.length})` : ''}
                 </span>
              </button>
            ))}
          </div>
        </section>

        {/* List Section */}
        <section className="space-y-4">
           <h3 className="text-lg font-black tracking-tight text-primary font-display px-1">
             {selectedCategory === 'Geral' ? 'Prática Diária' : selectedCategory === 'Minha Playlist' ? 'Músicas Importadas do Telefone' : `Músicas de ${selectedCategory}`}
           </h3>
           <div className="space-y-3">
              {meditations.length > 0 ? meditations.map((item) => {
                 const isDownloading = downloadingIds[item.id] !== undefined;
                 const progressVal = downloadingIds[item.id] || 0;
                 const isDownloaded = downloadedIds.includes(item.id);
                 // @ts-ignore
                 const isCustom = item.isCustom;

                 return (
                  <div 
                    key={item.id} 
                    onClick={() => setActiveSession(item)}
                    className="flex items-center p-3.5 bg-white rounded-3xl shadow-sm border border-surface-container active:bg-sky-50 transition-all cursor-pointer group relative overflow-hidden"
                  >
                     <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container shrink-0">
                        <img src={item.image} alt="Practice" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                     </div>
                     <div className="ml-4 flex-grow text-left space-y-0.5 max-w-[55%]">
                        <h4 className="font-bold text-base leading-tight text-on-surface truncate">{item.title}</h4>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60 leading-tight truncate">
                          {isCustom ? "Playlist do Aparelho" : item.description}
                        </p>
                        
                        {/* Offline Status indicator */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {isCustom ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-extrabold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">Local</span>
                              <select
                                value={item.customCategory || 'Minha Playlist'}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const updated = customPlaylist.map(t => t.id === item.id ? { ...t, customCategory: e.target.value } : t);
                                  setCustomPlaylist(updated);
                                  try {
                                    localStorage.setItem('sisa_custom_playlist', JSON.stringify(updated.map(t => ({ ...t, audioUrl: '' }))));
                                  } catch (_) {}
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[8px] font-extrabold text-primary bg-primary/5 hover:bg-primary/10 px-1.5 py-0.5 rounded cursor-pointer border border-primary/10 focus:outline-none"
                                title="Alterar Categoria"
                              >
                                {categories.filter(c => c !== 'Geral').map(catOpt => (
                                  <option key={catOpt} value={catOpt}>{catOpt}</option>
                                ))}
                              </select>
                            </div>
                          ) : isDownloaded ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">Baixada</span>
                              <select
                                value={downloadedTrackCategories[item.id] || 'Relaxamento'}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const updated = { ...downloadedTrackCategories, [item.id]: e.target.value };
                                  setDownloadedTrackCategories(updated);
                                  try {
                                    localStorage.setItem('sisa_downloaded_track_categories', JSON.stringify(updated));
                                  } catch (_) {}
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[8px] font-extrabold text-primary bg-primary/5 hover:bg-primary/10 px-1.5 py-0.5 rounded cursor-pointer border border-primary/10 focus:outline-none"
                                title="Alterar Categoria"
                              >
                                {categories.filter(c => c !== 'Geral' && c !== 'Minha Playlist').map(catOpt => (
                                  <option key={catOpt} value={catOpt}>{catOpt}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-[8px] font-bold text-outline-variant bg-surface-container px-1.5 py-0.5 rounded">Remoto</span>
                          )}
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2 ml-auto shrink-0 z-10">
                        {/* Download Calm Music Button */}
                        {!isCustom && (
                          <button
                            onClick={(e) => handleDownload(e, item.id)}
                            disabled={isDownloaded || isDownloading}
                            className={`p-2 rounded-full transition-colors ${
                              isDownloaded 
                                ? 'text-primary/70 bg-primary/5' 
                                : isDownloading 
                                  ? 'text-primary font-mono text-[9px] bg-primary/10' 
                                  : 'text-on-surface-variant/45 hover:text-primary hover:bg-primary/5'
                            }`}
                            title={isDownloaded ? "Música Baixada Offline" : "Baixar para Ouvir Offline"}
                          >
                            {isDownloading ? (
                              <span className="font-bold">{progressVal}%</span>
                            ) : isDownloaded ? (
                              <CheckCircle size={18} className="text-primary font-black" />
                            ) : (
                              <Download size={18} />
                            )}
                          </button>
                        )}

                        {isCustom && (
                          <button
                            onClick={(e) => deleteCustomTrack(e, item.id)}
                            className="p-2 text-error/40 hover:text-error hover:bg-error/5 rounded-full transition-colors"
                            title="Remover Playlist"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        <div className="w-10 h-10 rounded-full bg-surface-container text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                           <Play size={18} fill="currentColor" />
                        </div>
                     </div>
                  </div>
                 );
              }) : (
                <div className="text-center py-12 bg-white/50 border border-dashed border-surface-container rounded-3xl space-y-3">
                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Nenhuma música nesta categoria</p>
                   {selectedCategory === 'Minha Playlist' && (
                     <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                       Toque no botão acima para importar as músicas ou melodias calmas do seu telemóvel!
                     </p>
                   )}
                </div>
              )}
           </div>
        </section>
      </main>

      {/* DIALOG DE REORGANIZAÇÃO APÓS DOWNLOAD */}
      {justDownloadedTrack && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full mx-auto flex items-center justify-center">
              <CheckCircle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-on-surface tracking-tight">Música Baixada!</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                A música <strong>{justDownloadedTrack.title}</strong> foi salva no aparelho.
              </p>
              <div className="pt-1 text-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full inline-block">
                  Organizar Música
                </span>
                <p className="text-[11px] font-medium text-on-surface mt-2">
                  Em qual categoria deseja organizar esta música?
                </p>
              </div>
            </div>

            {/* Category selection buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {categories.filter(c => c !== 'Geral' && c !== 'Minha Playlist').map((catOpt) => (
                <button
                  key={catOpt}
                  onClick={() => {
                    const updated = { ...downloadedTrackCategories, [justDownloadedTrack.id]: catOpt };
                    setDownloadedTrackCategories(updated);
                    try {
                      localStorage.setItem('sisa_downloaded_track_categories', JSON.stringify(updated));
                    } catch (_) {}
                    setJustDownloadedTrack(null);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-surface-container hover:bg-primary hover:text-white text-xs font-black text-on-surface-variant hover:shadow-md transition-all text-center"
                >
                  {catOpt}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setJustDownloadedTrack(null)}
                className="w-full py-3 rounded-xl border border-surface-container text-xs font-black text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
              >
                Manter na Categoria Padrão
              </button>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">SISA Saúde</p>
                <p className="text-sm font-bold truncate max-w-[200px]">{activeSession.title}</p>
             </div>
             <button 
               onClick={() => setIsMuted(!isMuted)} 
               className="p-3 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center text-white"
               title={isMuted ? "Ativar Áudio" : "Silenciar"}
             >
               {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
             </button>
          </div>

          {/* Album Art with pulse visual effect when playing */}
          <div className="relative z-10 flex-1 flex items-center justify-center px-12">
             <div className={`w-64 h-64 md:w-80 md:h-80 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/20 transition-all duration-1000 ${isPlaying ? 'scale-105 shadow-primary-container/30 ring-white/40' : 'scale-95 opacity-90'}`}>
                <img src={activeSession.image.replace('200/200', '800/800')} alt="" className="w-full h-full object-cover" />
             </div>
          </div>

          {/* Controls */}
          <div className="relative z-10 p-12 space-y-10">
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">{activeSession.title}</h2>
                <p className="text-white/60 font-medium text-lg leading-tight px-4 truncate">
                  {/* @ts-ignore */}
                  {activeSession.isCustom ? "Aparelho do Usuário" : activeSession.description.split(' por ')[1] || 'SISA Integrado'}
                </p>
             </div>

             {/* Progress Bar (Clickable Seekbar) */}
             <div className="space-y-3">
                <div 
                  className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const nextSec = Math.floor(percentage * duration);
                    if (audioRef.current) {
                      audioRef.current.currentTime = nextSec;
                    }
                    setCurrentTime(nextSec);
                  }}
                >
                   <div 
                     className="h-full bg-white rounded-full relative transition-all duration-300"
                     style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                   >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                   </div>
                </div>
                <div className="flex justify-between text-[10px] font-black text-white/40 tracking-widest uppercase">
                   <span>{formatTime(currentTime)}</span>
                   <span>{formatTime(duration)}</span>
                </div>
             </div>

             <div className="flex items-center justify-between px-4">
                <button onClick={handleSkipBackward} className="text-white/40 hover:text-white active:scale-90 transition-all" title="Recuar 15s">
                   <SkipBack size={32} fill="currentColor" />
                </button>
                <button 
                  onClick={handlePlayToggle}
                  className="w-20 h-20 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl active:scale-95 hover:scale-105 transition-all"
                >
                   {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={handleSkipForward} className="text-white/40 hover:text-white active:scale-90 transition-all" title="Avançar 15s">
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
  const [isRegistering, setIsRegistering] = useState<'treino' | 'refeição' | 'vitals' | null>(null);
  const [regDescription, setRegDescription] = useState('');
  const [vitalsType, setVitalsType] = useState<string | null>(null);
  const [vitalsValue, setVitalsValue] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<SearchItem | null>(null);
  
  const [vitalsData, setVitalsData] = useState({
    'Batimento': { val: '72', unit: 'bpm', icon: HeartPulse, color: 'text-error', bg: 'bg-error/10' },
    'Pressão': { val: '12/8', unit: 'mmHg', icon: ActivityIcon, color: 'text-primary', bg: 'bg-primary/10' },
    'Glicose': { val: '95', unit: 'mg/dL', icon: Droplet, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    'Saturação': { val: '98', unit: '%', icon: Zap, color: 'text-secondary', bg: 'bg-secondary/10' },
    'Peso': { val: '74.5', unit: 'kg', icon: Scale, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    'Altura': { val: '1.78', unit: 'm', icon: Ruler, color: 'text-amber-600', bg: 'bg-amber-600/10' },
    'Temperatura': { val: '36.6', unit: '°C', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'Sono': { val: '7h 12m', unit: '', icon: Moon, color: 'text-primary', bg: 'bg-primary/10' }
  });

  const [recentActivities, setRecentActivities] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('sisa_recent_activities');
      return saved ? JSON.parse(saved) : [
        { title: 'Corrida Matinal', time: 'Hoje, 07:30', kcal: '+320', color: 'bg-secondary text-white', iconName: 'ActivityIcon' },
        { title: 'Yoga', time: 'Ontem, 18:00', kcal: '+120', color: 'bg-primary text-white', iconName: 'User' }
      ];
    } catch (_) {
      return [
        { title: 'Corrida Matinal', time: 'Hoje, 07:30', kcal: '+320', color: 'bg-secondary text-white', iconName: 'ActivityIcon' },
        { title: 'Yoga', time: 'Ontem, 18:00', kcal: '+120', color: 'bg-primary text-white', iconName: 'User' }
      ];
    }
  });

  // Scheduled training sessions state
  const [scheduledTrainings, setScheduledTrainings] = useState<{ id: string; activityId: string; title: string; dateTime: string; kcal: string; image: string }[]>(() => {
    try {
      const saved = localStorage.getItem('sisa_scheduled_trainings');
      return saved ? JSON.parse(saved) : [
        { id: 'sc1', activityId: 'a3', title: 'Treino HIIT Definição', dateTime: 'Previsão para Amanhã às 08:30', kcal: '320', image: 'https://picsum.photos/seed/hiit/200/200' },
        { id: 'sc2', activityId: 'a4', title: 'Pilates Postural (Core)', dateTime: 'Previsão para Segunda às 17:00', kcal: '250', image: 'https://picsum.photos/seed/pilates/200/200' }
      ];
    } catch (_) {
      return [
        { id: 'sc1', activityId: 'a3', title: 'Treino HIIT Definição', dateTime: 'Previsão para Amanhã às 08:30', kcal: '320', image: 'https://picsum.photos/seed/hiit/200/200' },
        { id: 'sc2', activityId: 'a4', title: 'Pilates Postural (Core)', dateTime: 'Previsão para Segunda às 17:00', kcal: '250', image: 'https://picsum.photos/seed/pilates/200/200' }
      ];
    }
  });

  // Scheduling inputs inside the detail view
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Active live workout details
  const [activeWorkout, setActiveWorkout] = useState<{ id: string; title: string; image: string; expectedDuration: string; expectedKcal: string; elapsedSeconds: number; burnMultiplier: number } | null>(null);

  // Active training workout timer effect
  useEffect(() => {
    let interval: any = null;
    if (activeWorkout) {
      interval = setInterval(() => {
        setActiveWorkout(prev => {
          if (!prev) return null;
          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1
          };
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeWorkout]);

  const activities = SEARCH_DATA.filter(item => item.type === 'Atividade');

  const handleConfirmRegistration = () => {
    if (isRegistering === 'vitals') {
      if (!vitalsValue || !vitalsType) return;
      
      const val = parseFloat(vitalsValue.replace(',', '.'));
      
      if (vitalsType === 'Peso') {
        if (isNaN(val) || val < 10 || val > 350) {
          alert('Por favor, insira um peso válido entre 10kg e 350kg.');
          return;
        }
      }

      if (vitalsType === 'Altura') {
        if (isNaN(val) || val < 0.5 || val > 2.8) {
          alert('Por favor, insira uma altura válida entre 0.5m e 2.8m (Ex: 1.75).');
          return;
        }
      }

      setVitalsData({
        ...vitalsData,
        [vitalsType]: { ...vitalsData[vitalsType as keyof typeof vitalsData], val: vitalsValue }
      });
      setIsRegistering(null);
      setVitalsValue('');
      setVitalsType(null);
      return;
    }

    if (!regDescription.trim()) return;

    const isTreino = isRegistering === 'treino';
    const newReg = {
      title: regDescription,
      time: 'Agora',
      kcal: isTreino ? '+250' : '-350', // Simple mock values
      color: isTreino ? 'bg-secondary text-white' : 'bg-primary text-white',
      iconName: isTreino ? 'ActivityIcon' : 'Utensils'
    };

    const nextRecent = [newReg, ...recentActivities];
    setRecentActivities(nextRecent);
    try {
      localStorage.setItem('sisa_recent_activities', JSON.stringify(nextRecent));
    } catch (_) {}
    setRegDescription('');
    setIsRegistering(null);
  };

  return (
    <div className="pb-32 min-h-screen bg-surface">
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <section className="space-y-6">
               <div className="space-y-1 text-left">
                  <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Visão Diária</span>
                  <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Energia & Vitalidade</h2>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-16">
                     <div className="text-center md:text-left space-y-2 shrink-0">
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Calorias Restantes</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-6xl font-black text-primary tracking-tighter leading-none">1,420</span>
                           <span className="text-xl font-bold text-on-surface-variant">kcal</span>
                        </div>
                     </div>
                     <div className="flex-1 w-full space-y-6">
                        {[
                          { label: 'Gasto Energético', color: 'bg-secondary', pct: 65, val: '540 kcal' },
                          { label: 'Consumo Alimentar', color: 'bg-primary', pct: 44, val: '1,120 kcal' }
                        ].map((m) => (
                          <div key={m.label} className="space-y-2">
                             <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{m.label}</span>
                                <span className="text-xs font-black text-on-surface">{m.val}</span>
                             </div>
                             <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${m.pct}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className={`${m.color} h-full rounded-full`}
                                />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-surface-container-low p-5 rounded-3xl flex items-center justify-between border border-surface-container-high transition-transform active:scale-95 cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest leading-none">Queimadas</p>
                       <p className="text-xl font-black text-on-surface">540 <span className="text-[10px] font-bold opacity-40">kcal</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                       <Flame size={20} />
                    </div>
                  </div>
                  <div className="bg-primary p-5 rounded-3xl flex items-center justify-between text-white shadow-xl shadow-primary/20 transition-transform active:scale-95 cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase text-white/60 tracking-widest leading-none">Consumidas</p>
                       <p className="text-xl font-black">1,120 <span className="text-[10px] font-medium opacity-40">kcal</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                       <Utensils size={20} />
                    </div>
                  </div>
               </div>
            </section>
    
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                 onClick={() => setIsRegistering('treino')}
                 className="bg-gradient-to-br from-primary to-[#074469dd] text-white py-6 px-8 rounded-[2rem] flex items-center justify-between active:scale-95 transition-all shadow-xl shadow-primary/20"
               >
                  <div className="text-left space-y-1">
                     <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest leading-none">Treino</span>
                     <span className="text-xl font-black tracking-tight block">Registrar Exercício</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                     <Plus size={24} />
                  </div>
               </button>
               <button 
                 onClick={() => setIsRegistering('refeição')}
                 className="bg-white text-primary py-6 px-8 rounded-[2rem] flex items-center justify-between active:scale-95 transition-all border-2 border-surface-container shadow-sm hover:border-primary/20"
               >
                  <div className="text-left space-y-1">
                     <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest leading-none">Alimentação</span>
                     <span className="text-xl font-black tracking-tight block text-on-surface">Adicionar Refeição</span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                     <Utensils size={24} />
                  </div>
               </button>
            </section>
     
            {/* PRÓXIMOS TREINOS AGENDADOS */}
            <section className="space-y-4 text-left">
               <div className="flex justify-between items-end px-1">
                  <div className="space-y-0.5">
                     <span className="text-[9px] font-black uppercase text-secondary tracking-widest leading-none">Seu Planejamento</span>
                     <h3 className="text-xl font-black font-display tracking-tight text-primary">Treinos Agendados ({scheduledTrainings.length})</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('treinos')}
                    className="text-primary font-black text-[9px] uppercase tracking-widest hover:underline"
                  >
                    Ver Biblioteca
                  </button>
               </div>

               {scheduledTrainings.length === 0 ? (
                 <div className="bg-white p-8 rounded-3xl border border-surface-container text-center space-y-3">
                   <p className="text-xs text-on-surface-variant font-medium">Nenhum treino agendado para os próximos dias.</p>
                   <button
                     onClick={() => setActiveTab('treinos')}
                     className="bg-primary/5 hover:bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                   >
                     Agendar Novo Treino
                   </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledTrainings.map((sched) => (
                      <div key={sched.id} className="bg-white rounded-[2rem] border border-surface-container shadow-sm p-4.5 flex gap-4 items-center relative overflow-hidden group">
                         <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 relative bg-surface-container">
                            <img src={sched.image} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10" />
                         </div>
                         <div className="flex-1 space-y-0.5 text-left min-w-0">
                            <h4 className="font-black text-sm text-on-surface tracking-tight leading-tight truncate">{sched.title}</h4>
                            <div className="flex items-center gap-1 text-secondary">
                               <Calendar size={11} />
                               <span className="text-[10px] font-black leading-none uppercase tracking-tight">{sched.dateTime}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-1.5 shrink-0 z-10">
                            <button
                              onClick={() => {
                                // Start active live workout session based on this schedule!
                                setActiveWorkout({
                                  id: sched.activityId,
                                  title: sched.title,
                                  image: sched.image,
                                  expectedDuration: '25 Min',
                                  expectedKcal: sched.kcal,
                                  elapsedSeconds: 0,
                                  burnMultiplier: 0.15
                                });
                              }}
                              className="bg-primary hover:bg-primary-dark text-white rounded-xl p-2.5 active:scale-95 transition-all shadow-md shadow-primary/10"
                              title="Começar agora!"
                            >
                               <Play size={12} fill="currentColor" />
                            </button>
                            <button
                              onClick={() => {
                                const nextSched = scheduledTrainings.filter(t => t.id !== sched.id);
                                setScheduledTrainings(nextSched);
                                try {
                                  localStorage.setItem('sisa_scheduled_trainings', JSON.stringify(nextSched));
                                } catch (_) {}
                              }}
                              className="bg-surface-container hover:bg-red-50 text-on-surface-variant hover:text-red-500 rounded-xl p-2.5 active:scale-95 transition-all"
                              title="Remover agendamento"
                            >
                               <Trash2 size={12} />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </section>

            <section className="space-y-6 text-left">
               <div className="flex justify-between items-end px-1">
                  <h3 className="text-xl font-black font-display tracking-tight text-primary uppercase tracking-tighter">Histórico Recente</h3>
                  <button className="text-primary font-black text-[9px] uppercase tracking-widest hover:underline">Ver tudo</button>
               </div>
               <div className="space-y-3">
                  {recentActivities.map((act, i) => {
                    const IconComponent = act.icon || (act.iconName === 'User' ? User : act.iconName === 'Utensils' ? Utensils : ActivityIcon);
                    return (
                      <div key={i} className="bg-white p-4 rounded-[2rem] flex items-center gap-5 shadow-sm border border-surface-container active:bg-sky-50 transition-all cursor-pointer group">
                         <div className={`${act.color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                            <IconComponent size={24} />
                         </div>
                         <div className="flex-1 space-y-0.5">
                            <h4 className="font-black text-base text-on-surface tracking-tight leading-none">{act.title}</h4>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">{act.time}</p>
                         </div>
                         <div className="text-right flex flex-col items-end">
                            <span className={`font-black text-2xl tracking-tighter ${act.kcal.startsWith('+') ? 'text-secondary' : 'text-primary'}`}>{act.kcal}</span>
                            <span className="text-[8px] font-black text-outline uppercase tracking-widest leading-none">kcal</span>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'treinos' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-left">
            <div className="space-y-1">
               <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Biblioteca</span>
               <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Sessões de Treino</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
               {activities.map((act) => (
                 <div 
                   key={act.id} 
                   onClick={() => setSelectedActivity(act)}
                   className="bg-white rounded-[2.5rem] border border-surface-container shadow-sm overflow-hidden flex flex-col group active:scale-[0.98] transition-all cursor-pointer"
                 >
                   <div className="h-48 w-full overflow-hidden relative">
                      <img src={act.image.replace('200/200', '800/400')} alt={act.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="bg-secondary px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Intermediário</span>
                         </div>
                         <h4 className="text-xl font-black tracking-tight">{act.title}</h4>
                      </div>
                   </div>
                   <div className="p-6">
                      <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mb-6 line-clamp-2">{act.description}</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5 text-secondary">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">25 Min</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-primary">
                            <Flame size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">320 kcal</span>
                         </div>
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'nutrição' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-left pb-10">
            <div className="space-y-1">
               <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Análise Macronutricional</span>
               <h2 className="text-3xl font-black font-display tracking-tighter text-primary">Nutrição Inteligente</h2>
            </div>

            {/* Macros Counter */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Carbs', val: '120g', limit: '250g', pct: 48, color: 'text-primary' },
                { label: 'Proteína', val: '85g', limit: '140g', pct: 60, color: 'text-secondary' },
                { label: 'Gordura', val: '40g', limit: '70g', pct: 57, color: 'text-amber-500' }
              ].map(m => (
                <div key={m.label} className="bg-white p-5 rounded-[2rem] border border-surface-container flex flex-col items-center gap-4 shadow-sm">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-surface-container" />
                      <motion.circle 
                        initial={{ strokeDashoffset: 175.9 }}
                        animate={{ strokeDashoffset: 175.9 - (175.9 * m.pct) / 100 }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray="175.9" 
                        className={`${m.color} transition-all`} 
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black">{m.pct}%</span>
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest leading-none">{m.label}</p>
                    <p className="text-sm font-black text-on-surface">{m.val}</p>
                    <p className="text-[8px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Meta: {m.limit}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-secondary-container/20 border border-secondary/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
               <div className="w-16 h-16 rounded-3xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-lg relative z-10">
                  <Apple size={32} />
               </div>
               <div className="text-center md:text-left relative z-10 space-y-1">
                  <h4 className="font-black text-lg text-secondary tracking-tight">Equilíbrio Alimentar</h4>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed">Você consumiu <span className="font-black text-on-surface">1,120 kcal</span> das <span className="font-black text-on-surface">2,500 kcal</span> recomendadas para seu peso e altura.</p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full translate-x-10 -translate-y-10"></div>
            </div>

            <div className="space-y-4">
               {['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'].map((meal) => (
                 <div 
                   key={meal} 
                   onClick={() => {
                     setRegDescription(meal);
                     setIsRegistering('refeição');
                   }}
                   className="bg-white p-6 rounded-[2rem] border border-surface-container shadow-sm flex items-center justify-between group cursor-pointer active:bg-surface-container active:scale-[0.99] transition-all"
                 >
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                          <Utensils size={24} />
                       </div>
                       <div className="text-left">
                          <p className="font-black text-base text-on-surface tracking-tight leading-none">{meal}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40 mt-1">Registrar agora</p>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-surface-container flex items-center justify-center text-outline group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                       <Plus size={20} />
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'vitais' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 text-left pb-16">
            <div className="flex justify-between items-end">
               <div className="space-y-1">
                  <span className="text-on-surface-variant font-black tracking-widest uppercase text-[9px]">Sinais Vitais</span>
                  <h2 className="text-3xl font-black font-display tracking-tighter text-primary tracking-tighter">Bio-Monitoramento</h2>
               </div>
               <button 
                onClick={() => {
                  setIsRegistering('vitals');
                  setVitalsType('Batimento');
                }}
                className="bg-primary/10 text-primary p-3 rounded-2xl active:scale-90 transition-all"
               >
                 <Plus size={20} />
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(vitalsData) as [string, typeof vitalsData['Batimento']][]).map(([label, v]) => (
                <div 
                  key={label} 
                  onClick={() => {
                    setIsRegistering('vitals');
                    setVitalsType(label);
                    setVitalsValue(v.val);
                  }}
                  className="bg-white p-6 rounded-[2.5rem] border border-surface-container shadow-sm flex flex-col gap-6 active:scale-95 transition-all cursor-pointer group hover:border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                      <v.icon size={24} />
                    </div>
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container px-2.5 py-1.5 rounded-full">OK</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-on-surface tracking-tighter">{v.val}</span>
                      <span className="text-xs font-bold text-on-surface-variant opacity-60 tracking-tight">{v.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary to-primary-container rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
               <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                     <Wifi size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Modo Offline SISA</span>
               </div>
               <p className="text-sm font-medium leading-relaxed opacity-80 relative z-10">
                 Seu SISA detectou instabilidade na rede. Todos os registros vitais serão <span className="font-black underline">enclausurados localmente</span> e sincronizados com a nuvem automaticamente quando o sinal retornar.
               </p>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-[80px]"></div>
            </div>
          </motion.div>
        )}
      </main>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {isRegistering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden shadow-black/20"
             >
                <div className="bg-primary p-10 text-white relative text-left">
                   <button onClick={() => setIsRegistering(null)} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                   <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Registrar {isRegistering === 'vitals' ? vitalsType : isRegistering}</h3>
                   <p className="text-white/60 text-xs font-bold mt-2 uppercase tracking-widest">Cloud Sync Ativado</p>
                </div>
                <div className="p-10 space-y-8 text-left">
                   {isRegistering === 'vitals' ? (
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">Novo Valor de {vitalsType}</label>
                           <input 
                             type="number"
                             min={vitalsType === 'Peso' ? 10 : vitalsType === 'Altura' ? 0.5 : undefined}
                             max={vitalsType === 'Peso' ? 450 : vitalsType === 'Altura' ? 2.8 : undefined}
                             step={vitalsType === 'Altura' ? 0.01 : 0.1}
                             value={vitalsValue}
                             onChange={(e) => setVitalsValue(e.target.value)}
                             placeholder={`Valor em ${vitalsData[vitalsType as keyof typeof vitalsData]?.unit || ''}`}
                             className="w-full bg-surface-container rounded-2xl px-6 py-5 text-xl font-black border-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner text-on-surface" 
                           />
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest ml-1">O que você fez?</label>
                        <input 
                          type="text" 
                          value={regDescription}
                          onChange={(e) => setRegDescription(e.target.value)}
                          placeholder={isRegistering === 'treino' ? "Ex: Corrida de 5km" : "Ex: Salada de Frutas"} 
                          className="w-full bg-surface-container rounded-2xl px-6 py-5 text-lg font-bold border-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" 
                        />
                     </div>
                   )}
                   <button 
                     onClick={handleConfirmRegistration}
                     className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     <CheckCircle size={20} />
                     Confirmar Registro
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVITY DETAIL MODAL */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] flex flex-col bg-surface overflow-y-auto"
          >
             <div className="relative h-[45vh] w-full overflow-hidden shrink-0">
                <img src={selectedActivity.image.replace('200/200', '1200/800')} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/30" />
                <button onClick={() => setSelectedActivity(null)} className="absolute top-12 left-6 p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white active:scale-90 transition-all"><ChevronDown size={24} /></button>
             </div>
             <div className="p-10 space-y-10 flex-1 text-left flex flex-col pt-0 -mt-12 relative z-10">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-6">
                  <div>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-3 inline-block">Nível Avançado</span>
                    <h2 className="text-5xl font-black text-on-surface tracking-tighter leading-none">{selectedActivity.title}</h2>
                    <p className="text-on-surface-variant font-medium text-sm leading-relaxed mt-6">{selectedActivity.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col gap-2">
                        <Clock size={20} className="text-secondary" />
                        <p className="text-xs font-black">25 Minutos</p>
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Duração média</p>
                     </div>
                     <div className="bg-surface-container-low p-5 rounded-2xl flex flex-col gap-2">
                        <Flame size={20} className="text-primary" />
                        <p className="text-xs font-black">320 Calorias</p>
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Esforço intenso</p>
                     </div>
                  </div>

                  {isScheduling ? (
                    <div className="space-y-4 pt-4 border-t border-surface-container-high transition-all text-left">
                       <h4 className="text-sm font-black text-primary">Preencha o Dia e Horário:</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Data do Treino</label>
                             <input 
                                type="date" 
                                value={scheduleDate} 
                                onChange={(e) => setScheduleDate(e.target.value)} 
                                className="w-full bg-surface-container rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none" 
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Horário do Treino</label>
                             <input 
                                type="time" 
                                value={scheduleTime} 
                                onChange={(e) => setScheduleTime(e.target.value)} 
                                className="w-full bg-surface-container rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none" 
                             />
                          </div>
                       </div>
                       
                       <div className="flex gap-2 pt-2">
                          <button
                             onClick={() => {
                               if (!scheduleDate || !scheduleTime) {
                                 alert('Por favor, informe a data e o horário para o agendamento.');
                                 return;
                               }
                               
                               const formattedDate = new Date(`${scheduleDate}T00:00:00`);
                               const dateString = formattedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                               const dayLabel = `${dateString} às ${scheduleTime}`;

                               const newSchedule = {
                                 id: Date.now().toString(),
                                 activityId: selectedActivity.id,
                                 title: selectedActivity.title,
                                 dateTime: dayLabel,
                                 kcal: '320',
                                 image: selectedActivity.image
                               };

                               const updated = [newSchedule, ...scheduledTrainings];
                               setScheduledTrainings(updated);
                               try {
                                 localStorage.setItem('sisa_scheduled_trainings', JSON.stringify(updated));
                               } catch (_) {}

                               setIsScheduling(false);
                               setSelectedActivity(null);
                               setScheduleDate('');
                               setScheduleTime('');
                               alert(`Treino de "${selectedActivity.title}" agendado para ${dayLabel}! Você pode encontrá-lo na sua aba de Visão Diária.`);
                             }}
                             className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-xs active:scale-95 transition-all text-center"
                          >
                             Confirmar Agendamento
                          </button>
                          <button
                             onClick={() => setIsScheduling(false)}
                             className="px-5 bg-surface-container text-on-surface-variant py-3.5 rounded-xl font-bold text-xs active:scale-95 transition-all"
                          >
                             Cancelar
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-6 border-t border-surface-container">
                       <button 
                         onClick={() => {
                           setActiveWorkout({
                             id: selectedActivity.id,
                             title: selectedActivity.title,
                             image: selectedActivity.image,
                             expectedDuration: '25 Min',
                             expectedKcal: '320',
                             elapsedSeconds: 0,
                             burnMultiplier: 0.15
                           });
                           setSelectedActivity(null);
                         }}
                         className="bg-primary text-white py-4 px-3 rounded-2xl font-black text-xs shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                       >
                         <Play size={14} fill="currentColor" />
                         Começar Agora
                       </button>
                       <button 
                         onClick={() => {
                           const today = new Date().toISOString().split('T')[0];
                           setScheduleDate(today);
                           setScheduleTime('08:00');
                           setIsScheduling(true);
                         }}
                         className="bg-secondary text-white py-4 px-3 rounded-2xl font-black text-xs shadow-lg shadow-secondary/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                       >
                         <Calendar size={14} />
                         Agendar Treino
                        </button>

                        {/* ACTIVE WORKOUT LIVE TIMER OVERLAY */}
                        <AnimatePresence>
                          {activeWorkout && (
                            <motion.div
                              initial={{ opacity: 0, y: '100%' }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: '100%' }}
                              className="fixed inset-0 z-[250] bg-black text-white p-8 flex flex-col justify-between animate-none"
                            >
                               {/* Header */}
                               <div className="flex justify-between items-center pt-8 shrink-0">
                                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-secondary font-display">SISA Treino Ao Vivo</span>
                                  <button 
                                    onClick={() => {
                                      if (confirm("Deseja interromper e cancelar este treino? Nenhum progresso será salvo.")) {
                                        setActiveWorkout(null);
                                      }
                                    }} 
                                    className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white/80 active:scale-95 transition-all"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>

                               {/* Center Content */}
                               <div className="flex-1 flex flex-col items-center justify-center space-y-12 my-6">
                                  
                                  {/* Visual pulsating bubble with timer inside */}
                                  <div className="relative w-64 h-64 flex items-center justify-center">
                                     <motion.div 
                                       animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.4, 0.15] }}
                                       transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                       className="absolute inset-0 rounded-full bg-primary/20 border-2 border-primary/30"
                                     />
                                     <motion.div 
                                       animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                       transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                       className="absolute inset-4 rounded-full bg-secondary/15 border-2 border-secondary/20"
                                     />
                                     
                                     {/* Real-time stats */}
                                     <div className="relative text-center z-10 space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Tempo Decorrido</p>
                                        
                                        <p className="text-5xl font-black font-mono tracking-tighter text-white">
                                           {String(Math.floor(activeWorkout.elapsedSeconds / 60)).padStart(2, '0')}:
                                           {String(activeWorkout.elapsedSeconds % 60).padStart(2, '0')}
                                        </p>

                                        <div className="flex items-center justify-center gap-1.5 text-secondary animate-pulse pt-2">
                                           <HeartPulse size={16} />
                                           <span className="text-xs font-black uppercase tracking-widest font-sans">132 bpm</span>
                                        </div>
                                     </div>
                                  </div>

                                  {/* Training metadata information */}
                                  <div className="text-center space-y-3">
                                     <h3 className="text-3xl font-black tracking-tight leading-none text-white font-display uppercase">{activeWorkout.title}</h3>
                                     <p className="text-xs text-white/50 font-medium font-sans">Estimativa do treino: {activeWorkout.expectedDuration} • {activeWorkout.expectedKcal} kcal</p>
                                  </div>

                                  {/* Energy dynamic counters */}
                                  <div className="grid grid-cols-2 gap-8 w-full max-w-sm bg-white/5 rounded-[2rem] p-6 border border-white/10 text-center">
                                     <div className="space-y-1 border-r border-white/10">
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Energia Queimada</p>
                                        <p className="text-2xl font-black text-secondary">+{Math.round(activeWorkout.elapsedSeconds * activeWorkout.burnMultiplier)} <span className="text-[10px] opacity-60 font-sans">kcal</span></p>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none font-display">Status Geral</p>
                                        <p className="text-2xl font-black text-primary animate-pulse">Estável</p>
                                     </div>
                                  </div>
                               </div>

                               {/* Bottom CTA Actions */}
                               <div className="pb-8 space-y-3 pt-4 shrink-0 justify-center flex flex-col max-w-md mx-auto w-full">
                                  <button
                                    onClick={() => {
                                      const elapsedMin = Math.floor(activeWorkout.elapsedSeconds / 60);
                                      const elapsedSec = activeWorkout.elapsedSeconds % 60;
                                      const finalKcal = Math.round(activeWorkout.elapsedSeconds * activeWorkout.burnMultiplier);
                                      
                                      const timeString = elapsedMin > 0 ? `${elapsedMin}m ${elapsedSec}s` : `${elapsedSec}s`;
                                      
                                      const newReg = {
                                        title: activeWorkout.title,
                                        time: `Agora (${timeString})`,
                                        kcal: `+${finalKcal}`,
                                        color: 'bg-gradient-to-r from-secondary to-primary text-white',
                                        iconName: 'ActivityIcon'
                                      };

                                      const nextRecent = [newReg, ...recentActivities];
                                      setRecentActivities(nextRecent);
                                      try {
                                        localStorage.setItem('sisa_recent_activities', JSON.stringify(nextRecent));
                                      } catch (_) {}

                                      setActiveWorkout(null);
                                      alert(`Parabéns! Você concluiu o treino "${activeWorkout.title}"!\nTempo: ${timeString}\nCalorias queimadas: ${finalKcal} kcal.\nSeu progresso foi registrado com sucesso!`);
                                    }}
                                    className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary-dark hover:to-primary-dark text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-3"
                                  >
                                     <CheckCircle size={16} />
                                     Concluir e Salvar Treino
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Deseja interromper este treino? Seu tempo atual não será salvo.")) {
                                        setActiveWorkout(null);
                                      }
                                    }}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                  >
                                     Parar Exercício
                                  </button>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * PRESCRIPTIONS SCREEN
 */
function Prescriptions({ onNavigate, onMenuClick, data }: ScreenProps & { data: Prescription[] }) {
  const [activeFilter, setActiveFilter] = useState<'Ativas' | 'Histórico'>('Ativas');

  const filtered = data.length > 0 ? data : [
    { id: '1', medication: 'Amoxicilina 500mg', dosage: '500mg', frequency: 'Tomar de 8 em 8 horas por 7 dias.', duration: '7 dias', created_at: new Date().toISOString() },
  ];

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
                   <span className="text-[10px] font-black text-outline uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
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
                   <button 
                     onClick={() => alert(`Baixando PDF de ${p.med}...`)}
                     className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-primary/20"
                   >
                      <Download size={14} />
                      Baixar PDF
                   </button>
                   <button 
                     onClick={() => alert('Compartilhando receita...')}
                     className="w-14 h-14 bg-surface-container-low text-primary rounded-2xl flex items-center justify-center active:scale-95 transition-all hover:bg-primary/10"
                   >
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
           <button 
             onClick={() => onNavigate('consultations')}
             className="bg-white text-secondary py-4 px-8 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-xl"
           >
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
function Appointments({ onNavigate, onMenuClick, data }: ScreenProps & { data: Consultation[] }) {
  const [view, setView] = useState<'Abertos' | 'Finalizados'>('Abertos');

  const filtered = (data.length > 0 ? data : [
    { id: '1', specialty: 'Cardiologia', date: 'Hoje, 14:30', status: 'Confirmado' },
  ]).filter(a => {
    const isCompleted = a.status === 'Concluído' || a.status === 'Finalizado';
    return view === 'Finalizados' ? isCompleted : !isCompleted;
  });

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
                        <img src={`https://picsum.photos/seed/unit_${a.id}/200/200`} alt="" className="w-full h-full object-cover" />
                     </div>
                     <div className="space-y-0.5 min-w-0">
                        <h4 className="font-black text-lg text-on-surface tracking-tight leading-none truncate">{a.specialty}</h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">SISA Health Unit</p>
                        <div className="flex items-center gap-1.5 mt-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${a.status === 'Confirmado' ? 'bg-secondary/10 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>{a.status}</span>
                           <span className="text-[8px] font-bold text-outline uppercase tracking-widest">•</span>
                           <span className="text-[8px] font-black text-primary uppercase tracking-widest">Telemedicina</span>
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
                        <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Data & Hora</p>
                        <p className="text-xs font-black text-on-surface">{new Date(a.date).toLocaleString('pt-BR')}</p>
                     </div>
                  </div>
                  {a.status !== 'Concluído' ? (
                    <button className="bg-secondary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 active:scale-95 transition-all">
                       Entrar
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

interface Message {
  role: 'user' | 'ai';
  text: string;
  attachment?: {
    type: string;
    data: string;
  };
}

/**
 * TERMS AND PRIVACY SCREEN
 */
function TermsAndPrivacy({ onBack }: { onBack: () => void, key?: string }) {
  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-surface/80 backdrop-blur-xl z-50">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-surface-container active:scale-90 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-on-surface tracking-tight">Termos e Privacidade</h1>
      </header>

      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-surface-container">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight mb-4">Proteção SISA</h2>
          <p className="text-on-surface-variant font-medium leading-relaxed">
            Sua privacidade é nossa prioridade absoluta. O SISA (Sistema Integrado de Saúde Angolano) foi desenhado para ser seu aliado seguro na jornada da saúde.
          </p>
        </section>

        <div className="space-y-6 px-2">
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Eye size={16} /> O Que Coletamos?
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Coletamos apenas informações essenciais para sua saúde: Nome, idade, histórico de consultas, receitas médicas e evoluções clínicas sincronizadas com o sistema hospitalar parceiro.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <ShieldCheck size={16} /> Segurança de Dados
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Não teremos "acesso total" à sua vida privada por diversão; todos os dados são criptografados. Você tem controle total: pode ver, atualizar ou solicitar a exclusão dos seus dados a qualquer momento através do seu perfil.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Info size={16} /> Uso da IA
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              O SISA AI analisa suas imagens e exames para facilitar o entendimento técnico, mas lembre-se: <strong>a IA não substitui um médico real</strong>. Use as informações como suporte e sempre consulte um profissional.
            </p>
          </div>

          <div className="p-6 bg-surface-container-low rounded-3xl border border-surface-container italic text-[11px] text-on-surface-variant leading-relaxed">
            "Nosso compromisso é com a transparência. Você sabe exatamente o que o sistema possui: seu prontuário digital e sua evolução de bem-estar, nada além disso."
          </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full bg-on-surface text-surface py-5 rounded-[2rem] font-black text-sm active:scale-95 transition-all"
        >
          Entendi e Aceito
        </button>
      </main>
    </div>
  );
}

/**
 * NEW: SISA AI ASSISTANT
 */
function AIAssistant({ onNavigate, onMenuClick }: ScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Olá! Sou o SISA AI. Como posso ajudar com sua saúde hoje? Agora você pode me enviar fotos de exames, receitas ou sintomas para eu analisar!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, data: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial health check
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        if (!data.apiKeySet) {
          setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Aviso: A chave GEMINI_API_KEY não foi detectada no servidor. O chat não funcionará até que seja configurada nas definições do ambiente." }]);
        }
      })
      .catch(() => {
        setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Erro: Não foi possível conectar ao servidor backend (/api/health)." }]);
      });
  }, []);

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
    
    const newUserMessage: Message = { 
      role: 'user', 
      text: userMsg,
      attachment: currentAttachment ? { type: currentAttachment.type, data: currentAttachment.data } : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(newUserMessage),
          systemInstruction: "Você é o SISA AI, um assistente de saúde amigável e profissional para o aplicativo SISA (Sistema Integrado de Saúde Angolano). Você pode analisar imagens de sintomas, receitas médicas e documentos/exames em PDF. Ajude o usuário com dúvidas sobre saúde, nutrição e bem-estar. Seja conciso e sempre recomenda consultar um médico real para diagnósticos graves. Use um tom empático e acolhedor em português do Brasil. Se o usuário enviar uma prescrição ou exame, explique os termos técnicos de forma simples."
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMsg = `Erro: ${error.message}.`;
      if (error.message.includes('API key')) {
        errorMsg = "A chave da API Gemini não está configurada no servidor. Por favor, adicione GEMINI_API_KEY nas configurações do ambiente.";
      } else if (error.message.includes('fetch')) {
        errorMsg = "Não foi possível conectar ao servidor da SISA AI. Verifique se o servidor está rodando.";
      }
      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
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
function MentalHealth({ onNavigate, onMenuClick, evolutions }: ScreenProps & { evolutions?: ClinicalEvolution[] }) {
  const [mood, setMood] = useState<number | null>(null);
  const [sosMode, setSosMode] = useState<'none' | 'ansiedade' | 'depressao'>('none');
  const [breathPhase, setBreathPhase] = useState<'inspire' | 'segure' | 'expire'>('inspire');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isPracticeOpen, setIsPracticeOpen] = useState<'none' | 'zen' | 'diario'>('none');

  const playBreathingSound = (type: 'inhale' | 'exhale') => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      
      const bufferSize = audioCtx.sampleRate * 4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      
      const gainNode = audioCtx.createGain();
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      const duration = 4;

      if (type === 'inhale') {
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + duration);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.03, now + duration * 0.8);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      } else {
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + duration);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + duration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      }

      noise.start();
      noise.stop(now + duration);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  useEffect(() => {
    if (sosMode === 'ansiedade') {
      if (breathPhase === 'inspire') playBreathingSound('inhale');
      if (breathPhase === 'expire') playBreathingSound('exhale');
    }
  }, [breathPhase, sosMode, isAudioEnabled]);

  const getMoodFeedback = () => {
    if (!mood) return null;
    switch (mood) {
      case 1: // Muito Mal
        return {
          title: "Sinto muito que esteja assim.",
          message: "Momentos difíceis são parte da jornada, mas você não precisa passar por isso sozinho. Vamos tentar te acalmar?",
          recommendations: [
            { icon: <Zap size={18} />, title: "Modo SOS Ansiedade", desc: "Técnicas de respiração imediata.", action: () => setSosMode('ansiedade') },
            { icon: <MessageSquare size={18} />, title: "Desabafar com a SISA AI", desc: "Fale sobre o que está sentindo.", action: () => onNavigate('ai') },
            { icon: <Phone size={18} />, title: "Ligar CVV (188)", desc: "Apoio emocional profissional 24h.", action: () => window.open('tel:188') }
          ],
          color: "bg-[#4E342E]",
          textColor: "text-white"
        };
      case 2: // Mal
        return {
          title: "Respire fundo.",
          message: "É normal ter dias cinzas. Que tal uma pausa para cuidar de você agora? Pequenas ações podem mudar o seu dia.",
          recommendations: [
            { icon: <Cloud size={18} />, title: "Meditação Guiada", desc: "Silencie o barulho mental por 5 min.", action: () => onNavigate('meditate', SEARCH_DATA.find(i => i.id === 'm1')) },
            { icon: <Edit2 size={18} />, title: "Escrita Terapêutica", desc: "Escrever ajuda a organizar o caos.", action: () => onNavigate('diario') },
            { icon: <Video size={18} />, title: "Falar com Psicóloga", desc: "Agende uma conversa profissional.", action: () => onNavigate('appointments') }
          ],
          color: "bg-[#BF360C]",
          textColor: "text-white"
        };
      case 3: // Neutro
        return {
          title: "Um dia equilibrado.",
          message: "Estar neutro é um bom momento para fortalecer sua mente. Que tal algo que te traga um pouco mais de energia ou paz?",
          recommendations: [
            { icon: <ActivityIcon size={18} />, title: "Caminhada Leve", desc: "O movimento ajuda na endorfina.", action: () => onNavigate('activity') },
            { icon: <Utensils size={18} />, title: "Refeição Nutritiva", desc: "Alimente seu corpo e sua mente.", action: () => onNavigate('activity') },
            { icon: <Moon size={18} />, title: "Higiene do Sono", desc: "Prepare-se para um descanso real.", action: () => onNavigate('activity') }
          ],
          color: "bg-surface-container-highest",
          textColor: "text-on-surface"
        };
      case 4:
      case 5: // Bem/Ótimo
        return {
          title: "Que alegria ver você assim!",
          message: "Aproveite essa boa energia para celebrar suas pequenas vitórias e manter seus hábitos saudáveis.",
          recommendations: [
            { icon: <Star size={18} />, title: "Diário de Gratidão", desc: "Anote 3 coisas boas de hoje.", action: () => {} },
            { icon: <TrendingUp size={18} />, title: "Manter o Foco", desc: "Continue seu progresso na aba Foco.", action: () => onNavigate('activity') }
          ],
          color: "bg-secondary",
          textColor: "text-white"
        };
      default: return null;
    }
  };

  const feedback = getMoodFeedback();

  useEffect(() => {
    if (sosMode === 'ansiedade') {
      const interval = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 'inspire') return 'segure';
          if (prev === 'segure') return 'expire';
          return 'inspire';
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sosMode]);

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
        {/* EMERGENCY SOS BUTTONS */}
        <div className="flex gap-4 mb-10">
           <button 
             onClick={() => setSosMode('ansiedade')}
             className="flex-1 bg-white border-2 border-[#FF8A65]/30 p-6 rounded-[2.5rem] flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all"
           >
              <div className="w-12 h-12 rounded-2xl bg-[#FF8A65]/10 text-[#FF8A65] flex items-center justify-center">
                 <Zap size={24} className="animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-black text-[10px] uppercase tracking-widest text-[#FF8A65]">Crise de</p>
                <p className="font-black text-xs text-[#4E342E]">Ansiedade</p>
              </div>
           </button>
           <button 
             onClick={() => setSosMode('depressao')}
             className="flex-1 bg-white border-2 border-primary/20 p-6 rounded-[2.5rem] flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-all"
           >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                 <Heart size={24} />
              </div>
              <div className="text-center">
                <p className="font-black text-[10px] uppercase tracking-widest text-primary">Apoio na</p>
                <p className="font-black text-xs text-[#4E342E]">Depressão</p>
              </div>
           </button>
        </div>

        <section className="mb-10 text-center">
          <p className="text-[#FF8A65] font-black tracking-widest uppercase text-[10px] mb-2">Saúde Mental</p>
          <h2 className="text-3xl font-black tracking-tighter text-[#4E342E] font-display">Como você está hoje?</h2>
          <div className="h-1 w-10 bg-[#FF8A65] rounded-full mx-auto mt-2"></div>
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#F2E7E2] mb-10 transition-all duration-500">
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
             <p className="text-[10px] font-bold text-[#E65100]">Acompanhe seu progresso emocional para entender seus gatilhos.</p>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {feedback && (
            <motion.section 
              key={mood}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-10"
            >
              <div className={`${feedback.color} ${feedback.textColor} rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden mb-6`}>
                 <div className="relative z-10">
                   <h3 className="text-xl font-black mb-3">{feedback.title}</h3>
                   <p className="text-xs font-medium opacity-90 leading-relaxed mb-8">{feedback.message}</p>
                   
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-4">Sugestões para agora:</p>
                   <div className="space-y-3">
                      {feedback.recommendations.map((rec, i) => (
                        <button 
                          key={i}
                          onClick={rec.action}
                          className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 transition-all text-left group"
                        >
                           <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                              {rec.icon}
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black">{rec.title}</p>
                              <p className="text-[9px] opacity-70 font-bold">{rec.desc}</p>
                           </div>
                           <ChevronRight size={14} className="opacity-50" />
                        </button>
                      ))}
                   </div>
                 </div>
                 {/* Decorative background circle */}
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* SELF-CARE ACTIONS */}
        <section className="mb-10 space-y-4">
           <h3 className="text-sm font-black uppercase tracking-widest text-[#4E342E] px-2 flex items-center gap-2">
             <ActivityIcon size={16} className="text-[#FF8A65]" />
             Práticas de Autocuidado
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => onNavigate('meditate', SEARCH_DATA.find(i => i.id === 'm1'))}
                className="bg-white p-6 rounded-[2rem] border border-[#F2E7E2] space-y-3 active:scale-95 transition-all cursor-pointer hover:border-[#FF8A65]/30 group"
              >
                 <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Cloud size={20} /></div>
                 <p className="text-xs font-black text-[#4E342E]">Momento Zen</p>
                 <p className="text-[9px] text-on-surface-variant font-medium">Meditação relaxante.</p>
              </div>
              <div 
                onClick={() => onNavigate('diario')}
                className="bg-white p-6 rounded-[2rem] border border-[#F2E7E2] space-y-3 active:scale-95 transition-all cursor-pointer hover:border-[#FF8A65]/30 group"
              >
                 <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Edit2 size={20} /></div>
                 <p className="text-xs font-black text-[#4E342E]">Diário Livre</p>
                 <p className="text-[9px] text-on-surface-variant font-medium">Escreva seus medos.</p>
              </div>
           </div>
        </section>

        {evolutions && evolutions.length > 0 && (
          <section className="mb-10 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#4E342E] px-2 flex items-center gap-2">
              <History size={16} className="text-[#FF8A65]" />
              Evolução Clínica Atualizada
            </h3>
            <div className="space-y-4">
              {evolutions.map((ev) => (
                <div key={ev.id} className="bg-white p-6 rounded-3xl border border-[#F2E7E2] shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      ev.condition_status === 'improving' ? 'bg-green-100 text-green-600' :
                      ev.condition_status === 'stable' ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {ev.condition_status === 'improving' ? 'Em Melhora' : 
                       ev.condition_status === 'stable' ? 'Estável' : 
                       ev.condition_status === 'worsening' ? 'Piorando' : 'Crítico'}
                    </span>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-widest">
                      {new Date(ev.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#4E342E] leading-relaxed italic">
                    "{ev.notes}"
                  </p>
                  <p className="mt-4 text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Sincronizado com Sistema Hospitalar</p>
                </div>
              ))}
            </div>
          </section>
        )}

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
                <button 
                  onClick={() => onNavigate('appointments')}
                  className="bg-[#FF8A65] text-white p-3 rounded-xl shadow-lg shadow-[#FF8A65]/20 active:scale-95 transition-all"
                >
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
          <button 
            onClick={() => onNavigate('ai')}
            className="w-full bg-[#FF8A65] text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3"
          >
             <MessageSquare size={18} />
             Falar Agora com SISA AI
          </button>
        </section>
      </main>

      {/* SELF-CARE MODALS */}
      <AnimatePresence>
        {isPracticeOpen !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#4E342E]/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl"
            >
               <div className={`p-8 ${isPracticeOpen === 'zen' ? 'bg-cyan-500' : 'bg-amber-500'} text-white relative`}>
                  <button onClick={() => setIsPracticeOpen('none')} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                     {isPracticeOpen === 'zen' ? <Cloud size={32} /> : <Edit2 size={32} />}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{isPracticeOpen === 'zen' ? 'Momento Zen' : 'Diário Livre'}</h3>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">Prática de Autocuidado</p>
               </div>
               
               <div className="p-8 space-y-6">
                 {isPracticeOpen === 'zen' ? (
                   <div className="space-y-4 text-center">
                     <div className="w-24 h-24 rounded-full border-4 border-cyan-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center text-white">
                           <Play size={24} fill="currentColor" />
                        </div>
                     </div>
                     <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">"Respire fundo. Feche os olhos e deixe a música guiar sua tranquilidade."</p>
                     <p className="font-black text-cyan-600 text-[10px] uppercase tracking-widest">Sessão: Alívio de Stress (5 min)</p>
                   </div>
                 ) : (
                   <div className="space-y-4 text-left">
                     <p className="text-xs text-[#4E342E] font-bold">O que está na sua mente agora?</p>
                     <textarea 
                       placeholder="Escreva livremente sem julgamentos..."
                       className="w-full bg-surface-container rounded-2xl p-4 text-xs font-medium h-32 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all border-none resize-none"
                     />
                     <p className="text-[9px] text-on-surface-variant italic">Suas notas são privadas e criptografadas.</p>
                   </div>
                 )}
                 
                 <button 
                   onClick={() => setIsPracticeOpen('none')}
                   className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-xl transition-all active:scale-95 ${isPracticeOpen === 'zen' ? 'bg-cyan-500' : 'bg-amber-500'}`}
                 >
                   Concluir Prática
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS OVERLAY (MODAL) */}
      <AnimatePresence>
        {sosMode !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 50 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 50 }}
               className="bg-white w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center gap-8 relative"
             >
                <div className="absolute top-8 right-24 flex items-center gap-2">
                   <button 
                     onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                     className={`p-2 rounded-xl transition-all ${isAudioEnabled ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'}`}
                   >
                     {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                   </button>
                </div>
                <button 
                  onClick={() => setSosMode('none')}
                  className="absolute top-8 right-8 p-2 text-outline-variant hover:text-error transition-colors"
                >
                  <X size={24} />
                </button>

                {sosMode === 'ansiedade' && (
                   <>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-[#4E342E]">Respire Comigo</h2>
                        <p className="text-xs text-on-surface-variant font-medium">Siga o ritmo do círculo para se acalmar.</p>
                      </div>

                      <div className="relative w-48 h-48 flex items-center justify-center">
                         <motion.div 
                           animate={{ 
                             scale: breathPhase === 'inspire' ? 1.5 : breathPhase === 'segure' ? 1.5 : 1,
                             backgroundColor: breathPhase === 'inspire' ? '#FF8A65' : breathPhase === 'segure' ? '#FFCCBC' : '#FDF8F5'
                           }}
                           transition={{ duration: 4, ease: "easeInOut" }}
                           className="w-32 h-32 rounded-full shadow-2xl border-4 border-[#FF8A65]/10"
                         />
                         <span className="absolute font-black text-sm text-[#4E342E] uppercase tracking-[0.2em]">
                           {breathPhase === 'inspire' ? 'Inspire' : breathPhase === 'segure' ? 'Segure' : 'Expire'}
                         </span>
                      </div>

                      <div className="space-y-4 w-full">
                         <div className="p-4 bg-[#F2E7E2]/30 rounded-2xl flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#4E342E] text-white flex items-center justify-center font-bold text-xs">1</div>
                            <p className="text-[10px] font-bold text-[#4E342E]">Tente sentir seus pés no chão.</p>
                         </div>
                         <div className="p-4 bg-[#F2E7E2]/30 rounded-2xl flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#4E342E] text-white flex items-center justify-center font-bold text-xs">2</div>
                            <p className="text-[10px] font-bold text-[#4E342E]">Identifique 3 sons ao seu redor.</p>
                         </div>
                      </div>
                   </>
                )}

                {sosMode === 'depressao' && (
                   <>
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-[#4E342E]">Você não está só</h2>
                        <p className="text-xs text-on-surface-variant font-medium">Estamos aqui para te segurar até a tempestade passar.</p>
                      </div>

                      <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                         <HeartPulse size={64} className="animate-pulse" />
                      </div>

                      <div className="space-y-3 w-full">
                         <button className="w-full bg-[#4E342E] text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3">
                            <Phone size={16} />
                            Ligar CVV (188)
                         </button>
                         <button 
                           onClick={() => {
                             setSosMode('none');
                             onNavigate('ai');
                           }}
                           className="w-full bg-white border-2 border-primary/20 text-primary py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3"
                         >
                            <MessageSquare size={16} />
                            Desabafar com SISA AI
                         </button>
                      </div>

                      <p className="text-[10px] text-on-surface-variant font-bold text-center px-4 italic leading-relaxed">
                        "Lembre-se: seus sentimentos são reais, mas eles não são o seu destino final. Respire um segundo de cada vez."
                      </p>
                   </>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DiarioScreen({ onNavigate }: ScreenProps) {
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<{id: string, text: string, date: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sisa_diario_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading diary", e);
      }
    }
  }, []);

  const handleSave = () => {
    if (!note.trim()) return;
    setIsSaving(true);
    
    const newEntry = {
      id: Date.now().toString(),
      text: note.trim(),
      date: new Date().toLocaleString('pt-BR')
    };
    
    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('sisa_diario_history', JSON.stringify(newHistory));
    setNote('');
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1200);
  };

  const deleteNote = (id: string) => {
    const newHistory = history.filter(n => n.id !== id);
    setHistory(newHistory);
    localStorage.setItem('sisa_diario_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] pb-40">
      <header className="sticky top-0 z-50 bg-[#FFFDFB]/80 backdrop-blur-md px-6 py-6 flex items-center justify-between border-b border-amber-100/50">
        <button onClick={() => onNavigate('mental_health')} className="p-2 -ml-2 text-amber-800/50 hover:text-amber-800 transition-colors">
          <ChevronLeft size={28} />
        </button>
        <div className="text-center">
            <h1 className="text-lg font-black text-amber-900 tracking-tight flex items-center gap-2 justify-center">
              <Sparkles size={18} className="text-amber-500" />
              Diário SISA
            </h1>
            <p className="text-[9px] font-black text-amber-800/40 uppercase tracking-[0.2em]">Seu espaço seguro</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
          <BookOpen size={20} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-12">
        <section className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-4 w-32 h-32 bg-amber-200/20 blur-3xl rounded-full" />
          <div className="absolute -bottom-10 -left-4 w-32 h-32 bg-orange-200/20 blur-3xl rounded-full" />

          <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-amber-900/5 space-y-8 border border-amber-50 relative overflow-hidden">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-amber-900 tracking-tight leading-tight">Como você se sente?</h2>
              <p className="text-sm text-amber-800/60 font-medium leading-relaxed">Não guarde para si. Escrever transforma emoções em caminhos. Deixe as palavras fluírem aqui.</p>
            </div>
            
            <div className="relative group">
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Querido diário, hoje eu..."
                  className="w-full h-64 bg-amber-50/20 rounded-[2rem] p-8 text-base font-medium text-amber-950 placeholder:text-amber-200 outline-none focus:ring-2 focus:ring-amber-200 transition-all border border-amber-100/50 resize-none shadow-inner"
                />
                <div className="absolute bottom-6 right-6 flex items-center gap-2 text-amber-200/50">
                    <Edit3 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{note.length} caracteres</span>
                </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={!note.trim() || isSaving}
              className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black text-lg shadow-2xl shadow-amber-700/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale hover:bg-amber-800"
            >
              {isSaving ? (
                <div className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Guardando segredo...</span>
                </div>
              ) : (
                <>
                  <Heart size={20} fill="currentColor" />
                  Eternizar Momento
                </>
              )}
            </button>
          </div>
        </section>

        {history.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
                  <Library size={16} />
                  Sua Jornada
                </h3>
                <span className="text-[10px] font-black text-amber-800/40 uppercase">{history.length} reflexões</span>
            </div>
            
            <div className="grid gap-6">
              {history.map((entry) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={entry.id} 
                  className="bg-white p-8 rounded-[2.5rem] border border-amber-100/60 shadow-xl shadow-amber-900/5 space-y-6 relative group hover:border-amber-200 transition-colors"
                >
                  <button 
                    onClick={() => deleteNote(entry.id)}
                    className="absolute top-6 right-6 p-2 text-amber-100 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                        <Calendar size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-amber-900/40 uppercase tracking-widest">{entry.date.split(',')[0]}</span>
                        <span className="text-[8px] font-bold text-amber-800/30 uppercase tracking-widest">{entry.date.split(',')[1]}</span>
                    </div>
                  </div>

                  <p className="text-sm text-amber-950 font-medium leading-relaxed whitespace-pre-wrap italic">"{entry.text}"</p>
                  
                  <div className="pt-4 border-t border-amber-50 flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-200">
                          <Smile size={14} />
                      </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {history.length === 0 && (
          <div className="py-24 text-center space-y-6 opacity-30">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-400 border-2 border-dashed border-amber-100">
               <PenTool size={40} />
            </div>
            <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-amber-900">Sua primeira página em branco</p>
                <p className="text-[10px] font-medium text-amber-800/60">Comece a escrever sua história hoje.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
