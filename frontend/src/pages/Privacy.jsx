import PublicDocPageShell from '../components/PublicDocPageShell';
import { PrivacyIllustration } from '../components/DocumentIllustrations';

export default function Privacy() {
  const p = 'mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300';
  const h2 = 'mt-10 scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900 dark:text-white';
  const ul = 'mt-3 list-disc space-y-2.5 pl-5 text-slate-600 marker:text-emerald-600 dark:text-slate-300 dark:marker:text-emerald-400';
  const strong = 'font-semibold text-slate-800 dark:text-slate-200';

  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PublicDocPageShell
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle={
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {updated}</span>
      }
      illustration={PrivacyIllustration}
    >
      <article>
        <p className={`${p} mt-0`}>
          Semester Tracker (“we”, “us”, or “our”) respects your privacy. This policy describes how we collect, use,
          store, and protect information when you use our website and related services (the “Services”).
        </p>

        <h2 className={h2}>1. Who this applies to</h2>
        <p className={p}>
          This policy applies to visitors of our marketing pages, registered users (including students), and
          administrators who access management features. If your school or employer operates the Services for you,
          they may have additional policies that also apply.
        </p>

        <h2 className={h2}>2. Information we collect</h2>
        <p className={p}>We may collect the following categories of information:</p>
        <ul className={ul}>
          <li>
            <span className={strong}>Account data:</span> such as name, email address, role, and credentials you provide
            when you register or sign in.
          </li>
          <li>
            <span className={strong}>Academic content you enter:</span> courses, assignments, exams, schedules, notes,
            attendance, and similar records you choose to store in the product.
          </li>
          <li>
            <span className={strong}>Technical and usage data:</span> such as browser type, device type, approximate
            location derived from IP, timestamps, and diagnostic information needed to operate and secure the Services.
          </li>
        </ul>

        <h2 className={h2}>3. How we use information</h2>
        <p className={p}>We use information to:</p>
        <ul className={ul}>
          <li>Create and maintain your account and authenticate you.</li>
          <li>Provide, personalize, and improve the features you interact with.</li>
          <li>Communicate service-related notices and respond to support requests.</li>
          <li>Monitor abuse, fraud, and security incidents.</li>
          <li>Comply with law and enforce our terms.</li>
        </ul>

        <h2 className={h2}>4. Legal bases (where required)</h2>
        <p className={p}>
          Depending on your region, we may rely on consent, performance of a contract, legitimate interests (such as
          securing the Services), or legal obligation as the basis for processing. You may withdraw consent where
          processing is consent-based, subject to limitations needed to provide the Services.
        </p>

        <h2 className={h2}>5. Sharing of information</h2>
        <p className={p}>
          We do not sell your personal information. We may share information with service providers who assist us (for
          example, hosting or email delivery) under confidentiality obligations, when required by law, or in connection
          with a merger or acquisition subject to safeguards.
        </p>

        <h2 className={h2}>6. Retention</h2>
        <p className={p}>
          We retain information for as long as your account is active and as needed to provide the Services, comply with
          legal obligations, resolve disputes, and enforce our agreements. You may request deletion of your account
          where applicable law allows.
        </p>

        <h2 className={h2}>7. Security</h2>
        <p className={p}>
          We implement administrative, technical, and organizational measures designed to protect information. No method
          of transmission or storage is completely secure; we encourage strong passwords and careful sharing of access.
        </p>

        <h2 className={h2}>8. Your choices and rights</h2>
        <p className={p}>
          Depending on where you live, you may have rights to access, correct, delete, or export certain information, or
          to object to or restrict certain processing. Contact us using the details your deployment provides to exercise
          these rights. We may need to verify your identity before responding.
        </p>

        <h2 className={h2}>9. Children</h2>
        <p className={p}>
          The Services are not directed to children under the age where parental consent is required in your
          jurisdiction. If you believe we have collected such information, please contact us so we can delete it.
        </p>

        <h2 className={h2}>10. International transfers</h2>
        <p className={p}>
          If you access the Services from outside the country where data is processed, your information may be
          transferred across borders. We take steps designed to ensure appropriate safeguards where required by law.
        </p>

        <h2 className={h2}>11. Changes to this policy</h2>
        <p className={p}>
          We may update this policy from time to time. We will post the revised version and update the “Last updated”
          date. Material changes may be communicated through the Services or by email where appropriate.
        </p>

        <h2 className={h2}>12. Contact</h2>
        <p className={p}>
          For privacy questions, contact the administrator responsible for your Semester Tracker deployment, or the
          privacy contact published by your institution if the Services are operated on your behalf.
        </p>
      </article>
    </PublicDocPageShell>
  );
}
