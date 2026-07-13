import { Link } from 'react-router-dom'

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm uppercase tracking-wider text-ink-400">
        How Strand Labs handles the data you provide
      </p>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Who we are
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Personal information collected through Strand Labs is
          handled by the operator of &ldquo;Strand Labs.&rdquo; Privacy
          questions and data requests can be sent to{' '}
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
          We collect only what is needed to operate the storefront, fulfill
          orders, and respond to support requests:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            <strong>Account data</strong> &mdash; the username, email, and
            hashed password you provide when creating an account.
            Passwords are stored salted and hashed; we never see your
            plain-text password.
          </li>
          <li>
            <strong>Order &amp; shipping data</strong> &mdash; recipient
            name, shipping address, billing address, email, and order
            history. Required to fulfill and deliver your order.
          </li>
          <li>
            <strong>Payment data</strong> &mdash; collected and processed
            by Stripe at checkout. We <strong>do not store full card
            numbers or card security codes</strong> on our infrastructure.
          </li>
          <li>
            <strong>Marketing preferences</strong> &mdash; whether you
            opted in to receive email and/or SMS marketing about discounts,
            promotions, and product launches at the time you created your
            account.
          </li>
          <li>
            <strong>Support messages</strong> &mdash; the content of any
            message you send through the contact form, email, Telegram, or
            Discord.
          </li>
          <li>
            <strong>First-party usage data</strong> &mdash; pages visited,
            session duration, product views, cart activity, and checkout
            progression, used to understand catalog demand and to fix
            navigation problems. We do not share this with advertising
            networks.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Marketing communications
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          When you create an account you can choose to receive notifications
          about <strong>discounts, promotional offers, and product
          launches</strong> by email and/or SMS text message. Opt-in
          checkboxes appear on the account-creation form. You can change
          your preferences at any time in your account settings or by
          replying STOP to any SMS message (US carriers) or by clicking the
          unsubscribe link in any marketing email.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Marketing messages are sent separately from transactional messages
          (order confirmations, shipping notifications, support replies,
          and account-security notices). You will continue to receive
          transactional messages while you have an active order or account,
          even if you have opted out of marketing.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Payment processing
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Payments are processed by <strong>Stripe</strong>. Stripe
          Checkout collects the billing, shipping, and payment information
          needed to authorize and capture an order. Stripe is the system of
          record for the payment transaction itself. For Stripe&apos;s own
          privacy practices, see{' '}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            stripe.com/privacy
          </a>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Cookies and similar technologies
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We use a minimal set of <strong>essential cookies and
          browser-storage values</strong> that are required for the site to
          function:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            Your <strong>session token</strong> when you are logged in to an
            account.
          </li>
          <li>
            Your <strong>shopping cart contents</strong> while you browse,
            stored locally in your browser so the cart survives page
            navigation.
          </li>
          <li>
            Cookies set by <strong>Stripe</strong> on the checkout page for
            fraud prevention.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          We do <strong>not</strong> set advertising cookies, retargeting
          pixels, or third-party tracking pixels (Meta / TikTok / Google
          Ads / etc.) on the storefront. Because we use only
          strictly-necessary cookies, no cookie banner is displayed.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          How we use your data
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>To create and authenticate your account.</li>
          <li>To process payment and fulfill the orders you place.</li>
          <li>
            To send order-status notifications (confirmation, shipping
            notification, delay notification, delivery confirmation).
          </li>
          <li>To respond to support, refund, and account requests.</li>
          <li>
            To send marketing notifications about discounts, promotions,
            and product launches &mdash; only if you opted in.
          </li>
          <li>To investigate fraud, chargebacks, and abuse of the site.</li>
          <li>To improve the storefront based on aggregate usage patterns.</li>
          <li>
            To comply with tax, accounting, anti-money-laundering, and
            other legal obligations.
          </li>
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
          We share the minimum data necessary with the following service
          providers that operate the storefront on our behalf:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            <strong>Stripe</strong> &mdash; payment processing and fraud
            screening for orders.
          </li>
          <li>
            <strong>Vercel</strong> &mdash; hosting and edge delivery of
            the storefront.
          </li>
          <li>
            <strong>Supabase</strong> &mdash; database for account,
            order-fulfillment, and operational data.
          </li>
          <li>
            <strong>USPS and UPS</strong> &mdash; the recipient name,
            shipping address, and contact details required to deliver
            your parcel.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          We also disclose data when required by law, in response to a
          valid subpoena, court order, or government request, or when
          necessary to protect the rights, safety, or property of Strand
          Labs, our customers, or the public.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Where your data is stored
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Account, order, and operational data are stored in private
          databases that we control. Payment data lives with Stripe.
          Marketing-preference data lives alongside the account record.
          All data is stored in the United States.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Retention
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Order, payment, and tax records are retained for as long as
          required by tax, accounting, and fraud-prevention obligations
          (typically 7 years for transaction records). Account data is
          retained for as long as the account remains active. Support
          messages are retained for 24 months unless deletion is requested
          earlier. Usage data is retained on a rolling 13-month basis.
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
            within 30 days. Some data (e.g. completed transaction records)
            may be retained where law requires.
          </li>
          <li>
            <strong>Marketing opt-out.</strong> Update marketing
            preferences in your account settings, click unsubscribe in
            any marketing email, or reply STOP to any SMS marketing
            message.
          </li>
          <li>
            <strong>Account closure.</strong> Email us with your account
            email and we will close your account and delete its data,
            subject to the retention exceptions above.
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
          here at the time you place an order is the version that applies
          to that order. Material changes will be communicated by email to
          active account holders.
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
        ,{' '}
        <Link to="/returns" className="underline underline-offset-2 hover:text-ink-700">
          Return &amp; Refund Policy
        </Link>
        , and{' '}
        <Link to="/shipping" className="underline underline-offset-2 hover:text-ink-700">
          Shipping &amp; Delivery Policy
        </Link>
        . Last updated{' '}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
      </p>
    </div>
  )
}
