import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Beaker,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  Home,
  Menu,
  Microscope,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TestTube2,
  Users,
  X,
} from 'lucide-react';

const pages = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'student', label: 'Student Dashboard', icon: GraduationCap },
  { id: 'experiments', label: 'Experiments', icon: FlaskConical },
  { id: 'gel', label: 'Gel Simulator', icon: Activity },
  { id: 'teacher', label: 'Teacher Dashboard', icon: ClipboardList },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
];

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

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ActiveIcon = pages.find((page) => page.id === activePage)?.icon ?? Home;

  const pageTitle = useMemo(
    () => pages.find((page) => page.id === activePage)?.label ?? 'Home',
    [activePage],
  );

  const goToPage = (pageId) => {
    setActivePage(pageId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <Navbar
        activePage={activePage}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
        onNavigate={goToPage}
      />
      <main>
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

        {activePage === 'home' && <HomePage onNavigate={goToPage} />}
        {activePage === 'student' && <StudentDashboard />}
        {activePage === 'experiments' && <ExperimentsPage />}
        {activePage === 'gel' && <GelSimulator />}
        {activePage === 'teacher' && <TeacherDashboard />}
        {activePage === 'inventory' && <InventoryPage />}
      </main>
    </div>
  );
}

function Navbar({ activePage, isMenuOpen, onMenuToggle, onNavigate }) {
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
            <span className="text-xs font-medium text-slate-500">Virtual biotech lab</span>
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
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-ink lg:hidden"
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
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({ onNavigate }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="py-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lab-100 bg-white px-3 py-1 text-sm font-semibold text-lab-700 shadow-sm">
            <Sparkles size={16} />
            AI-guided biotechnology practice
          </div>
          <h2 className="max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            A virtual lab where students learn biotechnology through guided simulation.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            BioLabX combines academic workflows, simulated lab equipment, and AI feedback to
            help learners practice experiments before entering a physical lab.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => onNavigate('student')}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-lab-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-lab-600"
            >
              Open Student Dashboard
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('experiments')}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-lab-200 hover:bg-lab-50"
            >
              Browse Experiments
              <BookOpenCheck size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Live lab session
                </p>
                <h3 className="mt-1 text-lg font-bold">PCR Amplification Run</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Active
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Accuracy" value="94%" />
              <Metric label="Samples" value="12" />
              <Metric label="AI flags" value="2" />
            </div>
            <div className="mt-5 space-y-3">
              {['Prepare master mix', 'Load virtual thermocycler', 'Review amplification curve'].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-medium text-slate-700"
                  >
                    <CheckCircle2
                      size={18}
                      className={index < 2 ? 'text-lab-600' : 'text-slate-300'}
                    />
                    {step}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon={BrainCircuit}
          title="AI lab mentor"
          text="Contextual hints, safety prompts, and experiment feedback for each learner."
        />
        <FeatureCard
          icon={TestTube2}
          title="Realistic simulations"
          text="Practice PCR, transformation, electrophoresis, assays, and analysis workflows."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Academic oversight"
          text="Teachers can monitor progress, identify gaps, and assign focused modules."
        />
      </div>
    </section>
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

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-lab-50 text-lab-700">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
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
