import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm uppercase tracking-wider text-ink-400">
        How Amino Market handles the data you provide
      </p>

      <p className="mt-8 rounded-xl border-l-2 border-accent-dark bg-accent-light/20 p-4 text-sm leading-relaxed text-ink-800">
        <strong>Storefront status.</strong> Amino Market is currently a
        research catalog only and is <strong>not accepting orders</strong>.
        The checkout, payment, and shipping flows are disabled. The
        sections below describe how account, contact, and analytics data
        are handled while the catalog is open.
      </p>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Who we are
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          &ldquo;Amino Market&rdquo; refers to the operator of
          aminomarket.shop. Privacy questions and data requests can be
          sent to{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          What we collect
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We collect only what is needed to operate the catalog and respond
          to support requests:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            <strong>Account data</strong> &mdash; the username, email, and
            hashed password you provide when creating an account.
            Passwords are stored salted and hashed; we never see your
            plain-text password.
          </li>
          <li>
            <strong>Support messages</strong> &mdash; the content of any
            message you send through the contact form, email, Telegram, or
            Discord.
          </li>
          <li>
            <strong>First-party usage data</strong> &mdash; pages visited,
            session duration, and product views, used to understand
            catalog interest and to fix navigation problems. We do not
            share this with advertising networks.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          Because the storefront is not currently accepting orders, we are
          not collecting shipping addresses, billing addresses, payment
          information, or order history at this time.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Cookies and similar technologies
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We use a minimal set of <strong>essential cookies and
          browser-storage values</strong> that are required for the site to
          function: a session token when you are logged in, and a small
          analytics identifier used for first-party catalog metrics. We do
          <strong> not</strong> set advertising cookies, retargeting
          pixels, or third-party tracking pixels (Meta / TikTok / Google
          Ads / etc.).
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          How we use your data
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>To create and authenticate your account.</li>
          <li>To respond to support and account requests.</li>
          <li>To improve the catalog based on aggregate usage patterns.</li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          We do <strong>not</strong> sell your personal information and we
          do not share it with advertising networks. We do not engage in
          targeted advertising as those terms are defined under state
          consumer-privacy laws.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Who we share it with (sub-processors)
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We share the minimum data necessary with the service providers
          that operate the catalog on our behalf:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            <strong>Vercel</strong> &mdash; hosting and edge delivery of
            the catalog.
          </li>
          <li>
            <strong>Supabase</strong> &mdash; database for account and
            operational data.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          We also disclose data when required by law, in response to a
          valid subpoena, court order, or government request, or when
          necessary to protect the rights, safety, or property of the
          site, our users, or the public.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Where your data is stored
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Account and operational data are stored in private databases
          that we control. All data is stored in the United States.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Retention
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Account data is retained for as long as the account remains
          active. Support messages are retained for 24 months unless
          deletion is requested earlier. Usage data is retained on a
          rolling 13-month basis.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Your choices and rights
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            <strong>Access &amp; deletion.</strong> Email{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>{' '}
            from your account email to request a copy of, correction of,
            or deletion of the data we hold on you. We will respond
            within 30 days.
          </li>
          <li>
            <strong>Account closure.</strong> Email us with your account
            email and we will close your account and delete its data.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Age requirement
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          The site is restricted to users <strong>21 years of age or
          older</strong>. We do not knowingly collect data from anyone
          under 21. If you believe a minor has provided data through the
          site, contact us and we will delete it.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Changes to this policy
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We may update this policy from time to time. The version posted
          here at the time you visit the site is the version that applies.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Contact
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          For any privacy question or data request, email{' '}
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
        See also our{' '}
        <Link to="/terms" className="underline underline-offset-2 hover:text-ink-700">
          Terms of Service
        </Link>
        . Last updated{' '}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
      </p>
    </div>
  )
}
