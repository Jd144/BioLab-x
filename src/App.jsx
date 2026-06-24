import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Beaker,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Dna,
  Eye,
  FlaskConical,
  GraduationCap,
  Handshake,
  Home,
  Landmark,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Microscope,
  PlayCircle,
  Search,
  Sparkles,
  Timer,
  TestTube2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';

const pages = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'experiments', label: 'Experiments', icon: FlaskConical, path: '/experiments' },
  { id: 'gel', label: 'Gel Simulator', icon: Activity, path: '/gel-electrophoresis' },
];

const dashboardRoles = ['student', 'teacher', 'lab_assistant', 'phd', 'institute', 'admin'];

const routePaths = {
  home: '/',
  student: '/student',
  experiments: '/experiments',
  gel: '/gel-electrophoresis',
  teacher: '/teacher',
  lab_assistant: '/lab-assistant',
  phd: '/phd',
  institute: '/institute',
  admin: '/admin',
  login: '/login',
  signup: '/signup',
  forgot: '/forgot-password',
};

const routeLabels = {
  home: 'Home',
  student: 'Student Dashboard',
  experiments: 'Experiments',
  gel: 'Gel Simulator',
  teacher: 'Teacher Dashboard',
  lab_assistant: 'Lab Assistant Dashboard',
  phd: 'PhD Dashboard',
  institute: 'Institute Dashboard',
  admin: 'Admin Dashboard',
  login: 'Login',
  signup: 'Sign Up',
  forgot: 'Forgot Password',
};

const roleOptions = ['student', 'teacher', 'lab_assistant', 'phd', 'institute', 'admin'];

const roleDashboardConfig = {
  student: {
    title: 'Student Dashboard',
    subtitle: 'Your BioLabX learning workspace.',
    icon: GraduationCap,
    cards: [
      { label: 'Practice modules', value: '6', detail: 'Start with public experiments and guided simulations.' },
      { label: 'Learning role', value: 'Student', detail: 'Access is limited to student learning tools.' },
      { label: 'Next action', value: 'Gel practice', detail: 'Try the public gel simulator before saving progress later.' },
    ],
  },
  teacher: {
    title: 'Teacher Dashboard',
    subtitle: 'A focused teaching workspace for future class oversight.',
    icon: ClipboardList,
    cards: [
      { label: 'Role access', value: 'Teacher', detail: 'Students cannot view this dashboard.' },
      { label: 'Planned tools', value: 'Class setup', detail: 'Classroom and attendance features are intentionally not built yet.' },
      { label: 'Preparation', value: 'Experiments', detail: 'Use the public library to plan pre-lab practice.' },
    ],
  },
  lab_assistant: {
    title: 'Lab Assistant Dashboard',
    subtitle: 'Operational readiness view for laboratory support roles.',
    icon: Boxes,
    cards: [
      { label: 'Role access', value: 'Assistant', detail: 'Designed for lab preparation and support workflows.' },
      { label: 'Next phase', value: 'Equipment', detail: 'Advanced inventory and maintenance are deferred for later.' },
      { label: 'Focus', value: 'Safety', detail: 'Use simulations to rehearse routine lab processes.' },
    ],
  },
  phd: {
    title: 'PhD Dashboard',
    subtitle: 'Research training foundation for advanced learners.',
    icon: Microscope,
    cards: [
      { label: 'Role access', value: 'PhD', detail: 'Advanced research workflows can be added later.' },
      { label: 'Practice area', value: 'Methods', detail: 'Review experiment logic before wet-lab execution.' },
      { label: 'Current scope', value: 'MVP', detail: 'No research notebook or video tools yet.' },
    ],
  },
  institute: {
    title: 'Institute Dashboard',
    subtitle: 'Institution-level foundation for future program management.',
    icon: Landmark,
    cards: [
      { label: 'Role access', value: 'Institute', detail: 'Built for future institutional oversight.' },
      { label: 'Planned tools', value: 'Programs', detail: 'No classroom or attendance modules in this first build.' },
      { label: 'Readiness', value: 'Pre-lab', detail: 'Use BioLabX to prepare learners before practical sessions.' },
    ],
  },
  admin: {
    title: 'Admin Dashboard',
    subtitle: 'Platform administration foundation.',
    icon: ShieldIcon,
    cards: [
      { label: 'Role access', value: 'Admin', detail: 'Reserved for future platform management.' },
      { label: 'Users', value: 'Profiles', detail: 'Profiles are stored in Supabase for real user roles.' },
      { label: 'Current scope', value: 'Access', detail: 'Only role routing and dashboard foundations are enabled now.' },
    ],
  },
};

const experiments = [
  {
    title: 'PCR Amplification',
    category: 'Molecular Biology',
    duration: '45 min',
    difficulty: 'Intermediate',
    status: 'Ready',
    objective: 'Amplify target DNA sequences and review primer design accuracy.',
  },
  {
    title: 'CRISPR Guide Design',
    category: 'Genetic Engineering',
    duration: '55 min',
    difficulty: 'Advanced',
    status: 'AI Assisted',
    objective: 'Compare candidate guide RNAs using specificity and efficiency scores.',
  },
  {
    title: 'Bacterial Transformation',
    category: 'Microbiology',
    duration: '40 min',
    difficulty: 'Beginner',
    status: 'Ready',
    objective: 'Introduce plasmid DNA into competent cells and analyze colony growth.',
  },
  {
    title: 'Protein Assay',
    category: 'Biochemistry',
    duration: '35 min',
    difficulty: 'Beginner',
    status: 'Ready',
    objective: 'Estimate sample protein concentration from a simulated standard curve.',
  },
];

const studentModules = [
  { name: 'DNA Extraction', progress: 92, score: 'A', next: 'Submit reflection' },
  { name: 'PCR Workflow', progress: 76, score: 'B+', next: 'Run primer check' },
  { name: 'Gel Analysis', progress: 64, score: 'B', next: 'Label fragment sizes' },
];

const teacherClasses = [
  { className: 'BIOT 201', students: 42, completion: 84, risk: 'Low' },
  { className: 'GENE 315', students: 28, completion: 71, risk: 'Moderate' },
  { className: 'MICR 110', students: 36, completion: 89, risk: 'Low' },
];

const inventory = [
  { item: 'Agarose Powder', type: 'Consumable', stock: 68, unit: 'g', status: 'In stock' },
  { item: 'Micropipette P20', type: 'Equipment', stock: 12, unit: 'units', status: 'Calibrated' },
  { item: 'Taq Polymerase', type: 'Reagent', stock: 9, unit: 'vials', status: 'Low stock' },
  { item: 'Nitrile Gloves', type: 'Safety', stock: 420, unit: 'pairs', status: 'In stock' },
  { item: 'DNA Ladder 100 bp', type: 'Reagent', stock: 18, unit: 'loads', status: 'In stock' },
];

const aiInsights = [
  'Recommends reviewing pipetting accuracy before the next wet-lab assessment.',
  'Detected strong student performance in DNA extraction and sample preparation.',
  'Suggests adding one guided checkpoint to the CRISPR module for novice learners.',
];

const problemCards = [
  { title: 'Lack of hands-on lab experience', icon: Handshake },
  { title: 'Fear of making mistakes in real labs', icon: AlertTriangle },
  { title: 'Limited access to expensive instruments', icon: Building2 },
  { title: 'Difficulty understanding experimental workflows', icon: Lightbulb },
];

const audienceCards = [
  {
    title: 'Students',
    text: 'Practice biotechnology procedures with guided steps before physical lab sessions.',
    icon: GraduationCap,
  },
  {
    title: 'Teachers',
    text: 'Use virtual experiments to prepare classes, evaluate progress, and improve readiness.',
    icon: BookOpenCheck,
  },
  {
    title: 'Researchers',
    text: 'Review standard techniques and experimental logic before protocol execution.',
    icon: Microscope,
  },
  {
    title: 'Lab Assistants',
    text: 'Build confidence with instruments, safety steps, and routine lab workflows.',
    icon: ClipboardList,
  },
];

const featuredExperiments = [
  {
    title: 'Gel Electrophoresis',
    difficulty: 'Beginner',
    time: '35 min',
    skills: 'DNA loading, band reading, fragment sizing',
    icon: Activity,
  },
  {
    title: 'PCR',
    difficulty: 'Intermediate',
    time: '45 min',
    skills: 'Primer logic, amplification cycles, result analysis',
    icon: Dna,
  },
  {
    title: 'Microscopy',
    difficulty: 'Beginner',
    time: '30 min',
    skills: 'Focusing, staining observation, slide interpretation',
    icon: Eye,
  },
  {
    title: 'Centrifugation',
    difficulty: 'Beginner',
    time: '25 min',
    skills: 'Sample balancing, RPM selection, pellet handling',
    icon: GaugeIcon,
  },
  {
    title: 'Cell Culture',
    difficulty: 'Advanced',
    time: '60 min',
    skills: 'Aseptic technique, media handling, contamination checks',
    icon: TestTube2,
  },
  {
    title: 'ELISA',
    difficulty: 'Intermediate',
    time: '50 min',
    skills: 'Plate workflow, controls, absorbance interpretation',
    icon: Beaker,
  },
];

const benefitGroups = [
  {
    title: 'Students',
    icon: GraduationCap,
    points: ['Build lab confidence', 'Understand workflows visually', 'Practice before assessment'],
  },
  {
    title: 'Teachers',
    icon: Users,
    points: ['Improve pre-lab preparation', 'Assign guided simulations', 'Identify conceptual gaps'],
  },
  {
    title: 'Institutions',
    icon: Landmark,
    points: ['Reduce training pressure', 'Support scalable lab readiness', 'Extend access to advanced equipment'],
  },
];

function GaugeIcon(props) {
  return <Timer {...props} />;
}

function ShieldIcon(props) {
  return <LockKeyhole {...props} />;
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(routePaths.student);
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = getRouteIdFromPath(location.pathname);
  const ActiveIcon = pages.find((page) => page.id === activePage)?.icon
    ?? roleDashboardConfig[activePage]?.icon
    ?? Home;

  const pageTitle = useMemo(
    () => routeLabels[activePage] ?? 'Home',
    [activePage],
  );
  const user = session?.user ?? null;

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadProfile = async (currentUser) => {
      if (!currentUser) {
        if (isMounted) {
          setProfile(null);
        }
        return null;
      }

      const fallbackProfile = buildProfileFromUser(currentUser);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, institution, department')
        .eq('id', currentUser.id)
        .single();

      const nextProfile = error ? fallbackProfile : { ...fallbackProfile, ...data };

      if (isMounted) {
        setProfile(nextProfile);
      }

      return nextProfile;
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (isMounted) {
        setSession(data.session);
        await loadProfile(data.session?.user);
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadProfile(nextSession?.user);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const goToPage = (pageId) => {
    const nextPath = routePaths[pageId] ?? '/';

    if (dashboardRoles.includes(pageId) && !user) {
      setRedirectAfterAuth(nextPath);
      navigate(routePaths.login, { state: { from: nextPath } });
      setIsMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate(nextPath);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (nextSession, explicitRole) => {
    if (nextSession) {
      setSession(nextSession);
    }

    const metadataRole = nextSession?.user?.user_metadata?.role;
    const nextRole = normalizeRole(explicitRole ?? profile?.role ?? metadataRole);
    const targetPath = location.state?.from ?? getDashboardPathForRole(nextRole) ?? redirectAfterAuth;

    navigate(targetPath);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setSession(null);
    setProfile(null);
    navigate(routePaths.home);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <Navbar
        activePage={activePage}
        isMenuOpen={isMenuOpen}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onNavigate={goToPage}
      />
      <main>
        {activePage !== 'home' && (
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 pt-6 sm:px-6 lg:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-lab-100 bg-white text-lab-700 shadow-sm">
              <ActiveIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lab-700">
                BioLabX workspace
              </p>
              <h1 className="text-xl font-semibold text-ink sm:text-2xl">{pageTitle}</h1>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<HomePage onNavigate={goToPage} />} />
          <Route
            path="/login"
            element={<LoginPage onNavigate={goToPage} onAuthSuccess={handleAuthSuccess} />}
          />
          <Route
            path="/signup"
            element={<SignupPage onNavigate={goToPage} onAuthSuccess={handleAuthSuccess} />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage onNavigate={goToPage} />} />
          <Route path="/experiments" element={<ExperimentsPage />} />
          <Route path="/gel-electrophoresis" element={<GelSimulator />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="student">
                <RoleDashboard role="student" profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="teacher">
                <RoleDashboard role="teacher" profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-assistant"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="lab_assistant">
                <RoleDashboard role="lab_assistant" profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phd"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="phd">
                <RoleDashboard role="phd" profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institute"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="institute">
                <RoleDashboard role="institute" profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="admin">
                <RoleDashboard role="admin" profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route path="/student-dashboard" element={<Navigate to="/student" replace />} />
          <Route path="/teacher-dashboard" element={<Navigate to="/teacher" replace />} />
          <Route path="/inventory" element={<Navigate to="/lab-assistant" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function getRouteIdFromPath(pathname) {
  const route = Object.entries(routePaths).find(([, path]) => path === pathname);
  return route?.[0] ?? 'home';
}

function getDashboardPathForRole(role) {
  const normalizedRole = normalizeRole(role);
  return routePaths[normalizedRole] ?? routePaths.student;
}

function normalizeRole(role) {
  return roleOptions.includes(role) ? role : 'student';
}

function buildProfileFromUser(user) {
  return {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'BioLabX User',
    role: normalizeRole(user.user_metadata?.role),
    institution: user.user_metadata?.institution ?? '',
    department: user.user_metadata?.department ?? '',
  };
}

function Navbar({ activePage, isMenuOpen, user, profile, onSignOut, onMenuToggle, onNavigate }) {
  const dashboardRole = normalizeRole(profile?.role ?? user?.user_metadata?.role);
  const dashboardLabel = roleDashboardConfig[dashboardRole]?.title ?? 'My Dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => onNavigate('home')}
          aria-label="Go to BioLabX home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lab-700 text-white shadow-sm">
            <Microscope size={23} />
          </span>
          <span>
            <span className="block text-lg font-bold leading-5 text-ink">BioLabX</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">
              Virtual biotech lab
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                activePage === page.id
                  ? 'bg-lab-50 text-lab-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
              }`}
            >
              {page.label}
            </button>
          ))}
          {user && (
            <button
              onClick={() => onNavigate(dashboardRole)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                activePage === dashboardRole
                  ? 'bg-lab-50 text-lab-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
              }`}
            >
              My Dashboard
            </button>
          )}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <LogOut size={17} />
              Sign out
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-bold transition ${
                  activePage === 'login'
                    ? 'border-lab-100 bg-lab-50 text-lab-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LockKeyhole size={17} />
                Login
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition ${
                  activePage === 'signup'
                    ? 'bg-lab-50 text-lab-700'
                    : 'bg-ink text-white hover:bg-slate-700'
                }`}
              >
                <UserPlus size={17} />
                Sign Up
              </button>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 sm:text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-bold transition sm:text-sm ${
                  activePage === 'login'
                    ? 'border-lab-100 bg-lab-50 text-lab-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LockKeyhole size={15} />
                Login
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition sm:text-sm ${
                  activePage === 'signup'
                    ? 'bg-lab-50 text-lab-700'
                    : 'bg-ink text-white hover:bg-slate-700'
                }`}
              >
                <UserPlus size={15} />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-ink lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => onNavigate(page.id)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold ${
                    activePage === page.id
                      ? 'bg-lab-50 text-lab-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  {page.label}
                </button>
              );
            })}
            {user ? (
              <>
                <button
                  onClick={() => onNavigate(dashboardRole)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold ${
                    activePage === dashboardRole
                      ? 'bg-lab-50 text-lab-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap size={18} />
                  {dashboardLabel}
                </button>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  <LogOut size={18} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold ${
                    activePage === 'login'
                      ? 'bg-lab-50 text-lab-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LockKeyhole size={18} />
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-semibold ${
                    activePage === 'signup'
                      ? 'bg-lab-50 text-lab-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserPlus size={18} />
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function ProtectedRoute({ isLoading, user, profile, allowedRole, children }) {
  const location = useLocation();
  const userRole = normalizeRole(profile?.role ?? user?.user_metadata?.role);

  if (isLoading) {
    return (
      <PageShell>
        <Panel title="Checking access" subtitle="Verifying your session with Supabase.">
          <p className="text-sm font-medium text-slate-600">Please wait...</p>
        </Panel>
      </PageShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={getDashboardPathForRole(userRole)} replace />;
  }

  return children;
}

function LoginPage({ onNavigate, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: 'idle', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: 'error',
        text: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', text: '' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (error) {
      setStatus({ type: 'error', text: error.message });
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.session.user.id)
      .single();

    setStatus({ type: 'success', text: 'Login successful. Redirecting...' });
    onAuthSuccess(data.session, profileData?.role);
  };

  return (
    <AuthPageShell
      title="Login to BioLabX"
      subtitle="Access protected dashboards and production-ready lab workflows."
      icon={LockKeyhole}
    >
      <AuthSetupNotice />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="student@university.edu"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
        />
        <AuthStatus status={status} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-lab-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LockKeyhole size={17} />
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <AuthLinkRow
        primaryText="Don't have an account?"
        primaryAction="Sign up"
        onPrimary={() => onNavigate('signup')}
        secondaryAction="Forgot password?"
        onSecondary={() => onNavigate('forgot')}
      />
    </AuthPageShell>
  );
}

function SignupPage({ onNavigate, onAuthSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [status, setStatus] = useState({ type: 'idle', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: 'error',
        text: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', text: '' });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      setStatus({ type: 'error', text: error.message });
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role,
      });
    }

    setIsSubmitting(false);

    if (data.session) {
      setStatus({ type: 'success', text: 'Account created. Redirecting...' });
      onAuthSuccess(data.session, role);
      return;
    }

    setStatus({
      type: 'success',
      text: 'Account created. Check your email to confirm your BioLabX account.',
    });
  };

  return (
    <AuthPageShell
      title="Create your BioLabX account"
      subtitle="Set up a role-ready profile for future student, teacher, lab assistant, and admin workflows."
      icon={UserPlus}
    >
      <AuthSetupNotice />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Full name"
          value={fullName}
          onChange={setFullName}
          placeholder="Your name"
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@institution.edu"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a secure password"
          required
          minLength={6}
        />
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Role</span>
          <select
            className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink outline-none transition focus:border-lab-500 focus:ring-4 focus:ring-lab-100"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {formatRole(option)}
              </option>
            ))}
          </select>
        </label>
        <AuthStatus status={status} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-lab-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus size={17} />
          {isSubmitting ? 'Creating account...' : 'Signup'}
        </button>
      </form>
      <AuthLinkRow
        primaryText="Already have an account?"
        primaryAction="Login"
        onPrimary={() => onNavigate('login')}
      />
    </AuthPageShell>
  );
}

function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setStatus({
        type: 'error',
        text: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', text: '' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({ type: 'error', text: error.message });
      return;
    }

    setStatus({ type: 'success', text: 'Password reset email sent.' });
  };

  return (
    <AuthPageShell
      title="Reset your password"
      subtitle="Send a secure reset link using Supabase authentication."
      icon={Mail}
    >
      <AuthSetupNotice />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@institution.edu"
          required
        />
        <AuthStatus status={status} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-lab-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail size={17} />
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <AuthLinkRow
        primaryText="Remembered your password?"
        primaryAction="Back to Login"
        onPrimary={() => onNavigate('login')}
      />
    </AuthPageShell>
  );
}

function AuthPageShell({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
          <Icon size={24} />
        </div>
        <h2 className="mt-5 text-3xl font-bold leading-tight text-ink">{title}</h2>
        <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
        <div className="mt-6 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          BioLabX now uses a real Supabase-ready authentication foundation. Protected pages stay
          locked until a user signs in.
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">{children}</div>
    </section>
  );
}

function AuthSetupNotice() {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-800">
      Supabase environment variables are not set yet. Copy .env.example to .env.local and add your
      project URL and anon key.
    </div>
  );
}

function TextField({ label, value, onChange, ...inputProps }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-lab-500 focus:ring-4 focus:ring-lab-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  );
}

function AuthStatus({ status }) {
  if (!status.text) {
    return null;
  }

  return (
    <p
      className={`rounded-md p-3 text-sm font-semibold ${
        status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {status.text}
    </p>
  );
}

function AuthLinkRow({ primaryText, primaryAction, onPrimary, secondaryAction, onSecondary }) {
  return (
    <div className="mt-5 flex flex-col gap-3 text-sm font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        {primaryText}{' '}
        <button className="text-lab-700 hover:text-lab-600" onClick={onPrimary} type="button">
          {primaryAction}
        </button>
      </span>
      {secondaryAction && (
        <button className="text-left text-lab-700 hover:text-lab-600" onClick={onSecondary} type="button">
          {secondaryAction}
        </button>
      )}
    </div>
  );
}

function formatRole(role) {
  return normalizeRole(role)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function HomePage({ onNavigate }) {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lab-100 bg-lab-50 px-3 py-1 text-sm font-bold text-lab-700">
              <Sparkles size={16} />
              AI-powered virtual biotechnology lab
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              Practice Biotechnology Experiments Before Entering the Real Lab
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              AI-powered virtual lab training platform for B.Sc, M.Sc, B.Tech, PhD students,
              teachers, and lab assistants.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onNavigate('student')}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-lab-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-lab-600"
              >
                Start Learning
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => onNavigate('experiments')}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-lab-200 hover:bg-lab-50"
              >
                Explore Experiments
                <BookOpenCheck size={18} />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Already using BioLabX or creating a new account?
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <LockKeyhole size={16} />
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  <UserPlus size={16} />
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-soft">
            <div className="rounded-md border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-lab-700">
                    Virtual pre-lab module
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-ink">Gel Electrophoresis Training</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Ready
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric label="Difficulty" value="Beginner" />
                <Metric label="Time" value="35 min" />
                <Metric label="Mode" value="Guided" />
              </div>
              <div className="mt-5 space-y-3">
                {['Understand sample loading', 'Interpret DNA bands', 'Avoid common lab errors'].map(
                  (step) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-700"
                    >
                      <CheckCircle2 size={18} className="text-lab-600" />
                      {step}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeSection
        eyebrow="Problems We Solve"
        title="Prepare learners for real laboratory confidence"
        description="BioLabX focuses on the practical gaps students face before they touch real samples, instruments, and protocols."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problemCards.map((card) => (
            <IconCard key={card.title} icon={card.icon} title={card.title} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Who Is It For"
        title="Built for academic biotechnology training"
        description="The platform supports learners and instructors across university labs, research preparation, and laboratory support roles."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {audienceCards.map((card) => (
            <IconCard key={card.title} icon={card.icon} title={card.title} text={card.text} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Featured Experiments"
        title="Core laboratory workflows in one virtual platform"
        description="Each module uses dummy data and guided prompts to help users understand experimental flow before practical sessions."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredExperiments.map((experiment) => (
            <ExperimentPreview key={experiment.title} experiment={experiment} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Benefits"
        title="A stronger bridge between theory and real lab practice"
        description="BioLabX helps different academic groups reduce uncertainty, improve preparation, and use lab time more effectively."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {benefitGroups.map((group) => (
            <BenefitCard key={group.title} group={group} />
          ))}
        </div>
      </HomeSection>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-lg border border-lab-100 bg-lab-50 p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-lab-700 shadow-sm">
            <Microscope size={25} />
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Start Practicing Before Entering a Real Laboratory
          </h2>
          <button
            onClick={() => onNavigate('student')}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700"
          >
            Launch BioLabX
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}

function HomeSection({ eyebrow, title, description, children }) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lab-700">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-ink sm:text-3xl">{title}</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function IconCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{title}</h3>
      {text && <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>}
    </article>
  );
}

function ExperimentPreview({ experiment }) {
  const Icon = experiment.icon;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
            <Icon size={23} />
          </div>
          <h3 className="text-lg font-bold text-ink">{experiment.title}</h3>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <ExperimentFact label="Difficulty" value={experiment.difficulty} />
        <ExperimentFact label="Estimated time" value={experiment.time} />
        <ExperimentFact label="Skills learned" value={experiment.skills} />
      </dl>
    </article>
  );
}

function ExperimentFact({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold leading-6 text-slate-700">{value}</dd>
    </div>
  );
}

function BenefitCard({ group }) {
  const Icon = group.icon;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-lab-700 text-white">
          <Icon size={22} />
        </div>
        <h3 className="text-xl font-bold text-ink">{group.title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {group.points.map((point) => (
          <li key={point} className="flex gap-3 text-sm font-medium leading-6 text-slate-600">
            <CheckCircle2 className="mt-0.5 shrink-0 text-lab-600" size={17} />
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}

function RoleDashboard({ role, profile }) {
  const config = roleDashboardConfig[role] ?? roleDashboardConfig.student;
  const Icon = config.icon;

  return (
    <PageShell>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lab-700">
                Role-based access
              </p>
              <h2 className="mt-2 text-2xl font-bold text-ink">{config.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{config.subtitle}</p>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-bold text-ink">{profile?.full_name ?? 'BioLabX User'}</p>
            <p className="mt-1 font-semibold text-slate-500">{formatRole(profile?.role ?? role)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {config.cards.map((card) => (
          <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-ink">{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.detail}</p>
          </article>
        ))}
      </div>

      <Panel title="Profile Data" subtitle="Live role data loaded from Supabase profiles when configured.">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <ProfileFact label="Full name" value={profile?.full_name ?? 'Not set'} />
          <ProfileFact label="Role" value={formatRole(profile?.role ?? role)} />
          <ProfileFact label="Institution" value={profile?.institution || 'Not set'} />
          <ProfileFact label="Department" value={profile?.department || 'Not set'} />
        </div>
      </Panel>
    </PageShell>
  );
}

function ProfileFact({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-ink">{value}</p>
    </div>
  );
}

function StudentDashboard() {
  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
        <Panel title="Learning Progress" subtitle="Current biotechnology modules">
          <div className="space-y-4">
            {studentModules.map((module) => (
              <div key={module.name} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">{module.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Next action: {module.next}</p>
                  </div>
                  <span className="rounded-full bg-lab-50 px-3 py-1 text-sm font-bold text-lab-700">
                    {module.score}
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-lab-600"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <p className="mt-2 text-right text-xs font-semibold text-slate-500">
                  {module.progress}% complete
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="AI Study Coach" subtitle="Personalized dummy recommendations">
          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight} className="rounded-md bg-lab-50 p-4 text-sm leading-6 text-slate-700">
                {insight}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={CalendarDays} label="Upcoming labs" value="4" />
        <MetricCard icon={FlaskConical} label="Completed sims" value="18" />
        <MetricCard icon={BarChart3} label="Average score" value="87%" />
        <MetricCard icon={BrainCircuit} label="AI hints used" value="23" />
      </div>
    </PageShell>
  );
}

function ExperimentsPage() {
  return (
    <PageShell>
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold">Experiment Library</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dummy modules for guided biotechnology simulation.
          </p>
        </div>
        <div className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-500 md:w-80">
          <Search size={18} />
          <span className="text-sm">Search experiments</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {experiments.map((experiment) => (
          <article
            key={experiment.title}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-lab-200 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
                  <Beaker size={23} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{experiment.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{experiment.category}</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {experiment.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{experiment.objective}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Tag>{experiment.duration}</Tag>
              <Tag>{experiment.difficulty}</Tag>
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700">
              <PlayCircle size={17} />
              Start simulation
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function GelSimulator() {
  const lanes = [
    [18, 34, 62],
    [24, 45, 78],
    [16, 52, 88],
    [31, 66],
    [20, 39, 70, 91],
  ];

  return (
    <PageShell>
      <div className="rounded-lg border border-lab-100 bg-lab-50 p-4 text-sm font-semibold leading-6 text-lab-700">
        Gel Electrophoresis remains public for open practice. The Supabase foundation is ready to
        save progress to student_progress after login in a future iteration.
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.35fr]">
        <Panel title="Simulation Setup" subtitle="Configure a dummy gel electrophoresis run">
          <div className="grid gap-4">
            <Control label="Gel concentration" value="1.2% agarose" />
            <Control label="Voltage" value="110 V" />
            <Control label="Run time" value="38 min" />
            <Control label="DNA ladder" value="100 bp marker" />
          </div>
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white hover:bg-lab-600">
            <PlayCircle size={18} />
            Run virtual gel
          </button>
        </Panel>

        <Panel title="Gel Electrophoresis Viewer" subtitle="Visual dummy output">
          <div className="rounded-lg border border-slate-200 bg-slate-900 p-5">
            <div className="grid h-80 grid-cols-5 gap-4 rounded-md bg-gradient-to-b from-slate-800 to-slate-950 p-4">
              {lanes.map((lane, laneIndex) => (
                <div key={laneIndex} className="relative rounded-sm border-x border-blue-200/20">
                  <div className="absolute left-1/2 top-2 h-3 w-10 -translate-x-1/2 rounded-sm bg-blue-100/70" />
                  {lane.map((band) => (
                    <div
                      key={band}
                      className="absolute left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(165,243,252,0.85)]"
                      style={{ top: `${band}%` }}
                    />
                  ))}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-cyan-100">
                    L{laneIndex + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="AI Interpretation" subtitle="Dummy result summary">
        <div className="grid gap-4 md:grid-cols-3">
          <Interpretation label="Lane 1" result="Clean amplified target near 500 bp." />
          <Interpretation label="Lane 3" result="Possible non-specific banding detected." />
          <Interpretation label="Lane 5" result="Strong ladder alignment for fragment sizing." />
        </div>
      </Panel>
    </PageShell>
  );
}

function TeacherDashboard() {
  return (
    <PageShell>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Users} label="Active students" value="106" />
        <MetricCard icon={Activity} label="Simulations run" value="342" />
        <MetricCard icon={CheckCircle2} label="Avg completion" value="81%" />
        <MetricCard icon={BrainCircuit} label="AI alerts" value="7" />
      </div>

      <Panel title="Class Performance" subtitle="Dummy overview for instructors">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="py-3 pr-4 font-bold">Class</th>
                <th className="py-3 pr-4 font-bold">Students</th>
                <th className="py-3 pr-4 font-bold">Completion</th>
                <th className="py-3 pr-4 font-bold">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {teacherClasses.map((row) => (
                <tr key={row.className} className="border-b border-slate-100 text-sm">
                  <td className="py-4 pr-4 font-bold">{row.className}</td>
                  <td className="py-4 pr-4 text-slate-600">{row.students}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-signal"
                          style={{ width: `${row.completion}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-600">{row.completion}%</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        row.risk === 'Low'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {row.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
}

function InventoryPage() {
  return (
    <PageShell>
      <Panel title="Virtual Lab Inventory" subtitle="Dummy stock data for teaching labs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="py-3 pr-4 font-bold">Item</th>
                <th className="py-3 pr-4 font-bold">Type</th>
                <th className="py-3 pr-4 font-bold">Stock</th>
                <th className="py-3 pr-4 font-bold">Unit</th>
                <th className="py-3 pr-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.item} className="border-b border-slate-100 text-sm">
                  <td className="py-4 pr-4 font-bold">{item.item}</td>
                  <td className="py-4 pr-4 text-slate-600">{item.type}</td>
                  <td className="py-4 pr-4 text-slate-600">{item.stock}</td>
                  <td className="py-4 pr-4 text-slate-600">{item.unit}</td>
                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === 'Low stock'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-lab-50 text-lab-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
}

function PageShell({ children }) {
  return <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">{children}</section>;
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function Tag({ children }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{children}</span>;
}

function Control({ label, value }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-ink">
        {value}
      </div>
    </label>
  );
}

function Interpretation({ label, result }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="font-bold text-ink">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{result}</p>
    </div>
  );
}

export default App;
