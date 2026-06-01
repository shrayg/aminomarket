export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-sans text-3xl font-bold text-ink-900">Privacy Policy</h1>
      <div className="mt-10 space-y-6 leading-relaxed text-ink-600">
        <p>
          Aminomarket collects the information needed to operate the storefront, respond to
          inquiries, process orders, and improve the catalog experience.
        </p>
        <section>
          <h2 className="font-sans text-lg font-bold text-ink-900">Storefront analytics</h2>
          <p className="mt-2">
            After you accept the site agreement, we record first-party analytics such as visited
            pages, session duration, product views, shop searches, filter usage, cart activity, and
            checkout progression. This helps us understand catalog demand and improve navigation.
          </p>
        </section>
        <section>
          <h2 className="font-sans text-lg font-bold text-ink-900">Order processing</h2>
          <p className="mt-2">
            Payments are processed by Stripe. Stripe Checkout collects the billing, shipping, and
            payment information needed to process an order. Aminomarket does not store full card
            numbers or card security codes.
          </p>
        </section>
        <section>
          <h2 className="font-sans text-lg font-bold text-ink-900">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact aminomarketshop@gmail.com.
          </p>
        </section>
      </div>
    </div>
  )
}
