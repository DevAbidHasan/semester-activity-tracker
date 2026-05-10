import PublicDocPageShell from '../components/PublicDocPageShell';
import { AboutIllustration } from '../components/DocumentIllustrations';

export default function About() {
  const p = 'mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300';
  const h2 =
    'mt-10 scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900 first:mt-0 dark:text-white';
  const ul = 'mt-3 list-disc space-y-2.5 pl-5 text-slate-600 marker:text-indigo-500 dark:text-slate-300 dark:marker:text-indigo-400';

  return (
    <PublicDocPageShell
      eyebrow="Product"
      title="About Semester Tracker"
      subtitle="One calm workspace for planning a full term—deadlines, schedules, and progress without the noise."
      illustration={AboutIllustration}
    >
      <article>
        <h2 className={h2}>Our mission</h2>
        <p className={p}>
          Academic life moves fast. Our mission is to reduce cognitive load: one workspace for courses, assignments,
          exams, schedules, notes, and progress—presented clearly on every device you actually use.
        </p>

        <h2 className={h2}>What you can do here</h2>
        <ul className={ul}>
          <li>Organize courses with credits, instructors, meeting patterns, and rooms.</li>
          <li>Track assignments with deadlines, priorities, and submission status.</li>
          <li>Plan exams and see how workload lines up across the week.</li>
          <li>Keep lecture notes searchable and categorized.</li>
          <li>Monitor semester progress and attendance in plain language.</li>
        </ul>

        <h2 className={h2}>Students and administrators</h2>
        <p className={p}>
          Students get a dedicated workspace for their own academic data. Administrators who support programs use a
          separate console for directory insight and account management—so responsibilities stay clear and appropriate.
        </p>

        <h2 className={h2}>Contact</h2>
        <p className={p}>
          For product questions, partnerships, or institutional inquiries, reach out through the contact channel your
          organization has configured for this deployment. If you are using a self-hosted instance, your administrator
          can route requests appropriately.
        </p>
      </article>
    </PublicDocPageShell>
  );
}
