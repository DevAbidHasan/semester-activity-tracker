import PublicDocPageShell from '../components/PublicDocPageShell';
import { TermsIllustration } from '../components/DocumentIllustrations';

export default function Terms() {
  const p = 'mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300';
  const h2 = 'mt-10 scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900 dark:text-white';
  const ul = 'mt-3 list-disc space-y-2.5 pl-5 text-slate-600 marker:text-fuchsia-600 dark:text-slate-300 dark:marker:text-fuchsia-400';

  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <PublicDocPageShell
      eyebrow="Legal"
      title="Terms of Service"
      subtitle={
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated: {updated}</span>
      }
      illustration={TermsIllustration}
    >
      <article>
        <p className={`${p} mt-0`}>
          These Terms of Service (“Terms”) govern your access to and use of Semester Tracker (the “Services”). By
          creating an account or using the Services, you agree to these Terms. If you do not agree, do not use the
          Services.
        </p>

        <h2 className={h2}>1. Eligibility</h2>
        <p className={p}>
          You must be able to form a binding contract in your jurisdiction and meet any minimum age requirements that
          apply. If you use the Services on behalf of an organization, you represent that you have authority to bind that
          organization.
        </p>

        <h2 className={h2}>2. Accounts and security</h2>
        <p className={p}>
          You are responsible for maintaining the confidentiality of your credentials and for activity under your
          account. Notify us or your administrator promptly if you suspect unauthorized access. We may suspend or disable
          accounts that violate these Terms or pose a security risk.
        </p>

        <h2 className={h2}>3. Acceptable use</h2>
        <p className={p}>You agree not to:</p>
        <ul className={ul}>
          <li>Use the Services in violation of law or third-party rights.</li>
          <li>Attempt to gain unauthorized access to systems, data, or accounts.</li>
          <li>Introduce malware, overload infrastructure, or interfere with other users.</li>
          <li>Scrape, resell, or redistribute the Services except as expressly permitted.</li>
          <li>Misrepresent your identity or affiliation.</li>
        </ul>

        <h2 className={h2}>4. Your content</h2>
        <p className={p}>
          You retain ownership of academic and personal content you submit. You grant us a limited license to host,
          process, back up, and display that content solely to operate and improve the Services for you. You are
          responsible for the accuracy and legality of what you upload.
        </p>

        <h2 className={h2}>5. Administrative features</h2>
        <p className={p}>
          Where enabled, administrators may access certain account or usage information to support their organization.
          Use of administrative tools should comply with institutional policy and applicable law.
        </p>

        <h2 className={h2}>6. Changes and availability</h2>
        <p className={p}>
          We may modify, suspend, or discontinue features with reasonable notice where practicable. The Services are
          provided on an “as available” basis; we do not guarantee uninterrupted or error-free operation.
        </p>

        <h2 className={h2}>7. Disclaimers</h2>
        <p className={p}>
          To the fullest extent permitted by law, the Services are provided “as is” without warranties of any kind,
          whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
          Academic estimates shown in the product are informational only and are not official grade or GPA calculations
          unless your institution says otherwise.
        </p>

        <h2 className={h2}>8. Limitation of liability</h2>
        <p className={p}>
          To the maximum extent permitted by law, we and our suppliers will not be liable for any indirect, incidental,
          special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising from your use
          of the Services. Our aggregate liability for direct damages is limited to the greater of amounts you paid us
          for the Services in the twelve months before the claim or fifty dollars (USD), unless mandatory law provides
          otherwise.
        </p>

        <h2 className={h2}>9. Indemnity</h2>
        <p className={p}>
          You will defend and indemnify us against claims arising from your content, your misuse of the Services, or
          your violation of these Terms, subject to our right to control the defense of matters implicating our broader
          liability.
        </p>

        <h2 className={h2}>10. Termination</h2>
        <p className={p}>
          You may stop using the Services at any time. We may suspend or terminate access for breach of these Terms or
          for operational reasons with notice where reasonable. Provisions that by their nature should survive will
          survive termination.
        </p>

        <h2 className={h2}>11. Governing law</h2>
        <p className={p}>
          Unless your organization’s agreement with us specifies otherwise, these Terms are governed by the laws of the
          jurisdiction stated in your master agreement, or if none is stated, the laws applicable where the Services
          provider is established, without regard to conflict-of-law rules.
        </p>

        <h2 className={h2}>12. Changes to these Terms</h2>
        <p className={p}>
          We may update these Terms from time to time. We will post the updated version and revise the “Last updated”
          date. Continued use after changes become effective constitutes acceptance unless applicable law requires
          additional steps.
        </p>

        <h2 className={h2}>13. Contact</h2>
        <p className={p}>
          For questions about these Terms, contact the administrator for your deployment or the legal contact your
          institution has designated.
        </p>
      </article>
    </PublicDocPageShell>
  );
}
