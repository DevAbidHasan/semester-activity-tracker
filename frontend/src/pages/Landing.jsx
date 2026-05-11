import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderActionsRight, { HeaderThemeToggle } from '../components/HeaderActionsRight';
import HeroIllustrations from '../components/HeroIllustrations';
import SiteFooterLegal from '../components/SiteFooterLegal';
import { useAuth } from '../context/AuthContext';
import { useHtmlDarkClass } from '../hooks/useHtmlDarkClass';
import {
  FiArrowRight,
  FiBarChart2,
  FiBook,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClipboard,
  FiEdit3,
  FiHelpCircle,
  FiLayers,
  FiLayout,
  FiLock,
  FiLogOut,
  FiMenu,
  FiMonitor,
  FiShield,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
  FiX,
  FiZap,
} from 'react-icons/fi';

const stats = [
  { value: '8+', label: 'Workflow areas', sub: 'From courses to attendance' },
  { value: '24/7', label: 'Always on', sub: 'Access whenever you study' },
  { value: '100%', label: 'Responsive', sub: 'Phone to ultrawide' },
  { value: '1', label: 'Unified hub', sub: 'Courses through attendance in one place' },
];

const howItWorksSteps = [
  {
    step: 1,
    title: 'Create your space',
    desc: 'Register or sign in. Your courses, deadlines, and notes stay private to your account.',
    icon: FiUserPlus,
  },
  {
    step: 2,
    title: 'Shape the term',
    desc: 'Add courses with credits and schedule details. Set your current semester so progress and timelines line up.',
    icon: FiBook,
  },
  {
    step: 3,
    title: 'Capture the workload',
    desc: 'Log assignments, exams, weekly blocks, and searchable notes—everything feeds the same dashboard.',
    icon: FiClipboard,
  },
  {
    step: 4,
    title: 'Check in anytime',
    desc: 'Use the dashboard and semester tools to see what is next, log attendance, and adjust as the term evolves.',
    icon: FiLayout,
  },
];

const featureCards = [
  {
    icon: FiBook,
    title: 'Course hub',
    desc: 'Credits, instructors, rooms, colors, and semester links in one structured place.',
  },
  {
    icon: FiClipboard,
    title: 'Assignment pipeline',
    desc: 'Deadlines, priorities, submission status, and marks—filter and sort without spreadsheet chaos.',
  },
  {
    icon: FiCalendar,
    title: 'Weekly schedule',
    desc: 'Build a real timetable with duration, room, and teacher—mirrored in a clean week view.',
  },
  {
    icon: FiTrendingUp,
    title: 'Exams & marks',
    desc: 'Record exam types, dates, and marks so you can decide next steps—no computed GPA in the app.',
  },
  {
    icon: FiEdit3,
    title: 'Searchable notes',
    desc: 'Capture lecture snippets and study plans with categories so nothing gets lost.',
  },
  {
    icon: FiBarChart2,
    title: 'Semester analytics',
    desc: 'Progress, attendance rollups, and charts tuned for clarity at a glance.',
  },
];

const platformStats = [
  { icon: FiLayers, value: '8', label: 'Connected areas', hint: 'One flow from courses to attendance' },
  { icon: FiUsers, value: '2', label: 'Clear roles', hint: 'Separate student and administrator experiences' },
  { icon: FiZap, value: '<100ms', label: 'Snappy UI', hint: 'Interactions that feel instant' },
  { icon: FiLock, value: 'High', label: 'Account safety', hint: 'Passwords protected using established best practices' },
];

const faqItems = [
  {
    q: 'Is Semester Tracker free to try?',
    a: 'Yes. Create an account and explore the full student workspace. There is no paywall for getting organized.',
  },
  {
    q: 'How are student and admin areas different?',
    a: 'Students get the full academic toolkit—courses, assignments, exams, schedule, notes, and trackers. Administrators use a dedicated console for analytics and account oversight, kept separate from the student experience.',
  },
  {
    q: 'Can institutions or teams use it?',
    a: 'The product is designed so each user owns their semester data. Contact us if you need organization-wide rollout or custom onboarding.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The interface uses responsive layouts, a drawer-style menu on small screens, and touch-friendly controls so you can check deadlines between classes.',
  },
  {
    q: 'What happens to my data?',
    a: 'Your academic records stay tied to your account. You control courses, assignments, and notes from one secure workspace.',
  },
];

const footerLinks = {
  product: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Highlights', href: '#stats' },
    { label: 'FAQ', href: '#faq' },
    { label: 'About', to: '/about' },
  ],
  account: [
    { label: 'Log in', to: '/login' },
    { label: 'Register', to: '/register' },
  ],
};

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
      ST
    </span>
  );
}

const mobileNavLink =
  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10';

export default function Landing() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const dashboardHref = isAdmin ? '/admin' : '/student';

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const isDark = useHtmlDarkClass();
  const appearance = isDark ? 'onDark' : 'onLight';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2.5 md:flex-none" onClick={closeMobileMenu}>
            <LogoMark />
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                Semester Tracker
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#features" className="transition hover:text-slate-900 dark:hover:text-white">
              Features
            </a>
            <a href="#stats" className="transition hover:text-slate-900 dark:hover:text-white">
              Highlights
            </a>
            <a href="#faq" className="transition hover:text-slate-900 dark:hover:text-white">
              FAQ
            </a>
            <Link to="/about" className="transition hover:text-slate-900 dark:hover:text-white">
              About
            </Link>
          </nav>
          <div className="hidden shrink-0 md:flex">
            <HeaderActionsRight
              appearance={appearance}
              guestSlot={
                !isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:px-4 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:px-4 dark:bg-white dark:text-indigo-950 dark:shadow-indigo-500/25 dark:hover:bg-indigo-50"
                    >
                      Get started
                    </Link>
                  </>
                ) : null
              }
            />
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <HeaderThemeToggle appearance={appearance} />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 dark:focus-visible:outline-white/60"
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <FiX className="h-5 w-5" aria-hidden /> : <FiMenu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 md:hidden"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        />
      ) : null}

      <div
        id="landing-mobile-menu"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col border-l border-slate-200 bg-white shadow-2xl backdrop-blur-xl transition-transform duration-200 ease-out dark:border-white/10 dark:bg-slate-950/98 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-white/10">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Menu</span>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <a href="#features" className={mobileNavLink} onClick={closeMobileMenu}>
            Features
          </a>
          <a href="#stats" className={mobileNavLink} onClick={closeMobileMenu}>
            Highlights
          </a>
          <a href="#faq" className={mobileNavLink} onClick={closeMobileMenu}>
            FAQ
          </a>
          <Link to="/about" className={mobileNavLink} onClick={closeMobileMenu}>
            About
          </Link>
          <div className="my-3 border-t border-slate-200 dark:border-white/10" />
          {isAuthenticated ? (
            <>
              <Link to={dashboardHref} className={mobileNavLink} onClick={closeMobileMenu}>
                <FiLayout className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                Dashboard
              </Link>
              <button
                type="button"
                className={`${mobileNavLink} w-full text-left text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200`}
                onClick={() => {
                  logout();
                  closeMobileMenu();
                  navigate('/login');
                }}
              >
                <FiLogOut className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={mobileNavLink}
                onClick={closeMobileMenu}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-semibold text-indigo-950 shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-50"
                onClick={closeMobileMenu}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>

      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/25" />
          <div className="absolute -right-20 top-1/3 h-[420px] w-[420px] rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/20" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl dark:bg-fuchsia-500/15" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
          <HeroIllustrations />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-indigo-200">
              <FiZap className="h-3.5 w-3.5" />
              Built for serious semesters
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              One calm workspace for{' '}
              <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-200 dark:via-white dark:to-violet-200">
                courses, deadlines & exams
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Replace scattered notes and spreadsheets with a polished dashboard, secure sign-in, and separate
              experiences for students and administrators—without losing the feel of a modern productivity suite.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500 dark:bg-white dark:text-indigo-950 dark:shadow-indigo-950/50 dark:hover:bg-indigo-50"
              >
                Start free
                <FiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-16 max-w-5xl">
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.25rem] bg-size-[2.25rem_2.25rem] bg-[linear-gradient(to_right,rgb(99_102_241/0.11)_1px,transparent_1px),linear-gradient(to_bottom,rgb(99_102_241/0.11)_1px,transparent_1px)] opacity-[0.55] mask-[radial-gradient(ellipse_72%_88%_at_50%_45%,black_18%,transparent_68%)] sm:-inset-8 dark:bg-[linear-gradient(to_right,rgb(165_180_252/0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgb(165_180_252/0.14)_1px,transparent_1px)] dark:opacity-[0.4]"
              aria-hidden
            />
            <div className="relative rounded-2xl border border-slate-200/90 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/30 sm:p-10">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-200">
                Designed for focus
              </p>
              <h2 className="mt-3 text-center text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
                Everything you need for the term—without the noise
              </h2>
              <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
                <div className="text-center sm:text-left">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 sm:mx-0 dark:bg-indigo-500/20 dark:text-indigo-200">
                    <FiLayers className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">One connected workspace</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Courses, assignments, exams, schedule blocks, and notes stay linked—so you always see how work
                    lines up across the week.
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 sm:mx-0 dark:bg-violet-500/20 dark:text-violet-200">
                    <FiShield className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Clear roles</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Students stay in their academic hub; administrators use a separate console for oversight—so
                    responsibilities stay obvious and appropriate.
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 sm:mx-0 dark:bg-fuchsia-500/20 dark:text-fuchsia-200">
                    <FiMonitor className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Comfort for long study sessions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Spacing, typography, and breakpoints tuned for phones and laptops—the kind of polish you notice at
                    midnight before a deadline. Switch appearance anytime from the header.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="stats"
        className="scroll-mt-20 border-b border-slate-200/80 bg-slate-100/90 py-12 dark:border-white/5 dark:bg-slate-900/50 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{s.value}</p>
                <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-200">{s.label}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 relative overflow-hidden border-b border-slate-200/80 bg-linear-to-b from-slate-50 via-white to-slate-50/80 py-16 text-slate-900 dark:border-white/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:py-20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2] bg-size-[2rem_2rem] bg-[linear-gradient(to_right,rgb(99_102_241/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(99_102_241/0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgb(129_140_252/0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(129_140_252/0.08)_1px,transparent_1px)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              From empty account to a semester you can actually steer
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Four straightforward steps—same calm visual language as the rest of the app, on any screen size.
            </p>
          </div>

          <div className="relative mt-14 lg:mt-16">
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-9 hidden h-px bg-linear-to-r from-transparent via-indigo-300 to-transparent lg:block dark:via-indigo-500/50"
              aria-hidden
            />
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {howItWorksSteps.map((item) => (
                <li key={item.step} className="relative">
                  <div className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-md shadow-slate-200/40 ring-1 ring-slate-100/80 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200/90 hover:shadow-lg hover:shadow-indigo-100/60 dark:border-white/10 dark:bg-white/4 dark:shadow-black/30 dark:ring-white/5 dark:hover:border-indigo-500/35 dark:hover:shadow-indigo-950/40">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                        <item.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="flex h-8 min-w-8 items-center justify-center rounded-full border border-indigo-200/80 bg-indigo-50 text-xs font-bold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/80 dark:text-indigo-200">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 sm:w-auto dark:bg-white dark:text-indigo-950 dark:shadow-indigo-950/40 dark:hover:bg-indigo-50"
            >
              Start in minutes
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white/90 px-8 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-20 bg-white py-16 text-slate-900 dark:bg-slate-900 dark:text-slate-100 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl dark:text-white">
              Everything you track in a semester—wired together
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Each module feeds the dashboard: fewer context switches, clearer priorities, and a UI that still looks
              good at 11pm before a deadline.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-sm shadow-slate-200/50 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/80 dark:border-slate-700/80 dark:bg-slate-800/60 dark:shadow-black/20 dark:hover:border-indigo-500/40 dark:hover:shadow-indigo-950/30"
              >
                <span className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/50 dark:text-indigo-300">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50 to-violet-50 px-6 py-8 dark:border-indigo-500/20 dark:from-indigo-950/40 dark:to-violet-950/30 sm:flex-row sm:px-10 lg:px-12">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                <FiShield className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Administration, separate from students</h3>
                <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
                  Administrators get analytics, directory search, and account tools in a dedicated console—never mixed
                  into the student workspace.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
            >
              Create account
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-slate-100 py-16 dark:border-white/5 dark:bg-slate-950 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-300">
                Quality bar
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Built for reliability and speed
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Thoughtful validation, efficient data loading, and an interface tuned for real daily use—not just a
                demo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                <FiMonitor className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />
                Phone to ultrawide
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                <FiCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Encrypted sign-in
              </span>
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platformStats.map((p) => (
              <div
                key={p.label}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur-sm dark:hover:border-indigo-500/30 dark:hover:bg-white/[0.06]"
              >
                <p.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <p className="mt-4 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{p.value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{p.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-500">{p.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-indigo-500 via-violet-600 to-fuchsia-700 dark:from-indigo-600 dark:via-violet-700 dark:to-fuchsia-800" />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-60" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to own your semester?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-indigo-100/90 sm:text-lg">
            Create your workspace in minutes. Invite your study group, sync your deadlines, and keep one source of
            truth for the entire term.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-900 shadow-xl transition hover:bg-indigo-50 sm:w-auto"
            >
              Create your workspace
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#faq"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
            >
              Read FAQ first
            </a>
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="scroll-mt-20 border-t border-slate-200/80 bg-slate-50 py-16 dark:border-white/5 dark:bg-slate-900 sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Common questions
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Straight answers—no marketing fluff.</p>
          </div>
          <div className="mt-12 space-y-3">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white transition open:border-indigo-300 open:bg-indigo-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:open:border-indigo-500/30 dark:open:bg-white/[0.05]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-slate-900 marker:hidden [&::-webkit-details-marker]:hidden dark:text-white">
                  <span className="flex items-start gap-3">
                    <FiHelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    {item.q}
                  </span>
                  <FiChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180 dark:text-slate-400" />
                </summary>
                <div className="border-t border-slate-200 px-5 pb-5 pt-0 pl-13 pr-5 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-400">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-slate-50 py-16 dark:border-white/5 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-white">
              Ship your semester with confidence.
            </h2>
            <p className="mt-2 max-w-lg text-slate-600 dark:text-slate-400">
              Students work in their own dashboard; administrators use a separate console—same product, clear
              boundaries.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 dark:bg-indigo-500 dark:shadow-indigo-500/30 dark:hover:bg-indigo-400"
            >
              Get started free
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white py-14 text-sm dark:border-white/10 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <LogoMark />
                <span className="font-semibold text-slate-900 dark:text-white">Semester Tracker</span>
              </Link>
              <p className="mt-4 max-w-xs leading-relaxed text-slate-600 dark:text-slate-500">
                The academic workspace for students and administrators who want clarity, not clutter.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Product</p>
              <ul className="mt-4 space-y-2.5 text-slate-600 dark:text-slate-400">
                {footerLinks.product.map((l) => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link
                        to={l.to}
                        className="transition hover:text-indigo-600 dark:hover:text-white"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className="transition hover:text-indigo-600 dark:hover:text-white">
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Account</p>
              <ul className="mt-4 space-y-2.5 text-slate-600 dark:text-slate-400">
                {footerLinks.account.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="transition hover:text-indigo-600 dark:hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-slate-200 pt-8 dark:border-white/10 sm:flex-row">
            <p className="text-center text-xs text-slate-500 sm:text-left dark:text-slate-600">
              © {new Date().getFullYear()} Semester Tracker. All rights reserved.
            </p>
            <SiteFooterLegal variant="adaptive" />
          </div>
        </div>
      </footer>
    </div>
  );
}
