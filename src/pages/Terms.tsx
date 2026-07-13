import { Link } from 'react-router-dom'

export function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm uppercase tracking-wider text-ink-400">
        Effective for all users of Strand Labs
      </p>

      <p className="mt-8 rounded-xl border-l-2 border-accent-dark bg-accent-light/20 p-4 text-sm leading-relaxed text-ink-800">
        <strong>PLEASE READ CAREFULLY.</strong> By using the site or placing
        an order you agree to these Terms.
      </p>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          1. Acceptance of these terms
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          &ldquo;Strand Labs&rdquo;, the &ldquo;Company&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer
          to the operator of Strand Labs. By accessing Strand Labs, creating
          an account, or placing an order, you (the &ldquo;Customer&rdquo; or
          &ldquo;you&rdquo;) enter a binding agreement under these Terms. If
          you do not agree, do not use the site and do not place an order.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          2. Products
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Products sold on Strand Labs are <strong>cosmetic hair care
          products</strong> for external use on hair and scalp. They are not
          drugs and are not intended to diagnose, treat, cure, or prevent any
          disease. Always follow the usage directions on the product label.
          Discontinue use if irritation occurs and contact support if you need help
          with an order.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          3. Orders, payment, and fulfillment
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Orders are paid through Stripe. Prices are shown at checkout and may
          change without notice for future orders. Shipping is calculated in
          real time; free shipping applies to qualifying U.S. domestic orders
          of $200 or more. Typical fulfillment turnaround is 1&ndash;2 weeks.
          Sales tax, VAT, GST, and customs duties are the customer&apos;s
          responsibility unless we expressly collect them.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          4. Returns and refunds
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          All sales are final once an order is marked as processed, except for
          pre-processing cancellations and approved shipping-damage claims
          filed within 48 hours of delivery with photos. Full details are in
          our{' '}
          <Link to="/returns" className="underline underline-offset-2 hover:text-accent-dark">
            Return &amp; Refund Policy
          </Link>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          5. Accounts and communications
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          You are responsible for account credentials and for information you
          submit. We may send transactional messages about orders, shipping,
          security, and support. Marketing email or SMS is optional and can be
          opted out at any time.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          6. Limitation of liability
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          To the fullest extent permitted by law, Strand Labs is not liable for
          indirect, incidental, special, or consequential damages arising from
          use of the site or products. Our total liability for any claim related
          to an order will not exceed the amount you paid for that order.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          7. Intellectual property
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Site content, product names, and the &ldquo;Strand Labs&rdquo; mark
          are owned by Strand Labs or its licensors. You may not copy or
          redistribute them without permission.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          8. Contact
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Questions about these Terms:{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  )
}
