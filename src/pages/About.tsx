import { Logo } from '@/components/Logo'

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Logo variant="light" height="lg" link={false} className="mb-10" />

      <h1 className="font-sans text-3xl font-bold text-ink-900">Who We Are</h1>
      <p className="mt-6 leading-relaxed text-ink-600">
        Strand Labs makes modern hair care with copper peptide (GHK-Cu).
        Our first product is a peptide shampoo designed for everyday cleansing
        and scalp comfort — simple formula, clean rinse, no research-lab
        jargon.
      </p>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          What we sell
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          GHK-Cu Peptide Shampoo is a <strong>cosmetic hair care product</strong>.
          It is not a drug and is not intended to diagnose, treat, cure, or
          prevent any disease. Use it as part of your normal wash routine.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          What We Stand For
        </h2>
        <ul className="mt-4 space-y-3 leading-relaxed text-ink-600">
          <li>
            <strong>Clear products.</strong> Straightforward hair care with
            copper peptide, sized for real routines.
          </li>
          <li>
            <strong>Reliable fulfillment.</strong> Orders ship on a 1&ndash;2
            week turnaround. If timing changes, we tell you.
          </li>
          <li>
            <strong>Human support.</strong> Email, Telegram, or Discord —
            typically answered within 24&ndash;48 hours.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-sans text-2xl font-bold text-ink-900">
          Connect with Us
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Questions about orders or shipping? Email{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>
          , message{' '}
          <a
            href="https://t.me/aminomarketshop"
            target="_blank"
            rel="noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            @aminomarketshop
          </a>{' '}
          on Telegram, or join{' '}
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
        <strong className="text-ink-600">Cosmetic product notice:</strong>{' '}
        Strand Labs products are sold as cosmetics for external hair and scalp
        care. They are <em>not</em> intended to diagnose, treat, cure, or
        prevent any disease. Individual results vary.
      </p>
    </div>
  )
}
