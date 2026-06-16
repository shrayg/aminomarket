import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm uppercase tracking-wider text-ink-400">
        Effective for all users of aminomarket.shop
      </p>

      <p className="mt-8 rounded-xl border-l-2 border-accent-dark bg-accent-light/20 p-4 text-sm leading-relaxed text-ink-800">
        <strong>Storefront status.</strong> Amino Market is currently a
        research catalog only and is <strong>not accepting orders</strong>.
        The checkout, payment, and shipping flows are disabled. The Terms
        below apply to your use of the catalog, account creation, and
        support communications.
      </p>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          1. Acceptance of these terms
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          &ldquo;Amino Market&rdquo;, &ldquo;the site&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer
          to the operator of aminomarket.shop. By accessing
          aminomarket.shop, completing the age and research-use gate, or
          creating an account, you (the &ldquo;Researcher&rdquo;,
          &ldquo;you&rdquo;) agree to these Terms. If you do not agree,
          do not use the site.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          2. Research-Use-Only positioning
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Every product depicted on aminomarket.shop is presented as a
          research chemical for <strong>in-vitro laboratory research
          only</strong>. Nothing on this site is offered for human or
          animal consumption, for therapeutic use, as a dietary
          supplement, as a cosmetic, or as a medical device.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            You are at least <strong>21 years of age</strong> and have the
            legal authority to enter this agreement.
          </li>
          <li>
            You will treat any catalog content as informational research
            material only and will not rely on it for medical, dosing,
            reconstitution, or therapeutic decisions.
          </li>
          <li>
            You will comply with all applicable federal, state, local, and
            international laws and regulations governing research
            chemicals in your jurisdiction.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          The age-and-research-use gate that appears when you first enter
          the site is your written acknowledgment of every representation
          in this section.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          3. No medical claims, no medical advice
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          No statement on this site is intended as medical, veterinary,
          clinical, or therapeutic advice. The materials referenced in
          the catalog are <strong>not drugs, dietary supplements, food,
          cosmetics, or medical devices</strong>. They have not been
          evaluated by the U.S. Food and Drug Administration and are not
          intended to diagnose, treat, cure, or prevent any disease in
          humans or animals. We are <strong>not</strong> a compounding
          pharmacy under FDCA &sect;503A and <strong>not</strong> an
          outsourcing facility under &sect;503B.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          4. No sales, no payment processing
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          The site does not currently accept orders or process payments.
          Add-to-cart, checkout, payment, and shipping features are
          disabled. No purchase contract is being formed by your use of
          the catalog. If and when ordering is re-enabled, an updated
          version of these Terms will describe the order, payment,
          shipping, and refund process at that time.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          5. Accounts, security, and communications
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account. Notify us immediately at{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>{' '}
          of any unauthorized use. Transactional messages (account
          security, support replies) may be sent to the email associated
          with your account while your account is active.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          6. Disclaimer &amp; limitation of liability
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          The site and all catalog content are provided on an
          &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis with
          no warranty of any kind, express or implied. To the maximum
          extent permitted by law, we are not liable for any indirect,
          incidental, consequential, special, exemplary, or punitive
          damages arising out of your use of the site, even if we have
          been advised of the possibility of such damages.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          7. Intellectual property
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          All site content, branding, photography, copy, and the
          &ldquo;Amino Market&rdquo; mark are reserved by the site
          operator and may not be copied, reproduced, scraped, or used
          commercially without prior written permission.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          8. Changes to these terms
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We may update these Terms from time to time. The version posted
          on this page at the time you visit the site is the version that
          applies to your use of the site.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          9. Contact
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Questions about these Terms can be sent to{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>
          .
        </p>
      </section>

      <p className="mt-12 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500">
        Last updated{' '}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. See also our{' '}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-ink-700">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
