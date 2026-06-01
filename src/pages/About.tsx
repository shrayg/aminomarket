import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Logo variant="light" height="lg" link={false} className="mb-10" />

      <h1 className="font-sans text-3xl font-bold text-ink-900">Who We Are</h1>
      <p className="mt-6 leading-relaxed text-ink-600">
        Amino Market is a research-focused supplier of high-purity reference
        peptides intended <strong>strictly for laboratory and in-vitro research
        use</strong>. We exist to give independent researchers, university labs,
        and commercial R&amp;D teams a consistent, well-documented source of
        material so the only variable in their work is the experiment itself.
      </p>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          Research Use Only
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Every product sold on this site is supplied as a research chemical.
          They are <strong>not drugs, dietary supplements, cosmetics, food, or
          medical devices</strong>. They are not approved by the U.S. Food and
          Drug Administration and are not intended to diagnose, treat, cure, or
          prevent any disease in humans or animals.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Amino Market is not a compounding pharmacy under FDCA §503A and is
          not an outsourcing facility under §503B. We do not provide dosing,
          administration, or therapeutic guidance under any circumstances.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          To purchase, every customer must agree to our{' '}
          <Link to="/terms" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
            Terms of Service
          </Link>{' '}
          and confirm at the age gate that they are 21+ and that they are
          buying solely for in-vitro laboratory research. Submitting an order
          is your written acknowledgment of that agreement.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          What We Stand For
        </h2>
        <ul className="mt-4 space-y-3 leading-relaxed text-ink-600">
          <li>
            <strong>Scientific rigor.</strong> Every batch is targeted at
            &ge;99% purity and accompanied by a third-party Certificate of
            Analysis available on the COA page.
          </li>
          <li>
            <strong>Integrity and transparency.</strong> Open disclosure of
            sourcing, testing methodology, and lot-level quality data so
            researchers can independently verify what they are working with.
          </li>
          <li>
            <strong>Reliable fulfillment.</strong> Orders are processed and
            shipped within a 1&ndash;2 week turnaround. If anything in that
            window changes, you hear from us directly &mdash; we do not ghost
            orders.
          </li>
          <li>
            <strong>Research-focused support.</strong> A real human responds to
            order, shipping, and documentation questions, typically within
            24&ndash;48 hours.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          Manufacturing &amp; Verification
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed text-ink-600">
          <li>
            <strong>Laboratory-grade reconstitution water</strong> provides a
            contaminant-free foundation.
          </li>
          <li>
            <strong>Stabilizing excipients.</strong> Precisely measured
            mannitol and sucrose protect peptide integrity during
            lyophilization.
          </li>
          <li>
            <strong>Analytical verification.</strong> Electrospray ionization
            mass spectrometry (ESI-MS) confirms molecular structure.
          </li>
          <li>
            <strong>0.22 &micro;m filtration</strong> removes particulates
            prior to vialing.
          </li>
          <li>
            <strong>Controlled lyophilization &amp; vialing.</strong> A 36-hour
            freeze-dry cycle maximizes long-term stability.
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          Why Choose Amino Market
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Our mission is to accelerate scientific discovery by giving
          researchers consistent, well-documented reference materials and a
          team that actually responds. Full control over sourcing, batching,
          and QC &mdash; combined with transparent COAs &mdash; lets you spend
          your time on results instead of validating your inputs.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          Connect with Us
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          For order, shipping, and documentation questions, email{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>
          . You can also reach us on Telegram at{' '}
          <a
            href="https://t.me/aminomarketshop"
            target="_blank"
            rel="noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            @aminomarketshop
          </a>{' '}
          or join the community on{' '}
          <a
            href="https://discord.gg/gS7prpfSmy"
            target="_blank"
            rel="noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            Discord
          </a>
          .
        </p>
      </section>

      <p className="mt-12 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500">
        <strong className="text-ink-600">Research Use Only:</strong> All
        Amino Market products are intended strictly for laboratory and in-vitro
        research use. They are <em>not</em> for human or veterinary
        consumption. No therapeutic claims are made or implied. By purchasing
        from this site you affirm that you are a qualified researcher and that
        you accept full responsibility for the lawful handling and use of these
        materials in accordance with all applicable federal, state, and local
        regulations.
      </p>
    </div>
  )
}
