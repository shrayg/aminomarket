import { Link } from 'react-router-dom'

export function Shipping() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">
        Shipping &amp; Delivery Policy
      </h1>
      <p className="mt-3 text-sm uppercase tracking-wider text-ink-400">
        Domestic and international orders
      </p>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Turnaround
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Standard turnaround &mdash; from order placement to delivery on
          your doorstep &mdash; is <strong>1 to 2 weeks</strong>. This
          covers payment verification, batch preparation, vialing, QC release,
          and carrier transit time. Orders typically{' '}
          <strong>ship within 1&ndash;2 weeks</strong> and{' '}
          <strong>arrive within 1&ndash;2 weeks</strong> of being shipped.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          If anything pushes your order outside that window &mdash; a
          fulfillment backlog, a carrier delay, severe weather, or a payment
          review hold &mdash; <strong>you will hear from us by email</strong>{' '}
          with the new estimate. We do not let orders sit silently.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Carriers
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We ship via <strong>USPS</strong> and <strong>UPS</strong>. The
          carrier and service level used for your order are selected based on
          weight, destination, and the rate returned by the carrier at
          checkout.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Shipping cost
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Shipping cost is calculated in real time at checkout based on parcel
          weight, dimensions, destination, and the carrier&apos;s live rate.
          The exact total is shown before you confirm the order.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          <strong>Free shipping on US domestic orders of $200 or more.</strong>{' '}
          International orders are quoted at the carrier&apos;s live rate
          regardless of cart subtotal &mdash; the free-shipping threshold
          does not apply internationally.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Where we ship
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We currently ship to:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>All 50 US states and the District of Columbia</li>
          <li>US territories (Puerto Rico, USVI, Guam, American Samoa)</li>
          <li>APO / FPO / DPO military addresses</li>
          <li>US Post Office (P.O.) boxes</li>
          <li>
            International destinations (rates calculated live at checkout)
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          It is the customer&apos;s responsibility to confirm that import of
          research materials is lawful in their jurisdiction before
          ordering. Any customs duties, VAT, GST, or import fees assessed by
          the destination country are the customer&apos;s responsibility and
          are <strong>not</strong> included in the shipping rate quoted at
          checkout. Parcels stopped or seized by customs are not eligible
          for refund.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Tracking
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          A tracking number is emailed the moment your parcel is handed to
          the carrier. You can also pull live tracking up on the{' '}
          <Link to="/track-order" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
            Track Order
          </Link>{' '}
          page using your order number and the email used at checkout.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Address accuracy
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Please double-check your shipping address at checkout. Once a parcel
          is handed to the carrier we cannot reroute it. Parcels returned to
          us as undeliverable, refused at delivery, or returned to sender for
          an incorrect or incomplete address can be{' '}
          <strong>re-shipped at the customer&apos;s expense</strong> &mdash;
          you will be invoiced for the reshipping cost before we hand the
          parcel back to the carrier. Refunds are not issued for address
          errors, refused delivery, or other delivery failures caused by the
          customer.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Damaged shipments
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          If your shipment arrives damaged, submit a damage claim within{' '}
          <strong>48 hours of delivery confirmation</strong> with photos of
          the outer box, inner packaging, and the damaged product. Full
          process and resolution options on the{' '}
          <Link to="/returns" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
            Return &amp; Refund Policy
          </Link>{' '}
          page.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Lost or stuck shipments
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          If tracking shows the parcel as lost or has not updated for 10+
          business days after the last carrier scan, please file a claim
          directly with the carrier (USPS or UPS) using your tracking number.
          We will help you put the carrier claim together &mdash; email us
          with your order number and a screenshot of the tracking page.
          Resolution depends on the outcome of the carrier&apos;s
          investigation.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          Temperature handling
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Lyophilized research peptides remain stable at ambient temperature
          for the in-transit window we use, so parcels ship at ambient
          temperature with standard protective packaging. Once the carrier
          hands the parcel to you, all temperature and storage decisions are
          the customer&apos;s responsibility.
        </p>
      </section>

      <p className="mt-12 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500">
        <strong className="text-ink-600">Research Use Only:</strong> All
        shipments contain reference materials intended strictly for in-vitro
        laboratory research. They are not drugs, supplements, food, or
        medical devices, and are not intended for human or veterinary use.
        See the{' '}
        <Link to="/terms" className="underline underline-offset-2 hover:text-ink-700">
          Terms of Service
        </Link>{' '}
        for full purchase conditions. Last updated{' '}
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
      </p>
    </div>
  )
}
