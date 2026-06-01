import { Link } from 'react-router-dom'

export function Returns() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Return &amp; Refund Policy
      </h1>
      <p className="mt-3 text-sm uppercase tracking-wider text-ink-400">
        Effective for all orders placed through aminomarket.shop
      </p>

      <section className="mt-10 leading-relaxed text-ink-600">
        <p className="border-l-2 border-accent-dark bg-accent-light/20 p-4 text-ink-800">
          <strong>All sales are final</strong> once an order has been marked
          as processed. The two exceptions are (a) cancellations submitted
          before the order is marked as processed, and (b) shipping-damage
          claims documented within 48 hours of delivery confirmation. Both
          are described below.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Cancellations before fulfillment
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          If you change your mind and your order has{' '}
          <strong>not yet been marked as &ldquo;processed&rdquo;</strong> in
          our system, contact{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>{' '}
          and we will cancel the order and issue a{' '}
          <strong>full refund with no cancellation fee</strong> to the
          original payment method through Stripe.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Once an order is marked as processed it has been reserved against a
          manufacturing batch and the materials are committed. After that
          point, the order cannot be refunded. You can still ask us to halt
          shipment, but no refund will be issued.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Shipping-damage claims
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          If your shipment arrives with visibly damaged packaging or with the
          product itself compromised (broken vial, leaking stopper, etc.) you
          may file a damage claim. <strong>All</strong> of the following must
          be true:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            The claim is submitted to{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>{' '}
            (or through the{' '}
            <Link to="/contact" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              contact form
            </Link>
            , Telegram, or Discord support channels)
            <strong> within 48 hours of delivery confirmation</strong> on the
            carrier&apos;s tracking page. Claims submitted after the
            48-hour window cannot be processed.
          </li>
          <li>
            The submission includes <strong>clear photographs</strong> of the
            outer shipping box, the inner packaging, and the damaged product,
            plus your order number.
          </li>
          <li>
            The damaged product has not been used, reconstituted, or altered
            beyond the damage that occurred in transit.
          </li>
          <li>
            You agree to <strong>return the damaged product to us</strong>{' '}
            using the prepaid label we will email you.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Replacement or refund &mdash; your choice
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          When a damage claim is approved you may choose either a{' '}
          <strong>replacement</strong> at no additional cost or a{' '}
          <strong>refund</strong> to the original payment method. The choice
          is yours, but in both cases the damaged product must first be
          returned to us using the prepaid label. The resolution flow is:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            Email us within 48 hours of delivery confirmation with the
            photos, order number, and your preference for{' '}
            <strong>replacement</strong> or <strong>refund</strong>.
          </li>
          <li>
            If the claim qualifies we reply with a{' '}
            <strong>prepaid return shipping label</strong>.
          </li>
          <li>
            Repackage the affected product and drop the labeled parcel with
            the carrier within 5 business days.
          </li>
          <li>
            Once the returned parcel is scanned in by the carrier, we either
            (a) ship the replacement, or (b) issue the refund to the
            original payment method via Stripe. Refunds typically settle to
            your statement within 5&ndash;10 business days depending on your
            issuing bank.
          </li>
        </ol>
        <p className="mt-4 leading-relaxed text-ink-600">
          For anything related to a damage claim, please go through our
          support channels (email / Telegram / Discord) so we can keep all
          documentation in one thread.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Refused, returned-to-sender, or undeliverable parcels
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          If a parcel is refused at delivery or returned to us by the carrier
          (undeliverable address, no recipient available, etc.) the order is{' '}
          <strong>not refunded</strong>. We can re-ship the parcel to a
          corrected address at the customer&apos;s expense; you will be
          invoiced for the second shipping leg before we hand it back to the
          carrier. If you do not arrange a re-ship, the order is forfeited.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Lost shipments
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          If tracking shows your parcel as lost, or has not updated for 10+
          business days after the last carrier scan, the next step is to file
          a claim directly with the carrier (USPS or UPS) using the tracking
          number on your shipping notification. We are happy to help you put
          the carrier claim together &mdash; email us with your order number
          and the tracking screenshot. Resolution and any reimbursement
          depend on the carrier&apos;s investigation outcome.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Temperature handling after delivery
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Once the carrier hands the parcel to you, temperature control is
          the customer&apos;s responsibility. We do not refund or replace
          products that were damaged because the parcel was left outside in
          extreme conditions or otherwise stored improperly after delivery.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          What we do not accept
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>Change-of-mind or no-longer-needed orders after fulfillment.</li>
          <li>Orders where the wrong product or dose was selected at checkout.</li>
          <li>Modifications to an order after submission (add / remove items).</li>
          <li>Damage claims submitted after the 48-hour post-delivery window.</li>
          <li>Damage claims that do not include photographs.</li>
          <li>
            Products that have been opened, reconstituted, or used in any
            research workflow.
          </li>
        </ul>
      </section>

      <p className="mt-12 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500">
        This policy applies to research-material purchases only. For order or
        delivery timelines, see our{' '}
        <Link to="/shipping" className="underline underline-offset-2 hover:text-ink-700">
          Shipping &amp; Delivery Policy
        </Link>
        . By placing an order you agree to our{' '}
        <Link to="/terms" className="underline underline-offset-2 hover:text-ink-700">
          Terms of Service
        </Link>
        . Last updated{' '}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
      </p>
    </div>
  )
}
