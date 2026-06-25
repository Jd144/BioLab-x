import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
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
  Download,
  Eye,
  FileCheck2,
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
  Printer,
  QrCode,
  Search,
  Sparkles,
  Timer,
  TestTube2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { experiments } from './data/experiments';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';

const pages = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'experiments', label: 'Experiments', icon: FlaskConical, path: '/experiments' },
];

const dashboardRoles = ['student', 'teacher', 'lab_assistant', 'phd', 'institute', 'admin'];
const ADMIN_EMAIL = 'charanjaydeep712@gmail.com';
const ADMIN_OVERRIDE_STORAGE_KEY = 'biolabx-admin-overrides';

const routePaths = {
  home: '/',
  student: '/student',
  studentCertificates: '/student/certificates',
  experiments: '/experiments',
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
  studentCertificates: 'Certificate History',
  experiments: 'Experiments',
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
const publicSignupRoles = ['student', 'teacher', 'lab_assistant', 'phd', 'institute'];
const verificationRequiredRoles = ['teacher', 'lab_assistant', 'phd', 'institute'];

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  lab_assistant: 'Lab Assistant',
  phd: 'PhD Scholar',
  institute: 'Institute',
  admin: 'Admin',
};

const experimentIconMap = {
  activity: Activity,
  beaker: Beaker,
  brain: BrainCircuit,
  chart: BarChart3,
  dna: Dna,
  eye: Eye,
  flask: FlaskConical,
  testTube: TestTube2,
};

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

const roleDashboardWorkspaces = {
  student: {
    summary: [
      ['Course', 'course', 'Not set'],
      ['Batch year', 'batch_year', 'Not set'],
      ['Entry / roll number', 'entry_number', 'Not set'],
      ['Bio', 'bio', 'Not added'],
    ],
    metrics: [
      ['Joined teachers/classes', '3'],
      ['Assigned experiments', '8'],
      ['Attendance summary', '86%'],
      ['Total study time', '18.5 h'],
    ],
    cards: [
      ['Search institute teachers', 'Find teachers by institute, department, or lab and send join requests.'],
      ['Today assigned experiment', 'PCR Amplification due today with quiz and simulation.'],
      ['Study/lab material', 'View teacher uploaded instructions, links, and resources.'],
      ['Certificates', 'Open earned certificates from completed BioLabX modules.'],
    ],
    tableTitle: 'Student Learning Overview',
    tableRows: [
      ['Quiz scores', 'PCR 82%, Gel 90%, ELISA 76%'],
      ['Experiment performance', 'Strong in sample prep, needs result interpretation practice'],
      ['Topic-wise progress', 'Molecular biology 72%, Microscopy 64%, Biochemistry 58%'],
      ['Recent notices', 'Bring lab notebook for Friday wet-lab briefing'],
      ['Recommended experiments', 'Gel Electrophoresis, Protein Assay, Microscopy'],
    ],
  },
  teacher: {
    summary: [
      ['Designation', 'designation', 'Not set'],
      ['Department', 'department', 'Not set'],
      ['Lab name', 'lab_name', 'Not set'],
      ['Subjects / lab courses', 'subjects_taught', 'Not set'],
    ],
    metrics: [
      ['Classes created', '4'],
      ['Student requests', '12'],
      ['Student list', '128'],
      ['Pending assignments', '6'],
    ],
    cards: [
      ['Create classroom/lab group', 'Set up sections for batches, practical groups, or lab rotations.'],
      ['Accept/reject requests', 'Review student join requests and bulk accept eligible students.'],
      ['Assign experiment', 'Attach due date, instructions, links, and resource material.'],
      ['Mark attendance', 'Create attendance sessions and mark present/absent records.'],
    ],
    tableTitle: 'Teacher Analytics Snapshot',
    tableRows: [
      ['Quiz score tracking', 'Average 81% across current class modules'],
      ['Time spent per student', 'Range 22-95 minutes per assigned activity'],
      ['Topic progress per student', 'DNA workflows ahead, ELISA interpretation needs support'],
      ['Student profile view', 'Attendance percentage, attempt history, scores, topics, time spent'],
      ['Performance graph', 'Graph placeholder ready for chart integration'],
    ],
  },
  phd: {
    summary: [
      ['Supervisor / PI', 'supervisor_name', 'Not assigned'],
      ['Institute', 'institute', 'Not set'],
      ['Research area', 'research_area', 'Not set'],
      ['Current project', 'current_project', 'Not set'],
    ],
    metrics: [
      ['Publications', 'publications_count'],
      ['Conferences', 'conferences_count'],
      ['Research progress', '64%'],
      ['Protocol notes', '11'],
    ],
    cards: [
      ['Update research profile', 'Maintain research area, current project, lab, and supervisor details.'],
      ['Protocol notes', 'Draft reusable notes for experiments, troubleshooting, and observations.'],
      ['Experiment records', 'Track virtual and lab experiment records for project continuity.'],
      ['Inventory access', 'Lab inventory visibility is shown after teacher/PI approval.'],
    ],
    tableTitle: 'Research Workspace',
    tableRows: [
      ['Lab name', 'Connected lab profile from signup or supervisor assignment'],
      ['Project details', 'Current project title and progress summary'],
      ['Publications count', 'Editable research output count'],
      ['Conference count', 'Editable conference participation count'],
      ['Protocol notes', 'Placeholder list ready for Supabase protocol records'],
    ],
  },
  lab_assistant: {
    summary: [
      ['Assigned lab', 'lab_name', 'Not assigned'],
      ['Department', 'department', 'Not set'],
      ['Institute', 'institute', 'Not set'],
      ['Responsibility / work area', 'responsibility', 'Not set'],
    ],
    metrics: [
      ['Inventory items', '146'],
      ['Stock alerts', '9'],
      ['Expiry alerts', '5'],
      ['Maintenance records', '13'],
    ],
    cards: [
      ['Add/edit inventory', 'Create item records, units, locations, reorder levels, and suppliers.'],
      ['Update stock', 'Log incoming and consumed reagents through inventory logs.'],
      ['Equipment maintenance', 'Add scheduled, in-progress, completed, and overdue maintenance records.'],
      ['Lab updates', 'Send updates visible to approved teachers, PIs, PhD scholars, and lab members.'],
    ],
    tableTitle: 'Lab Operations Snapshot',
    tableRows: [
      ['Reagent stock alerts', 'Taq polymerase low, ELISA substrate reorder required'],
      ['Expiry alerts', 'Agar plates and staining reagents due for review'],
      ['Lab members', 'Visible after PI/teacher approval'],
      ['Equipment maintenance', 'Centrifuge calibration due this week'],
      ['Responsibility updates', 'Media prep, reagent stock, and equipment readiness'],
    ],
  },
  institute: {
    summary: [
      ['Institute / University', 'institute', 'Not set'],
      ['Department / school', 'department', 'Not set'],
      ['Number of labs', 'number_of_labs', 'Not set'],
      ['Head / coordinator', 'coordinator_name', 'Not set'],
    ],
    metrics: [
      ['Departments', '7'],
      ['Labs', '18'],
      ['Teachers', '46'],
      ['Students', '1,240'],
    ],
    cards: [
      ['Add department', 'Create institute departments or schools.'],
      ['Add lab', 'Register labs, lab heads, and research areas.'],
      ['View members', 'Review teachers, PhD scholars, lab assistants, and students.'],
      ['Activity summary', 'View lab-wise classroom, assignment, attendance, and inventory summaries.'],
    ],
    tableTitle: 'Institute Lab Directory',
    tableRows: [
      ['Lab heads', 'Molecular diagnostics, cell culture, microbiology'],
      ['Research areas', 'Genomics, immunology, fermentation, bioanalytics'],
      ['Ongoing lab work', 'PCR training, ELISA batch, protein assay workshop'],
      ['Lab-wise data', 'Member count, assignments, inventory readiness'],
      ['Directory status', 'Prepared for live Supabase institute records'],
    ],
  },
  admin: {
    summary: [
      ['Organization', 'organization', 'Not set'],
      ['Reason for access', 'access_reason', 'Not set'],
      ['Role', 'role', 'Admin'],
      ['Bio', 'bio', 'Not added'],
    ],
    metrics: [
      ['Role groups', '6'],
      ['Institutes', '12'],
      ['Labs tracked', '58'],
      ['System notices', '4'],
    ],
    cards: [
      ['Manage platform structure', 'Prepare role oversight for institutes, labs, and classrooms.'],
      ['Review access', 'Admin code and organization fields are captured during signup.'],
      ['Audit activity', 'Placeholder for future Supabase audit and moderation workflows.'],
      ['Support users', 'Route platform operations without exposing wrong dashboards.'],
    ],
    tableTitle: 'Admin Control Snapshot',
    tableRows: [
      ['User roles', 'Student, teacher, PhD, lab assistant, institute, admin'],
      ['Access control', 'Protected routes enforce dashboard ownership'],
      ['Schema readiness', 'Core lab management tables are defined'],
      ['Operations', 'Future support, review, and moderation workflows'],
      ['System health', 'Build-ready frontend MVP foundation'],
    ],
  },
};

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

const labGalleryCards = [
  {
    title: 'Molecular Biology Lab',
    description: 'PCR, gel electrophoresis, cloning, and nucleic-acid workflow preparation.',
    icon: Dna,
  },
  {
    title: 'Cell Culture Lab',
    description: 'Aseptic practice, culture handling, media preparation, and contamination awareness.',
    icon: FlaskConical,
  },
  {
    title: 'Microbiology Lab',
    description: 'Sterile technique, bacterial handling, staining, plating, and observation workflows.',
    icon: Microscope,
  },
  {
    title: 'Instrumentation Lab',
    description: 'Instrument readiness, calibration habits, maintenance records, and usage tracking.',
    icon: Activity,
  },
  {
    title: 'Biochemistry Lab',
    description: 'Protein assays, enzyme workflows, buffers, reagents, and quantitative analysis.',
    icon: Beaker,
  },
  {
    title: 'Research Lab',
    description: 'Project tracking, protocol notes, supervisor connections, and lab collaboration.',
    icon: BrainCircuit,
  },
];

const equipmentAnnouncements = [
  { name: 'PCR Machine', icon: Dna },
  { name: 'Gel Electrophoresis Unit', icon: Activity },
  { name: 'Microscope', icon: Microscope },
  { name: 'Centrifuge', icon: GaugeIcon },
  { name: 'Laminar Air Flow', icon: Sparkles },
  { name: 'Incubator', icon: Timer },
  { name: 'Autoclave', icon: ShieldIcon },
  { name: 'Spectrophotometer', icon: BarChart3 },
  { name: 'Micropipette', icon: TestTube2 },
  { name: 'ELISA Plate Reader', icon: ClipboardList },
  { name: 'Water Bath', icon: Beaker },
  { name: 'Biosafety Cabinet', icon: LockKeyhole },
];

const platformModules = [
  { title: 'Virtual Experiments', icon: FlaskConical },
  { title: 'Student Performance Tracking', icon: BarChart3 },
  { title: 'Teacher Classroom Management', icon: BookOpenCheck },
  { title: 'Attendance Management', icon: CalendarDays },
  { title: 'Quiz and Certification', icon: FileCheck2 },
  { title: 'Lab Inventory Management', icon: Boxes },
  { title: 'PhD Research Profile', icon: BrainCircuit },
  { title: 'Institute Lab Directory', icon: Landmark },
];

const roleExplainers = [
  {
    role: 'Student',
    icon: GraduationCap,
    description: 'Join classes, complete assigned experiments, attempt quizzes, track progress, and earn certificates.',
  },
  {
    role: 'Teacher',
    icon: BookOpenCheck,
    description: 'Create lab groups, approve students, assign experiments, upload resources, and review performance.',
  },
  {
    role: 'PhD Scholar',
    icon: Microscope,
    description: 'Maintain research profile, protocol notes, project details, publications, and lab records.',
  },
  {
    role: 'Lab Assistant',
    icon: Boxes,
    description: 'Manage stock, equipment maintenance, reagent alerts, and lab updates after approval.',
  },
  {
    role: 'Institute',
    icon: Landmark,
    description: 'Organize departments, labs, lab heads, members, research areas, and activity summaries.',
  },
];

function GaugeIcon(props) {
  return <Timer {...props} />;
}

function ShieldIcon(props) {
  return <LockKeyhole {...props} />;
}

function getExperimentIcon(experiment) {
  return experimentIconMap[experiment.iconKey] ?? FlaskConical;
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
    ?? (activePage === 'studentCertificates' ? FileCheck2 : null)
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
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const nextProfile = applyAdminOverride(error ? fallbackProfile : { ...fallbackProfile, ...data });
      const resolvedProfile = isAdminEmail(currentUser.email)
        ? {
            ...nextProfile,
            role: 'admin',
            email: currentUser.email,
            verification_status: 'approved',
          }
        : nextProfile;

      if (isMounted) {
        setProfile(resolvedProfile);
      }

      if (isAdminEmail(currentUser.email) && supabase) {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          user_id: currentUser.id,
          full_name: resolvedProfile.full_name,
          email: currentUser.email,
          role: 'admin',
          verification_status: 'approved',
        });
      }

      return resolvedProfile;
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

    const metadataRole = isAdminEmail(nextSession?.user?.email)
      ? 'admin'
      : nextSession?.user?.user_metadata?.role;
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
          <Route
            path="/experiments/:experimentSlug"
            element={<ExperimentDetailPage user={user} profile={profile} onNavigate={goToPage} />}
          />
          <Route path="/gel-electrophoresis" element={<Navigate to="/experiments/gel-electrophoresis" replace />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="student">
                <RoleDashboard role="student" user={user} profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificates"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="student">
                <StudentCertificatesPage user={user} profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="teacher">
                <RoleDashboard role="teacher" user={user} profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-assistant"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="lab_assistant">
                <RoleDashboard role="lab_assistant" user={user} profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phd"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="phd">
                <RoleDashboard role="phd" user={user} profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/institute"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="institute">
                <RoleDashboard role="institute" user={user} profile={profile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isLoading={authLoading} user={user} profile={profile} allowedRole="admin">
                <RoleDashboard role="admin" user={user} profile={profile} />
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
  if (pathname === '/student/certificates') {
    return 'studentCertificates';
  }

  if (pathname.startsWith('/experiments/')) {
    return 'experiments';
  }

  const route = Object.entries(routePaths).find(([, path]) => path === pathname);
  return route?.[0] ?? 'home';
}

function getDashboardPathForRole(role) {
  const normalizedRole = normalizeRole(role);
  return routePaths[normalizedRole] ?? routePaths.student;
}

function getAdminOverrides() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(ADMIN_OVERRIDE_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function getAdminOverride(userId) {
  return getAdminOverrides()[userId] ?? {};
}

function saveAdminOverride(userId, patch) {
  if (typeof window === 'undefined' || !userId) {
    return;
  }

  const overrides = getAdminOverrides();
  overrides[userId] = {
    ...(overrides[userId] ?? {}),
    ...patch,
    updated_at: new Date().toISOString(),
  };
  window.localStorage.setItem(ADMIN_OVERRIDE_STORAGE_KEY, JSON.stringify(overrides));
}

function applyAdminOverride(profileLike) {
  if (!profileLike?.id) {
    return profileLike;
  }

  return {
    ...profileLike,
    ...getAdminOverride(profileLike.id),
  };
}

function isAdminEmail(email) {
  return email?.toLowerCase() === ADMIN_EMAIL;
}

function normalizeRole(role) {
  return roleOptions.includes(role) ? role : 'student';
}

function buildProfileFromUser(user) {
  const metadata = user.user_metadata ?? {};

  return applyAdminOverride({
    id: user.id,
    full_name: metadata.full_name ?? user.email?.split('@')[0] ?? 'BioLabX User',
    role: isAdminEmail(user.email) ? 'admin' : normalizeRole(metadata.role),
    institution: metadata.institution ?? '',
    institute: metadata.institute ?? metadata.institution ?? '',
    department: metadata.department ?? '',
    email: user.email ?? metadata.email ?? '',
    mobile_number: metadata.mobile_number ?? '',
    course: metadata.course ?? '',
    batch_year: metadata.batch_year ?? '',
    entry_number: metadata.entry_number ?? '',
    roll_number: metadata.roll_number ?? '',
    designation: metadata.designation ?? '',
    subjects_taught: metadata.subjects_taught ?? '',
    lab_name: metadata.lab_name ?? '',
    teacher_name: metadata.teacher_name ?? '',
    instructor_name: metadata.instructor_name ?? '',
    supervisor_name: metadata.supervisor_name ?? '',
    pi_name: metadata.pi_name ?? '',
    research_area: metadata.research_area ?? '',
    current_project: metadata.current_project ?? '',
    publications_count: metadata.publications_count ?? '',
    conferences_count: metadata.conferences_count ?? '',
    responsibility: metadata.responsibility ?? '',
    experience: metadata.experience ?? '',
    phd_year: metadata.phd_year ?? '',
    number_of_labs: metadata.number_of_labs ?? '',
    coordinator_name: metadata.coordinator_name ?? '',
    official_email: metadata.official_email ?? '',
    organization: metadata.organization ?? '',
    bio: metadata.bio ?? '',
    verification_status: isAdminEmail(user.email) || metadata.role === 'student' ? 'approved' : 'pending',
    attendance_status: metadata.attendance_status ?? '',
    class_name: metadata.class_name ?? '',
    batch_name: metadata.batch_name ?? '',
  });
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
  const userRole = isAdminEmail(user?.email) ? 'admin' : normalizeRole(profile?.role ?? user?.user_metadata?.role);

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

  if (allowedRole === 'admin' && !isAdminEmail(user.email)) {
    return <Navigate to={getDashboardPathForRole(userRole)} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={getDashboardPathForRole(userRole)} replace />;
  }

  if (
    verificationRequiredRoles.includes(userRole)
    && profile?.verification_status !== 'approved'
  ) {
    return <VerificationPendingPage role={userRole} profile={profile} />;
  }

  return children;
}

function VerificationPendingPage({ role, profile }) {
  return (
    <PageShell>
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Admin verification required
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Your {formatRole(role).toLowerCase()} account is pending admin verification
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
              BioLabX has saved your profile. Full dashboard access unlocks after an admin approves
              your verification request.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-800">
            {profile?.verification_status ?? 'pending'}
          </span>
        </div>
      </section>
    </PageShell>
  );
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    role: 'student',
    password: '',
    confirm_password: '',
  });
  const [status, setStatus] = useState({ type: 'idle', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const role = formData.role;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setStatus({ type: 'idle', text: '' });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.full_name || !formData.email || !formData.mobile_number || !formData.role)) {
      setStatus({ type: 'error', text: 'Please complete all basic details before continuing.' });
      return;
    }

    setStep((current) => Math.min(current + 1, 3));
    setStatus({ type: 'idle', text: '' });
  };

  const previousStep = () => {
    setStep((current) => Math.max(current - 1, 1));
    setStatus({ type: 'idle', text: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setStatus({ type: 'error', text: 'Password and confirm password do not match.' });
      return;
    }

    if (!supabase) {
      setStatus({
        type: 'error',
        text: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', text: '' });

    const profilePayload = buildSignupProfilePayload(formData);
    const verificationStatus = role === 'student' ? 'approved' : 'pending';
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: profilePayload,
      },
    });

    if (error) {
      setIsSubmitting(false);
      setStatus({ type: 'error', text: error.message });
      return;
    }

    if (data.user) {
      const fullProfilePayload = {
        id: data.user.id,
        user_id: data.user.id,
        ...profilePayload,
        verification_status: verificationStatus,
      };
      const { error: profileError } = await supabase.from('profiles').upsert(fullProfilePayload);

      if (profileError) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: formData.full_name,
          role,
          verification_status: verificationStatus,
        });
      }

      if (role !== 'student') {
        await supabase.from('verification_requests').insert({
          user_id: data.user.id,
          role_requested: role,
          status: 'pending',
          details: profilePayload,
        });
      }
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
      <SignupStepIndicator step={step} />
      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <TextField label="Full Name" value={formData.full_name} onChange={(value) => updateField('full_name', value)} placeholder="Your full name" required />
            <TextField label="Email" type="email" value={formData.email} onChange={(value) => updateField('email', value)} placeholder="name@institution.edu" required />
            <TextField label="Mobile Number" value={formData.mobile_number} onChange={(value) => updateField('mobile_number', value)} placeholder="+91 98765 43210" required />
            <SelectField
              label="Select Role"
              value={role}
              onChange={(value) => updateField('role', value)}
              options={publicSignupRoles.map((option) => ({ value: option, label: formatRole(option) }))}
            />
          </>
        )}

        {step === 2 && <RoleSpecificSignupFields role={role} formData={formData} updateField={updateField} />}

        {step === 3 && (
          <>
            <TextField label="Password" type="password" value={formData.password} onChange={(value) => updateField('password', value)} placeholder="Create a secure password" required minLength={6} />
            <TextField label="Confirm Password" type="password" value={formData.confirm_password} onChange={(value) => updateField('confirm_password', value)} placeholder="Re-enter your password" required minLength={6} />
          </>
        )}

        <AuthStatus status={status} />
        <div className="flex flex-col gap-3 sm:flex-row">
          {step > 1 && (
            <button
              type="button"
              onClick={previousStep}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-lab-600"
            >
              Continue
              <ChevronRight size={17} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-lab-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={17} />
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          )}
        </div>
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

function SelectField({ label, value, onChange, options, ...selectProps }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select
        className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink outline-none transition focus:border-lab-500 focus:ring-4 focus:ring-lab-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...selectProps}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, ...textareaProps }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <textarea
        className="mt-2 min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-lab-500 focus:ring-4 focus:ring-lab-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...textareaProps}
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
  const normalizedRole = normalizeRole(role);
  return roleLabels[normalizedRole] ?? normalizedRole
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function HomePage({ onNavigate }) {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lab-100 bg-lab-50 px-3 py-1 text-sm font-bold text-lab-700">
              <Sparkles size={16} />
              Role-based biotechnology learning and lab management
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              BioLabX - Virtual Biotechnology Lab & Learning Platform
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              A platform for students, teachers, PhD scholars, lab assistants, and institutes to
              learn, simulate, manage, and track biotechnology laboratory work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onNavigate('experiments')}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-lab-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-lab-600"
              >
                Explore Experiments
                <BookOpenCheck size={18} />
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-lab-200 hover:bg-lab-50"
              >
                Create Account
                <UserPlus size={18} />
              </button>
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

      <EquipmentMarquee />

      <HomeSection
        eyebrow="What is BioLabX?"
        title="A practical operating layer for biotechnology learning"
        description="BioLabX helps biotechnology and life-science learners practice experiments, understand lab workflows, track performance, manage classes, labs, inventory, and connect with teachers, supervisors, and institute labs."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <IconCard icon={FlaskConical} title="Learn and simulate" text="Students rehearse workflows before entering a real laboratory." />
          <IconCard icon={Users} title="Connect academic roles" text="Teachers, supervisors, lab assistants, and institutes can work around shared lab activity." />
          <IconCard icon={BarChart3} title="Track laboratory readiness" text="Progress, quiz scores, attendance, certificates, inventory, and research records become organized." />
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Lab Gallery"
        title="Designed around real academic laboratory environments"
        description="BioLabX uses clean lab-area cards to help learners understand where each training workflow belongs."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {labGalleryCards.map((card) => (
            <LabGalleryCard key={card.title} card={card} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Platform Modules"
        title="One foundation for learning, teaching, research, and lab operations"
        description="Each module is structured for future live Supabase data while staying simple and academic in this MVP."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformModules.map((module) => (
            <IconCard key={module.title} icon={module.icon} title={module.title} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="User Roles"
        title="Role-aware dashboards for every biotechnology lab stakeholder"
        description="Every account starts with a role so BioLabX can show the right dashboard, workflows, and future permissions."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roleExplainers.map((role) => (
            <IconCard key={role.role} icon={role.icon} title={role.role} text={role.description} />
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
            Understand the platform, choose your role, and start structured lab training
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create an account after exploring the modules so BioLabX can route you to the right learning,
            teaching, research, or lab management workspace.
          </p>
          <button
            onClick={() => onNavigate('signup')}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700"
          >
            Create Account
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

function EquipmentMarquee() {
  const repeatedItems = [...equipmentAnnouncements, ...equipmentAnnouncements];

  return (
    <section className="overflow-hidden border-b border-slate-200 bg-white py-4">
      <div className="flex min-w-max animate-equipment-marquee gap-3">
        {repeatedItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.name}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-lab-100 bg-lab-50 px-4 py-2 text-sm font-bold text-lab-800"
            >
              <Icon size={17} />
              {item.name}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LabGalleryCard({ card }) {
  const Icon = card.icon;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-lab-50 via-white to-slate-100">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-lab-100 bg-white text-lab-700 shadow-sm">
          <Icon size={36} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-ink">{card.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
      </div>
    </article>
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

function SignupStepIndicator({ step }) {
  return (
    <div className="mb-5 grid gap-2 sm:grid-cols-3">
      {['Basic Details', 'Role Details', 'Security'].map((label, index) => {
        const stepNumber = index + 1;
        return (
          <div
            key={label}
            className={`rounded-md border p-3 text-sm font-bold ${
              step === stepNumber
                ? 'border-lab-200 bg-lab-50 text-lab-700'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            Step {stepNumber}: {label}
          </div>
        );
      })}
    </div>
  );
}

function RoleSpecificSignupFields({ role, formData, updateField }) {
  const roleFields = {
    student: [
      { name: 'course', label: 'Course', type: 'select', options: ['BSc', 'MSc', 'BTech', 'MTech', 'PhD', 'Intern', 'Other'] },
      { name: 'batch_year', label: 'Batch Year' },
      { name: 'entry_number', label: 'Entry Number / Roll Number' },
      { name: 'department', label: 'Department' },
      { name: 'institute', label: 'Institute / University' },
      { name: 'bio', label: 'Short Bio', type: 'textarea' },
    ],
    teacher: [
      { name: 'designation', label: 'Designation' },
      { name: 'department', label: 'Department' },
      { name: 'institute', label: 'Institute / University' },
      { name: 'subjects_taught', label: 'Subjects / Lab Courses Taught' },
      { name: 'lab_name', label: 'Lab Name' },
      { name: 'bio', label: 'Short Bio', type: 'textarea' },
    ],
    phd: [
      { name: 'phd_year', label: 'Year of PhD' },
      { name: 'department', label: 'Department' },
      { name: 'institute', label: 'Institute / University' },
      { name: 'supervisor_name', label: 'Supervisor / PI Name' },
      { name: 'lab_name', label: 'Lab Name' },
      { name: 'research_area', label: 'Research Area' },
      { name: 'current_project', label: 'Current Project Title' },
      { name: 'publications_count', label: 'Publications Count', type: 'number' },
      { name: 'conferences_count', label: 'Conferences Count', type: 'number' },
      { name: 'bio', label: 'Short Bio', type: 'textarea' },
    ],
    lab_assistant: [
      { name: 'department', label: 'Department' },
      { name: 'institute', label: 'Institute / University' },
      { name: 'lab_name', label: 'Lab Name' },
      { name: 'responsibility', label: 'Responsibility / Work Area' },
      { name: 'experience', label: 'Experience' },
      { name: 'bio', label: 'Short Bio', type: 'textarea' },
    ],
    institute: [
      { name: 'institute', label: 'Institute / University Name' },
      { name: 'department', label: 'Department / School Name' },
      { name: 'number_of_labs', label: 'Number of Labs', type: 'number' },
      { name: 'coordinator_name', label: 'Head / Coordinator Name' },
      { name: 'official_email', label: 'Official Email', type: 'email' },
      { name: 'bio', label: 'Short Description', type: 'textarea' },
    ],
    admin: [
      { name: 'admin_code', label: 'Admin Code', placeholder: 'Enter admin access code' },
      { name: 'organization', label: 'Organization' },
      { name: 'access_reason', label: 'Reason for Access', type: 'textarea' },
    ],
  };

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-lab-100 bg-lab-50 p-3 text-sm font-semibold text-lab-800">
        Selected role: {formatRole(role)}
      </div>
      {roleFields[role].map((field) => {
        if (field.type === 'textarea') {
          return (
            <TextAreaField
              key={field.name}
              label={field.label}
              value={formData[field.name] ?? ''}
              onChange={(value) => updateField(field.name, value)}
              placeholder={field.placeholder ?? field.label}
            />
          );
        }

        if (field.type === 'select') {
          return (
            <SelectField
              key={field.name}
              label={field.label}
              value={formData[field.name] ?? ''}
              onChange={(value) => updateField(field.name, value)}
              options={field.options.map((option) => ({ value: option, label: option }))}
            />
          );
        }

        return (
          <TextField
            key={field.name}
            label={field.label}
            type={field.type ?? 'text'}
            value={formData[field.name] ?? ''}
            onChange={(value) => updateField(field.name, value)}
            placeholder={field.placeholder ?? field.label}
          />
        );
      })}
    </div>
  );
}

function buildSignupProfilePayload(formData) {
  const { confirm_password, password, ...profilePayload } = formData;
  return profilePayload;
}

function RoleDashboard({ role, user, profile }) {
  if (role === 'admin') {
    return <AdminDashboard user={user} profile={profile} />;
  }

  return <LiveRoleDashboard role={role} user={user} profile={profile} />;
}

function LiveRoleDashboard({ role, user, profile }) {
  const config = roleDashboardConfig[role] ?? roleDashboardConfig.student;
  const Icon = config.icon;
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [status, setStatus] = useState({ loading: true, text: '' });

  const loadData = async () => {
    if (!supabase || !user) {
      setData({});
      setStatus({ loading: false, text: 'Supabase is not configured yet.' });
      return;
    }

    setStatus({ loading: true, text: '' });
    const nextData = {};

    if (role === 'student') {
      nextData.classes = await fetchRows('class_members', '*, classes(*)', 'student_id', user.id);
      nextData.joinRequests = await fetchRows('join_requests', '*, classes(*)', 'student_id', user.id);
      nextData.assignments = await fetchRows('assignments', '*');
      nextData.quizResults = await fetchRows('quiz_results', '*', 'student_id', user.id);
      nextData.progress = await fetchRows('experiment_progress', '*', 'student_id', user.id);
      nextData.certificates = await fetchRows('certificates', '*', 'student_id', user.id);
    }

    if (role === 'teacher') {
      nextData.classes = await fetchRows('classes', '*', 'teacher_id', user.id);
      nextData.joinRequests = await fetchRows('join_requests', '*', 'teacher_id', user.id);
      nextData.assignments = await fetchRows('assignments', '*', 'teacher_id', user.id);
      nextData.notices = await fetchRows('notices', '*', 'author_id', user.id);
      nextData.materials = await fetchRows('study_materials', '*', 'teacher_id', user.id);
      nextData.attendance = await fetchRows('attendance_sessions', '*', 'teacher_id', user.id);
    }

    if (role === 'phd') {
      nextData.researchProfiles = await fetchRows('research_profiles', '*', 'profile_id', user.id);
      nextData.publications = await fetchRows('publications', '*');
      nextData.conferences = await fetchRows('conferences', '*');
      nextData.labMemberships = await fetchRows('lab_members', '*, labs(*)', 'profile_id', user.id);
    }

    if (role === 'lab_assistant') {
      nextData.labMemberships = await fetchRows('lab_members', '*, labs(*)', 'profile_id', user.id);
      nextData.inventory = await fetchRows('inventory_items', '*');
      nextData.inventoryLogs = await fetchRows('inventory_logs', '*');
      nextData.maintenance = await fetchRows('equipment_maintenance', '*');
    }

    if (role === 'institute') {
      nextData.institutes = await fetchRows('institutes', '*', 'created_by', user.id);
      nextData.departments = await fetchRows('departments', '*');
      nextData.labs = await fetchRows('labs', '*');
      nextData.members = await fetchRows('lab_members', '*');
      nextData.classes = await fetchRows('classes', '*');
    }

    setData(nextData);
    setStatus({ loading: false, text: '' });
  };

  useEffect(() => {
    loadData();
  }, [role, user?.id]);

  return (
    <PageShell>
      <DashboardHeader icon={Icon} title={config.title} subtitle={roleDashboardSubtitle(role)} profile={profile} />
      {status.loading && <LoadingState />}
      {status.text && <StatusNotice type="warning" text={status.text} />}

      <Panel title="Profile Summary" subtitle="Live Supabase profile record.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {profileFieldsForRole(role).map(([label, field, fallback]) => (
            <ProfileFact key={label} label={label} value={profileDisplayValue(profile, field, fallback)} />
          ))}
        </div>
      </Panel>

      {role === 'student' && <StudentLiveWorkspace data={data} onCertificates={() => navigate('/student/certificates')} />}
      {role === 'teacher' && <TeacherLiveWorkspace user={user} data={data} reload={loadData} />}
      {role === 'phd' && <ResearchLiveWorkspace data={data} />}
      {role === 'lab_assistant' && <LabAssistantLiveWorkspace user={user} data={data} reload={loadData} />}
      {role === 'institute' && <InstituteLiveWorkspace user={user} data={data} reload={loadData} />}
    </PageShell>
  );
}

function DashboardHeader({ icon: Icon, title, subtitle, profile }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
            <Icon size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lab-700">Live dashboard</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="font-bold text-ink">{profile?.full_name ?? 'BioLabX User'}</p>
          <p className="mt-1 font-semibold text-slate-500">{formatRole(profile?.role)}</p>
        </div>
      </div>
    </section>
  );
}

function roleDashboardSubtitle(role) {
  const subtitles = {
    student: 'Only your own classes, requests, assignments, quiz attempts, progress, and certificates are shown.',
    teacher: 'Only your classes, requests, assignments, notices, materials, and attendance sessions are shown.',
    phd: 'Only approved research profile and lab membership records from Supabase are shown.',
    lab_assistant: 'Only live lab, inventory, stock log, and maintenance records are shown.',
    institute: 'Only live institute, department, lab, member, and class records are shown.',
  };
  return subtitles[role] ?? 'Live Supabase records only.';
}

function profileFieldsForRole(role) {
  const common = [
    ['Full name', 'full_name', 'Not set'],
    ['Email', 'email', 'Not set'],
    ['Mobile number', 'mobile_number', 'Not set'],
    ['Status', 'verification_status', 'pending'],
  ];
  const fields = {
    student: [['Course', 'course', 'Not set'], ['Batch year', 'batch_year', 'Not set'], ['Entry / roll number', 'entry_number', 'Not set'], ['Institute', 'institute', 'Not set']],
    teacher: [['Designation', 'designation', 'Not set'], ['Department', 'department', 'Not set'], ['Institute', 'institute', 'Not set'], ['Lab name', 'lab_name', 'Not set']],
    phd: [['Supervisor / PI', 'supervisor_name', 'Not assigned'], ['Research area', 'research_area', 'Not set'], ['Current project', 'current_project', 'Not set'], ['Lab name', 'lab_name', 'Not set']],
    lab_assistant: [['Department', 'department', 'Not set'], ['Institute', 'institute', 'Not set'], ['Lab name', 'lab_name', 'Not assigned'], ['Responsibility', 'responsibility', 'Not set']],
    institute: [['Institute', 'institute', 'Not set'], ['Department / school', 'department', 'Not set'], ['Official email', 'official_email', 'Not set'], ['Coordinator', 'coordinator_name', 'Not set']],
    admin: [['Email', 'email', ADMIN_EMAIL], ['Role', 'role', 'admin'], ['Verification state', 'verification_status', 'approved'], ['Institute', 'institute', 'Not set']],
  };
  return [...common.slice(0, role === 'admin' ? 1 : common.length), ...(fields[role] ?? [])];
}

async function fetchRows(table, select = '*', column, value) {
  if (!supabase) {
    return [];
  }

  let query = supabase.from(table).select(select);
  if (column && value) {
    query = query.eq(column, value);
  }
  const { data, error } = await query;
  return error ? [] : data ?? [];
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">
      Loading live Supabase data...
    </div>
  );
}

function EmptyState({ title = 'No data yet', text = 'Records will appear here after they are created in Supabase.' }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 leading-6">{text}</p>
    </div>
  );
}

function LiveCountGrid({ items }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, rows]) => (
        <MetricCard key={label} icon={BarChart3} label={label} value={rows?.length ? `${rows.length}` : 'No data yet'} />
      ))}
    </div>
  );
}

function StudentLiveWorkspace({ data, onCertificates }) {
  return (
    <>
      <LiveCountGrid items={[
        ['Joined classes', data.classes],
        ['Pending requests', data.joinRequests],
        ['Quiz attempts', data.quizResults],
        ['Certificates', data.certificates],
      ]} />
      <Panel title="Joined Classes" subtitle="Classes approved through teacher/class membership.">
        <RecordList rows={data.classes} empty="No classes joined yet" render={(row) => row.classes?.name ?? row.class_id} />
      </Panel>
      <Panel title="Assignments and Learning" subtitle="Assigned experiments, progress, scores, and certificates.">
        <div className="grid gap-4 md:grid-cols-2">
          <RecordList rows={data.assignments} empty="No assignments yet" render={(row) => row.title} />
          <RecordList rows={data.quizResults} empty="No quiz attempts yet" render={(row) => `Score ${row.score}/${row.total_marks}`} />
          <RecordList rows={data.progress} empty="No experiment progress yet" render={(row) => `${row.score ?? 'Progress'} ${row.time_spent_minutes ?? 0} min`} />
          <div>
            <RecordList rows={data.certificates} empty="No certificates yet" render={(row) => row.experiment_name} />
            <button onClick={onCertificates} className="mt-3 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white">
              See certificates
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}

function TeacherLiveWorkspace({ user, data, reload }) {
  return (
    <>
      <LiveCountGrid items={[
        ['Classes created', data.classes],
        ['Student requests', data.joinRequests],
        ['Assignments', data.assignments],
        ['Attendance sessions', data.attendance],
      ]} />
      <TeacherCreateClassForm user={user} reload={reload} />
      <Panel title="Class Management" subtitle="Only classes and related records owned by this teacher.">
        <div className="grid gap-4 md:grid-cols-2">
          <RecordList rows={data.classes} empty="No classes created yet" render={(row) => `${row.name} (${row.course ?? 'No course'})`} />
          <TeacherRequestList rows={data.joinRequests} reload={reload} />
          <RecordList rows={data.assignments} empty="No assignments yet" render={(row) => row.title} />
          <RecordList rows={data.notices} empty="No notices yet" render={(row) => row.title} />
          <RecordList rows={data.materials} empty="No study materials yet" render={(row) => row.title} />
          <RecordList rows={data.attendance} empty="No attendance sessions yet" render={(row) => row.topic ?? row.session_date} />
        </div>
      </Panel>
    </>
  );
}

function TeacherCreateClassForm({ user, reload }) {
  const [form, setForm] = useState({ name: '', course: '', batch_year: '', department: '', subject_name: '', institute: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase || !user) return;
    setSaving(true);
    const { error } = await supabase.from('classes').insert({ teacher_id: user.id, ...form });
    setSaving(false);
    setMessage(error ? 'Could not create class.' : 'Class created.');
    if (!error) {
      setForm({ name: '', course: '', batch_year: '', department: '', subject_name: '', institute: '', description: '' });
      reload();
    }
  };

  return (
    <Panel title="Create Classroom / Lab Group" subtitle="Functional Supabase insert for teacher-owned classes.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        {[
          ['name', 'Class name'],
          ['course', 'Course'],
          ['batch_year', 'Batch year'],
          ['department', 'Department'],
          ['subject_name', 'Subject / lab name'],
          ['institute', 'Institute'],
        ].map(([field, label]) => (
          <TextField key={field} label={label} value={form[field]} onChange={(value) => setForm((current) => ({ ...current, [field]: value }))} required={field === 'name'} />
        ))}
        <div className="md:col-span-2">
          <TextAreaField label="Description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
        </div>
        <button disabled={saving} className="rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">
          {saving ? 'Saving...' : 'Create class'}
        </button>
        {message && <p className="self-center text-sm font-semibold text-slate-600">{message}</p>}
      </form>
    </Panel>
  );
}

function TeacherRequestList({ rows = [], reload }) {
  const updateRequest = async (row, status) => {
    if (!supabase) return;
    await supabase.from('join_requests').update({ status }).eq('id', row.id);
    if (status === 'approved' && row.class_id && row.student_id) {
      await supabase.from('class_members').upsert({ class_id: row.class_id, student_id: row.student_id, status: 'active' });
    }
    reload();
  };

  if (!rows?.length) {
    return <EmptyState title="No student requests yet" />;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-bold text-ink">{row.student_id}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{row.status}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => updateRequest(row, 'approved')} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Approve</button>
            <button onClick={() => updateRequest(row, 'rejected')} className="rounded-md bg-rose-600 px-3 py-2 text-xs font-bold text-white">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResearchLiveWorkspace({ data }) {
  return (
    <>
      <LiveCountGrid items={[
        ['Research profiles', data.researchProfiles],
        ['Publications', data.publications],
        ['Conferences', data.conferences],
        ['Lab memberships', data.labMemberships],
      ]} />
      <Panel title="Research Records" subtitle="Live research profile, publications, conferences, and lab access.">
        <div className="grid gap-4 md:grid-cols-2">
          <RecordList rows={data.researchProfiles} empty="No research profile yet" render={(row) => row.current_project ?? row.research_area} />
          <RecordList rows={data.publications} empty="No publications yet" render={(row) => row.title} />
          <RecordList rows={data.conferences} empty="No conferences yet" render={(row) => row.title} />
          <RecordList rows={data.labMemberships} empty="No approved lab access yet" render={(row) => row.labs?.name ?? row.lab_id} />
        </div>
      </Panel>
    </>
  );
}

function LabAssistantLiveWorkspace({ user, data, reload }) {
  return (
    <>
      <LiveCountGrid items={[
        ['Lab memberships', data.labMemberships],
        ['Inventory items', data.inventory],
        ['Stock logs', data.inventoryLogs],
        ['Maintenance records', data.maintenance],
      ]} />
      <InventoryItemForm user={user} reload={reload} />
      <Panel title="Lab Inventory" subtitle="Live inventory, usage logs, and maintenance records.">
        <div className="grid gap-4 md:grid-cols-2">
          <RecordList rows={data.inventory} empty="No inventory items yet" render={(row) => `${row.name} - ${row.quantity} ${row.unit}`} />
          <RecordList rows={data.inventoryLogs} empty="No inventory logs yet" render={(row) => `${row.change_type}: ${row.quantity_change}`} />
          <RecordList rows={data.maintenance} empty="No maintenance records yet" render={(row) => `${row.status} - ${row.scheduled_for}`} />
          <RecordList rows={data.labMemberships} empty="No lab members visible yet" render={(row) => row.labs?.name ?? row.lab_id} />
        </div>
      </Panel>
    </>
  );
}

function InventoryItemForm({ user, reload }) {
  const [form, setForm] = useState({ name: '', category: '', quantity: '', unit: '', reorder_level: '', location: '', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase || !user) return;
    setSaving(true);
    const { error } = await supabase.from('inventory_items').insert({
      ...form,
      quantity: Number(form.quantity || 0),
      reorder_level: Number(form.reorder_level || 0),
    });
    setSaving(false);
    setMessage(error ? 'Could not add inventory item.' : 'Inventory item added.');
    if (!error) {
      setForm({ name: '', category: '', quantity: '', unit: '', reorder_level: '', location: '', expires_at: '' });
      reload();
    }
  };

  return (
    <Panel title="Add Inventory Item" subtitle="Functional Supabase insert for authorized lab inventory records.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        {[
          ['name', 'Item name'],
          ['category', 'Category'],
          ['quantity', 'Quantity'],
          ['unit', 'Unit'],
          ['reorder_level', 'Low stock level'],
          ['location', 'Location'],
          ['expires_at', 'Expiry date'],
        ].map(([field, label]) => (
          <TextField key={field} label={label} type={field === 'expires_at' ? 'date' : 'text'} value={form[field]} onChange={(value) => setForm((current) => ({ ...current, [field]: value }))} required={['name', 'category', 'unit'].includes(field)} />
        ))}
        <button disabled={saving} className="rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300">
          {saving ? 'Saving...' : 'Add item'}
        </button>
        {message && <p className="self-center text-sm font-semibold text-slate-600">{message}</p>}
      </form>
    </Panel>
  );
}

function InstituteLiveWorkspace({ user, data, reload }) {
  return (
    <>
      <LiveCountGrid items={[
        ['Institutes', data.institutes],
        ['Departments', data.departments],
        ['Labs', data.labs],
        ['Classes', data.classes],
      ]} />
      <InstituteCreateForms user={user} reload={reload} />
      <Panel title="Institute Directory" subtitle="Live institute, department, lab, member, and class records.">
        <div className="grid gap-4 md:grid-cols-2">
          <RecordList rows={data.institutes} empty="No institute profile yet" render={(row) => row.name} />
          <RecordList rows={data.departments} empty="No departments yet" render={(row) => row.name} />
          <RecordList rows={data.labs} empty="No labs yet" render={(row) => row.name} />
          <RecordList rows={data.members} empty="No lab members yet" render={(row) => `${row.profile_id} - ${row.role_in_lab}`} />
        </div>
      </Panel>
    </>
  );
}

function InstituteCreateForms({ user, reload }) {
  const [form, setForm] = useState({ name: '', official_email: '', coordinator_name: '', description: '' });
  const [message, setMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!supabase || !user) return;
    const { error } = await supabase.from('institutes').insert({ ...form, created_by: user.id });
    setMessage(error ? 'Could not add institute.' : 'Institute added.');
    if (!error) {
      setForm({ name: '', official_email: '', coordinator_name: '', description: '' });
      reload();
    }
  };

  return (
    <Panel title="Add Institute Profile" subtitle="Functional Supabase insert for institute directory records.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <TextField label="Institute / University name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
        <TextField label="Official email" type="email" value={form.official_email} onChange={(value) => setForm((current) => ({ ...current, official_email: value }))} />
        <TextField label="Coordinator / head" value={form.coordinator_name} onChange={(value) => setForm((current) => ({ ...current, coordinator_name: value }))} />
        <TextField label="Description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
        <button className="rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white">Add institute</button>
        {message && <p className="self-center text-sm font-semibold text-slate-600">{message}</p>}
      </form>
    </Panel>
  );
}

function RecordList({ rows = [], empty = 'No data yet', render }) {
  if (!rows?.length) {
    return <EmptyState title={empty} />;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-bold text-ink">{render(row)}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : 'Live Supabase record'}</p>
        </div>
      ))}
    </div>
  );
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('Supabase request timed out')), timeoutMs);
    }),
  ]);
}

function AdminDashboard({ user, profile }) {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState('');

  const loadAdminData = async () => {
    if (!supabase || !isAdminEmail(user?.email)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(profilesData ?? []);

    const countTables = ['classes', 'labs', 'experiments', 'inventory_items', 'certificates', 'verification_requests', 'platform_announcements', 'admin_actions'];
    const nextCounts = {};
    await Promise.all(countTables.map(async (table) => {
      const { count } = await supabase.from(table).select('id', { count: 'exact', head: true });
      nextCounts[table] = count ?? 0;
    }));
    setCounts(nextCounts);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, [user?.email]);

  const updateUser = async (targetUser, updates, actionType) => {
    if (!supabase || !isAdminEmail(user?.email)) {
      setMessage('Only the hidden admin account can update users.');
      return;
    }

    setUpdatingUserId(targetUser.id);
    setMessage('');

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    try {
      const rpcResult = await withTimeout(
        supabase.rpc('admin_update_profile_status', {
          target_profile_id: targetUser.id,
          profile_updates: payload,
          action_name: actionType,
        }),
        12000,
      );

      let updatedProfile = rpcResult.data;
      let error = rpcResult.error;

      if (error?.message?.includes('Could not find the function')) {
        const directResult = await withTimeout(
          supabase
            .from('profiles')
            .update(payload)
            .eq('id', targetUser.id)
            .select('*')
            .maybeSingle(),
          12000,
        );
        updatedProfile = directResult.data;
        error = directResult.error;
      }

      if (error) {
        if (error.message?.includes('verification_status')) {
          saveAdminOverride(targetUser.id, { verification_status: payload.verification_status ?? 'pending' });
          const compatibilityProfile = {
            ...targetUser,
            verification_status: payload.verification_status ?? targetUser.verification_status ?? 'pending',
          };
          setUsers((currentUsers) =>
            currentUsers.map((item) => (item.id === targetUser.id ? compatibilityProfile : item)),
          );
          setMessage(`${compatibilityProfile.full_name ?? 'User'} updated in compatibility mode. Reload that user account in the same browser.`);
          return;
        }

        setMessage(`Action failed: ${error.message}`);
        return;
      }

      if (!updatedProfile) {
        setMessage('Action failed: profile was not updated. Please apply the latest supabase/schema.sql in Supabase SQL editor.');
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === targetUser.id ? { ...item, ...updatedProfile } : item)),
      );

      supabase.from('admin_actions').insert({
        admin_id: user.id,
        target_user_id: targetUser.id,
        action_type: actionType,
        details: payload,
      }).then(() => {});
      supabase.from('user_status_logs').insert({
        user_id: targetUser.id,
        changed_by: user.id,
        status: deriveVerificationStateLabel(payload.verification_status ?? targetUser.verification_status),
        verification_status: payload.verification_status ?? targetUser.verification_status,
        note: actionType,
      }).then(() => {});

      setMessage(`${updatedProfile.full_name ?? 'User'} updated successfully.`);
      loadAdminData();
    } catch (error) {
      setMessage(`Action stopped: ${error.message}. Please apply the latest supabase/schema.sql in Supabase SQL editor.`);
    } finally {
      setUpdatingUserId('');
    }
  };

  const visibleUsers = filterRole === 'all'
    ? users
    : users.filter((item) => item.role === filterRole);

  return (
    <PageShell>
      <DashboardHeader icon={ShieldIcon} title="Admin Dashboard" subtitle="Hidden admin panel for verification, user control, and platform oversight." profile={profile} />
      {loading && <LoadingState />}
      {message && <StatusNotice type="warning" text={message} />}

      <LiveCountGrid items={[
        ['Total users', users],
        ['Pending verifications', users.filter((item) => item.verification_status === 'pending')],
        ['Suspended users', users.filter((item) => item.verification_status === 'suspended')],
        ['Rejected users', users.filter((item) => item.verification_status === 'rejected')],
      ]} />

      <Panel title="Platform Control" subtitle="Live counts from Supabase tables.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total classes', counts.classes],
            ['Total labs', counts.labs],
            ['Total experiments', counts.experiments],
            ['Inventory summaries', counts.inventory_items],
            ['Certificates issued', counts.certificates],
            ['Verification requests', counts.verification_requests],
            ['Homepage announcements', counts.platform_announcements],
            ['Audit logs', counts.admin_actions],
          ].map(([label, value]) => (
            <ProfileFact key={label} label={label} value={value ? `${value}` : 'No data yet'} />
          ))}
        </div>
      </Panel>

      <Panel title="User Management" subtitle="Approve, reject, suspend, restore, verify, and change roles.">
        <div className="mb-4 max-w-xs">
          <SelectField
            label="Filter by role"
            value={filterRole}
            onChange={setFilterRole}
            options={[{ value: 'all', label: 'All roles' }, ...publicSignupRoles.map((roleName) => ({ value: roleName, label: formatRole(roleName) }))]}
          />
        </div>
        {visibleUsers.length === 0 ? (
          <EmptyState title="No data yet" text="No users match this filter." />
        ) : (
          <div className="space-y-4">
            {visibleUsers.map((targetUser) => (
              <article key={targetUser.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div>
                    <h3 className="font-bold text-ink">{targetUser.full_name ?? 'No name'}</h3>
                    <p className="mt-1 text-sm text-slate-600">{targetUser.email ?? 'No email'}</p>
                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                      <span><strong>Role:</strong> {formatRole(targetUser.role)}</span>
                      <span><strong>Verification:</strong> {targetUser.verification_status ?? 'pending'}</span>
                      <span><strong>Status:</strong> {deriveVerificationStateLabel(targetUser.verification_status)}</span>
                      <span><strong>Institute:</strong> {targetUser.institute ?? 'Not available'}</span>
                      <span><strong>Department:</strong> {targetUser.department ?? 'Not available'}</span>
                      <span><strong>Mobile:</strong> {targetUser.mobile_number ?? 'Not available'}</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:min-w-72">
                    <AdminActionButton disabled={updatingUserId === targetUser.id} onClick={() => updateUser(targetUser, { verification_status: 'approved' }, 'approve_user')} className="bg-emerald-600 text-white">Approve</AdminActionButton>
                    <AdminActionButton disabled={updatingUserId === targetUser.id} onClick={() => updateUser(targetUser, { verification_status: 'rejected' }, 'reject_user')} className="bg-rose-600 text-white">Reject</AdminActionButton>
                    <AdminActionButton disabled={updatingUserId === targetUser.id} onClick={() => updateUser(targetUser, { verification_status: 'suspended' }, 'suspend_user')} className="bg-amber-600 text-white">Suspend</AdminActionButton>
                    <AdminActionButton disabled={updatingUserId === targetUser.id} onClick={() => updateUser(targetUser, { verification_status: 'approved' }, 'restore_user')} className="bg-slate-800 text-white">Restore</AdminActionButton>
                    <AdminActionButton disabled={updatingUserId === targetUser.id} onClick={() => updateUser(targetUser, { verification_status: 'approved' }, 'mark_verified')} className="border border-slate-200 bg-white text-slate-700">Verify</AdminActionButton>
                    <AdminActionButton disabled={updatingUserId === targetUser.id} onClick={() => updateUser(targetUser, { verification_status: 'pending' }, 'mark_unverified')} className="border border-slate-200 bg-white text-slate-700">Unverify</AdminActionButton>
                    <select
                      value={targetUser.role}
                      onChange={(event) => updateUser(targetUser, { role: event.target.value }, 'change_role')}
                      disabled={updatingUserId === targetUser.id}
                      className="sm:col-span-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                    >
                      {publicSignupRoles.map((roleName) => (
                        <option key={roleName} value={roleName}>{formatRole(roleName)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </PageShell>
  );
}

function AdminActionButton({ children, className, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {disabled ? 'Updating...' : children}
    </button>
  );
}

function profileDisplayValue(profile, field, fallback) {
  const value = profile?.[field];
  return value !== undefined && value !== null && `${value}`.trim() !== '' ? value : fallback;
}

function deriveVerificationStateLabel(verificationStatus) {
  const status = verificationStatus ?? 'pending';
  if (status === 'approved') return 'active';
  return status;
}

function dashboardMetricValue(profile, value) {
  if (profile?.[value] !== undefined && profile?.[value] !== null && `${profile[value]}`.trim() !== '') {
    return profile[value];
  }

  return value.endsWith('_count') ? '0' : value;
}

function ProfileFact({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-ink">{value}</p>
    </div>
  );
}

function StudentCertificatesPage({ user, profile }) {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCertificates = async () => {
      if (!supabase || !user) {
        setCertificates([]);
        setSelectedCertificate(null);
        return;
      }

      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', user.id)
        .order('issued_at', { ascending: false });
      const records = (data ?? []).map((item) => ({
        certificateId: item.certificate_id,
        slug: item.certificate_data?.slug ?? '',
        experimentName: item.experiment_name,
        experimentCategory: item.certificate_data?.experimentCategory ?? 'Not available',
        studentName: item.certificate_data?.studentName ?? profile?.full_name ?? 'Not available',
        course: item.certificate_data?.course ?? 'Not available',
        batchYear: item.certificate_data?.batchYear ?? 'Not available',
        entryNumber: item.certificate_data?.entryNumber ?? 'Not available',
        institute: item.certificate_data?.institute ?? 'Not available',
        department: item.certificate_data?.department ?? 'Not available',
        labName: item.certificate_data?.labName ?? 'Not assigned',
        teacherName: item.certificate_data?.teacherName ?? 'Not assigned',
        supervisorName: item.certificate_data?.supervisorName ?? 'Not assigned',
        attendanceStatus: item.certificate_data?.attendanceStatus ?? 'Not assigned',
        className: item.certificate_data?.className ?? 'Not assigned',
        completionDate: new Date(item.issued_at).toLocaleDateString('en-IN'),
        score: item.score,
        total: item.certificate_data?.total ?? 0,
        percentage: item.percentage,
        scoreText: `${item.percentage}%`,
        createdAt: item.issued_at,
      }));
      setCertificates(records);
      setSelectedCertificate(records[0] ?? null);
    };

    loadCertificates();
  }, [user]);

  return (
    <PageShell>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lab-700">
              Student records
            </p>
            <h2 className="mt-2 text-2xl font-bold text-ink">Certificate History</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Earned certificates appear after completing a simulation, submitting the quiz, and scoring 70% or above.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-bold text-ink">{profile?.full_name ?? user?.email ?? 'BioLabX Student'}</p>
            <p className="mt-1 font-semibold text-slate-500">Student certificate archive</p>
          </div>
        </div>
      </section>

      {certificates.length === 0 ? (
        <Panel title="No certificates yet" subtitle="Complete an eligible experiment to unlock your first certificate.">
          <button
            onClick={() => navigate('/experiments')}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            <FlaskConical size={18} />
            Explore Experiments
          </button>
        </Panel>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Earned Certificates" subtitle="Student certificate cards">
            <div className="grid gap-4">
              {certificates.map((certificate) => (
                <article
                  key={certificate.certificateId}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-bold text-ink">{certificate.experimentName}</h3>
                      <p className="mt-1 text-sm font-semibold text-lab-700">{certificate.scoreText}</p>
                    </div>
                    <Tag>{certificate.completionDate}</Tag>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p><strong className="text-ink">Teacher:</strong> {certificate.teacherName}</p>
                    <p><strong className="text-ink">Lab:</strong> {certificate.labName}</p>
                    <p><strong className="text-ink">Institute:</strong> {certificate.institute}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCertificate(certificate)}
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-lab-700 px-4 py-2 text-sm font-bold text-white"
                  >
                    <FileCheck2 size={17} />
                    View certificate
                  </button>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Certificate Preview" subtitle="Official BioLabX completion record">
            {selectedCertificate ? (
              <>
                <OfficialCertificate record={selectedCertificate} />
                <button
                  onClick={() => window.print()}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
                >
                  <Printer size={18} />
                  Print Certificate
                </button>
              </>
            ) : (
              <p className="text-sm font-semibold text-slate-600">Select a certificate to preview.</p>
            )}
          </Panel>
        </div>
      )}
    </PageShell>
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
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold">Experiment Learning Library</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dedicated learning pages with theory, protocol, simulation, assessment, and certificate flow.
          </p>
        </div>
        <div className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-500 md:w-80">
          <Search size={18} />
          <span className="text-sm">Search experiments</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {experiments.map((experiment) => {
          const Icon = getExperimentIcon(experiment);

          return (
            <article
              key={experiment.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-lab-200 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
                    <Icon size={23} />
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
              <button
                onClick={() => navigate(`/experiments/${experiment.slug}`)}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                <PlayCircle size={17} />
                Start simulation
              </button>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

function ExperimentDetailPage({ user, profile, onNavigate }) {
  const { experimentSlug } = useParams();
  const navigate = useNavigate();
  const experiment = experiments.find((item) => item.slug === experimentSlug);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  if (!experiment) {
    return (
      <PageShell>
        <Panel title="Experiment not found" subtitle="Choose an available BioLabX experiment.">
          <button
            onClick={() => navigate('/experiments')}
            className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white"
          >
            Back to Experiments
          </button>
        </Panel>
      </PageShell>
    );
  }

  const Icon = getExperimentIcon(experiment);

  return (
    <PageShell>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <button
          onClick={() => navigate('/experiments')}
          className="mb-5 text-sm font-bold text-lab-700 hover:text-lab-600"
        >
          Back to experiments
        </button>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
              <Icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-lab-700">
                {experiment.category}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-ink">{experiment.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {experiment.introduction}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag>{experiment.difficulty}</Tag>
            <Tag>{experiment.duration}</Tag>
            <Tag>{experiment.status}</Tag>
          </div>
        </div>
      </section>

      <ExperimentTextSection title="Introduction" content={experiment.introduction} />
      <ExperimentTextSection title="Objective" content={experiment.objective} />
      <ExperimentTextSection title="Principle" content={experiment.principle} />
      <ExperimentListSection title="Applications" items={experiment.applications} />
      <ExperimentListSection title="Materials Required" items={experiment.materials} />
      <ExperimentListSection title="Reagents and Quantities" items={experiment.reagents} />
      <ExperimentListSection title="Equipment Used" items={experiment.equipment} />
      <ExperimentListSection title="Safety Precautions" items={experiment.safety} />
      <ExperimentListSection title="Step-by-Step Procedure" items={experiment.procedure} ordered />
      <ExperimentListSection title="Common Mistakes" items={experiment.commonMistakes} />
      <EducationalVideo experiment={experiment} />
      <ThreeDVideoSection experiment={experiment} />
      <Interactive3DSimulation
        experiment={experiment}
        onComplete={() => setSimulationComplete(true)}
      />
      <ExperimentListSection title="Result Interpretation" items={experiment.resultInterpretation} />
      <ExperimentListSection title="Viva Questions" items={experiment.vivaQuestions} ordered />
      <McqQuiz experiment={experiment} user={user} onSubmitScore={setQuizResult} />
      <CertificateSection
        experiment={experiment}
        user={user}
        profile={profile}
        quizResult={quizResult}
        simulationComplete={simulationComplete}
        onNavigate={onNavigate}
      />
    </PageShell>
  );
}

function ExperimentTextSection({ title, content }) {
  return (
    <Panel title={title} subtitle="Core learning note">
      <p className="text-sm leading-7 text-slate-600">{content}</p>
    </Panel>
  );
}

function ExperimentListSection({ title, items, ordered = false }) {
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <Panel title={title} subtitle="Structured experiment reference">
      <ListTag className={`grid gap-3 text-sm leading-6 text-slate-600 ${ordered ? 'list-decimal pl-5' : ''}`}>
        {items.map((item) => (
          <li key={item} className={ordered ? 'pl-1' : 'flex gap-3'}>
            {!ordered && <CheckCircle2 className="mt-0.5 shrink-0 text-lab-600" size={17} />}
            <span>{item}</span>
          </li>
        ))}
      </ListTag>
    </Panel>
  );
}

function EducationalVideo({ experiment }) {
  return (
    <Panel title="Educational Video" subtitle="Lecture or protocol walkthrough area">
      {experiment.videoUrl ? (
        <div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
          <iframe
            className="h-full w-full"
            src={experiment.videoUrl}
            title={`${experiment.title} educational video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
          <div>
            <PlayCircle className="mx-auto text-lab-700" size={34} />
            <p className="mt-3 text-sm font-semibold text-ink">
              Institution-approved video will be added soon.
            </p>
          </div>
        </div>
      )}
    </Panel>
  );
}

function ThreeDVideoSection({ experiment }) {
  return (
    <Panel title="3D Video Section" subtitle="Prepared for institution-approved three-dimensional protocol walkthroughs">
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <div>
          <PlayCircle className="mx-auto text-lab-700" size={34} />
          <p className="mt-3 text-sm font-semibold text-ink">
            3D video walkthrough placeholder for {experiment.title}.
          </p>
          <p className="mt-1 text-sm text-slate-600">
            A verified 3D educational video can be connected here when the institute provides content.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function Interactive3DSimulation({ experiment, onComplete }) {
  const [checkedSafety, setCheckedSafety] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const allSafetyChecked = checkedSafety.length === experiment.safety.length;
  const canStart = allSafetyChecked;

  const toggleSafety = (item) => {
    setCheckedSafety((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item],
    );
  };

  const handleStart = () => {
    if (!canStart) {
      return;
    }

    setActiveStep(0);
    onComplete();
  };

  return (
    <Panel title="Interactive 3D Simulation" subtitle="Prepared for future Three.js or GLB model integration">
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex aspect-video items-center justify-center rounded-md border border-slate-200 bg-white text-center">
            {experiment.modelUrl ? (
              <model-viewer
                src={experiment.modelUrl}
                camera-controls
                auto-rotate
                className="h-full w-full"
                aria-label={`${experiment.title} 3D model`}
              />
            ) : (
              <div className="p-5">
                <Microscope className="mx-auto text-lab-700" size={48} />
                <p className="mt-3 text-sm font-semibold text-ink">
                  3D model is being prepared for this experiment.
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 grid gap-3 rounded-md bg-white p-4 text-sm md:grid-cols-3">
            <Control label="View" value="Rotate / zoom ready" />
            <Control label="Mode" value="Guided protocol" />
            <Control label="Status" value={canStart ? 'Ready' : 'Safety pending'} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-ink">Procedure Step Panel</h3>
            <div className="mt-3 space-y-2">
              {experiment.simulationSteps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(index)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${
                    activeStep === index ? 'bg-lab-50 text-lab-700' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  {index + 1}. {step}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-ink">Safety Checklist</h3>
            <div className="mt-3 space-y-2">
              {experiment.safety.map((item) => (
                <label key={item} className="flex cursor-pointer gap-2 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    checked={checkedSafety.includes(item)}
                    onChange={() => toggleSafety(item)}
                    className="mt-1 h-4 w-4"
                  />
                  {item}
                </label>
              ))}
            </div>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <PlayCircle size={17} />
              Start Simulation
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function McqQuiz({ experiment, user, onSubmitScore }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const answeredCount = Object.keys(answers).length;
  const score = experiment.quizQuestions.reduce(
    (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
    0,
  );
  const percentage = Math.round((score / experiment.quizQuestions.length) * 100);

  const submitQuiz = async () => {
    setSubmitted(true);
    const result = {
      score,
      total: experiment.quizQuestions.length,
      percentage,
      submittedAt: new Date().toISOString(),
    };
    onSubmitScore(result);

    if (!user || !supabase) {
      setSaveStatus(user ? '' : 'Login to save this score to your BioLabX profile.');
      return;
    }

    const { error } = await supabase.from('quiz_results').insert({
      student_id: user.id,
      score,
      total_marks: experiment.quizQuestions.length,
      attempt_number: 1,
    });

    setSaveStatus(error ? 'Score calculated, but Supabase save is not available yet.' : 'Score saved to Supabase.');
  };

  return (
    <Panel title="Knowledge Check Quiz" subtitle="Answer all questions, submit, then review explanations">
      <div className="space-y-5">
        {experiment.quizQuestions.map((item, index) => (
          <div key={item.question} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-ink">{index + 1}. {item.question}</p>
            <div className="mt-3 grid gap-2">
              {item.options.map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
                  <input
                    type="radio"
                    name={`${experiment.slug}-${index}`}
                    checked={answers[index] === option}
                    onChange={() => setAnswers((current) => ({ ...current, [index]: option }))}
                  />
                  {option}
                </label>
              ))}
            </div>
            {submitted && (
              <div className="mt-3 rounded-md bg-white p-3 text-sm leading-6">
                <p className="font-bold text-ink">Correct answer: {item.answer}</p>
                <p className="mt-1 text-slate-600">{item.explanation}</p>
              </div>
            )}
          </div>
        ))}
        <div className="rounded-lg border border-lab-100 bg-lab-50 p-4">
          <p className="text-sm font-bold text-lab-700">Score Tracking</p>
          <p className="mt-2 text-2xl font-bold text-ink">
            {score}/{experiment.quizQuestions.length} correct ({percentage}%)
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Answered {answeredCount} of {experiment.quizQuestions.length} questions.
          </p>
          <button
            onClick={submitQuiz}
            disabled={answeredCount < experiment.quizQuestions.length}
            className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Submit Quiz
          </button>
          {saveStatus && <p className="mt-3 text-sm font-semibold text-slate-600">{saveStatus}</p>}
        </div>
      </div>
    </Panel>
  );
}

function CertificateSection({ experiment, user, profile, quizResult, simulationComplete, onNavigate }) {
  const hasSubmittedQuiz = Boolean(quizResult);
  const passedQuiz = Boolean(quizResult && quizResult.percentage >= 70);
  const unlocked = Boolean(simulationComplete && hasSubmittedQuiz && passedQuiz);
  const certificateRecord = useMemo(
    () => buildCertificateRecord({ experiment, user, profile, quizResult }),
    [experiment, user, profile, quizResult],
  );

  useEffect(() => {
    if (unlocked && user) {
      saveCertificateRecord(user, certificateRecord);
      persistCertificateRecord(user, certificateRecord);
    }
  }, [certificateRecord, unlocked, user]);

  const printCertificate = () => {
    if (!unlocked) {
      return;
    }

    window.print();
  };

  const downloadCertificate = () => {
    if (!unlocked) {
      return;
    }

    if (!user) {
      onNavigate('login');
      return;
    }

    window.print();
  };

  return (
    <Panel title="Completion Certificate" subtitle="Official certificate unlocks after simulation and 70% quiz score">
      {!simulationComplete && (
        <StatusNotice type="pending" text="Complete the interactive simulation to enable certificate eligibility." />
      )}
      {simulationComplete && !hasSubmittedQuiz && (
        <StatusNotice type="pending" text="Submit the quiz to calculate your certificate eligibility." />
      )}
      {hasSubmittedQuiz && !passedQuiz && (
        <StatusNotice type="locked" text="Certificate locked. Score at least 70% to unlock." />
      )}
      {unlocked && !user && (
        <StatusNotice
          type="warning"
          text="Certificate preview is available. Login is required to download and store it in your certificate history."
        />
      )}

      <OfficialCertificate record={certificateRecord} locked={!unlocked} />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={downloadCertificate}
          disabled={!unlocked}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-lab-700 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Download size={18} />
          Download Certificate
        </button>
        <button
          onClick={printCertificate}
          disabled={!unlocked}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <Printer size={18} />
          Print Certificate
        </button>
      </div>
    </Panel>
  );
}

function StatusNotice({ type, text }) {
  const styles = {
    locked: 'border-rose-200 bg-rose-50 text-rose-800',
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    warning: 'border-lab-100 bg-lab-50 text-lab-800',
  };

  return (
    <div className={`mb-4 rounded-md border p-3 text-sm font-semibold ${styles[type] ?? styles.pending}`}>
      {text}
    </div>
  );
}

function OfficialCertificate({ record, locked = false }) {
  return (
    <div className="certificate-print rounded-lg border-2 border-lab-200 bg-white p-5 shadow-sm md:p-8">
      <div className="rounded-md border border-slate-200 p-5 md:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <AwardIcon />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-lab-700">BioLabX</p>
              <h3 className="mt-1 text-2xl font-bold text-ink md:text-3xl">
                Certificate of Virtual Laboratory Completion
              </h3>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Certificate ID</p>
            <p className="mt-1 font-mono text-sm font-bold text-ink">{record.certificateId}</p>
          </div>
        </div>

        {locked && (
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-center text-sm font-semibold text-slate-600">
            Official certificate preview remains locked until all eligibility requirements are completed.
          </div>
        )}

        <div className={`mt-6 ${locked ? 'opacity-55' : ''}`}>
          <p className="text-center text-sm leading-7 text-slate-600">
            This is to certify that the above student has successfully completed the virtual laboratory training
            module under the assigned teacher/lab through BioLabX.
          </p>
          <p className="mt-4 text-center text-3xl font-bold text-ink">{record.studentName}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <CertificateField label="Student course" value={record.course} />
            <CertificateField label="Batch year" value={record.batchYear} />
            <CertificateField label="Entry number / roll number" value={record.entryNumber} />
            <CertificateField label="Institute / University" value={record.institute} />
            <CertificateField label="Department" value={record.department} />
            <CertificateField label="Lab name" value={record.labName} />
            <CertificateField label="Teacher / instructor" value={record.teacherName} />
            <CertificateField label="Supervisor / PI" value={record.supervisorName} />
            <CertificateField label="Class / batch" value={record.className} />
            <CertificateField label="Attendance status" value={record.attendanceStatus} />
            <CertificateField label="Experiment name" value={record.experimentName} />
            <CertificateField label="Experiment category" value={record.experimentCategory} />
            <CertificateField label="Completion date" value={record.completionDate} />
            <CertificateField label="Score / percentage" value={record.scoreText} />
            <CertificateField label="Verification status" value={locked ? 'Locked' : 'Eligible'} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <CertificatePlaceholder icon={QrCode} label="Verification QR" value="QR placeholder" />
            <CertificatePlaceholder icon={FileCheck2} label="Teacher signature" value="Signature placeholder" />
            <CertificatePlaceholder icon={FileCheck2} label="Lab head / PI signature" value="Signature placeholder" />
            <CertificatePlaceholder icon={Landmark} label="Institute seal" value="Seal placeholder" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CertificateField({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function CertificatePlaceholder({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
      <Icon className="text-lab-700" size={26} />
      <p className="mt-3 text-sm font-bold text-ink">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{value}</p>
    </div>
  );
}

function buildCertificateRecord({ experiment, user, profile, quizResult }) {
  const metadata = user?.user_metadata ?? {};
  const completionDateSource = quizResult?.submittedAt ? new Date(quizResult.submittedAt) : new Date();
  const completionDate = completionDateSource.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const scoreText = quizResult
    ? `${quizResult.score}/${quizResult.total} (${quizResult.percentage}%)`
    : 'Not available';
  const userKey = user?.id?.slice(0, 8)?.toUpperCase() ?? 'GUEST';
  const dateKey = completionDateSource.toISOString().slice(0, 10).replaceAll('-', '');

  return {
    certificateId: `BLX-${experiment.slug.toUpperCase().replaceAll('-', '').slice(0, 10)}-${userKey}-${dateKey}`,
    slug: experiment.slug,
    experimentName: experiment.title,
    experimentCategory: experiment.category ?? 'Not available',
    studentName: profileValue(profile, metadata, ['full_name', 'name'], user?.email ?? 'Not available'),
    course: profileValue(profile, metadata, ['course', 'program'], 'Not available'),
    batchYear: profileValue(profile, metadata, ['batch_year', 'batchYear'], 'Not available'),
    entryNumber: profileValue(profile, metadata, ['entry_number', 'roll_number', 'rollNumber'], 'Not available'),
    institute: profileValue(profile, metadata, ['institution', 'institute', 'university'], 'Not available'),
    department: profileValue(profile, metadata, ['department'], 'Not available'),
    labName: profileValue(profile, metadata, ['lab_name', 'labName'], 'Not assigned'),
    teacherName: profileValue(profile, metadata, ['teacher_name', 'instructor_name', 'teacherName'], 'Not assigned'),
    supervisorName: profileValue(profile, metadata, ['supervisor_name', 'pi_name', 'supervisorName'], 'Not assigned'),
    attendanceStatus: profileValue(profile, metadata, ['attendance_status', 'attendanceStatus'], 'Not assigned'),
    className: profileValue(profile, metadata, ['class_name', 'batch_name', 'className'], 'Not assigned'),
    completionDate,
    score: quizResult?.score ?? 0,
    total: quizResult?.total ?? 0,
    percentage: quizResult?.percentage ?? 0,
    scoreText,
    createdAt: completionDateSource.toISOString(),
  };
}

function profileValue(profile, metadata, keys, fallbackText) {
  for (const key of keys) {
    const value = profile?.[key] ?? metadata?.[key];
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      return value;
    }
  }

  return fallbackText;
}

function certificateStorageKey(user) {
  return `biolabx-certificates-${user?.id ?? 'guest'}`;
}

function loadCertificateRecords(user) {
  if (!user || typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(certificateStorageKey(user)) ?? '[]');
  } catch {
    return [];
  }
}

function saveCertificateRecord(user, record) {
  if (!user || typeof window === 'undefined') {
    return;
  }

  const existingRecords = loadCertificateRecords(user);
  const nextRecords = [
    record,
    ...existingRecords.filter((item) => item.certificateId !== record.certificateId),
  ];
  window.localStorage.setItem(certificateStorageKey(user), JSON.stringify(nextRecords));
}

async function persistCertificateRecord(user, record) {
  if (!user || !supabase) {
    return;
  }

  await supabase.from('certificate_records').upsert(
    {
      certificate_id: record.certificateId,
      student_id: user.id,
      experiment_slug: record.slug,
      experiment_name: record.experimentName,
      experiment_category: record.experimentCategory,
      score: record.score,
      total_marks: record.total,
      percentage: record.percentage,
      student_snapshot: {
        full_name: record.studentName,
        course: record.course,
        batch_year: record.batchYear,
        entry_number: record.entryNumber,
      },
      class_snapshot: {
        class_name: record.className,
        attendance_status: record.attendanceStatus,
      },
      teacher_snapshot: {
        teacher_name: record.teacherName,
        supervisor_name: record.supervisorName,
      },
      lab_snapshot: {
        lab_name: record.labName,
      },
      institute_snapshot: {
        institute: record.institute,
        department: record.department,
      },
      completed_at: record.createdAt,
    },
    { onConflict: 'certificate_id' },
  );

  await supabase.from('certificates').upsert(
    {
      certificate_id: record.certificateId,
      student_id: user.id,
      experiment_name: record.experimentName,
      score: record.score,
      percentage: record.percentage,
      issued_at: record.createdAt,
      certificate_data: record,
    },
    { onConflict: 'certificate_id' },
  );
}

function AwardIcon() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-lab-50 text-lab-700">
      <CheckCircle2 size={30} />
    </div>
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
