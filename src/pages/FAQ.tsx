import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'

type FAQEntry = { q: string; a: React.ReactNode }
type FAQSection = { id: string; title: string; entries: FAQEntry[] }

const sections: FAQSection[] = [
  {
    id: 'orders',
    title: 'Orders & shipping',
    entries: [
      {
        q: 'How long does shipping take?',
        a: (
          <>
            Standard turnaround from order placement to delivery on your
            doorstep is <strong>1&ndash;2 weeks</strong>. That covers payment
            verification, batch preparation, QC release, and carrier transit.
            If anything pushes outside that window we email you with the new
            estimate &mdash; we don&apos;t let orders sit silently.
          </>
        ),
      },
      {
        q: 'How do I track my order?',
        a: (
          <>
            A tracking number is emailed the moment your parcel is handed to
            the carrier. You can also pull live tracking up on the{' '}
            <Link to="/track-order" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              Track Order
            </Link>{' '}
            page using your order number and the email used at checkout.
          </>
        ),
      },
      {
        q: 'Do you ship internationally?',
        a: (
          <>
            Not at this time. We ship within the United States only and do
            not ship to P.O. boxes or to jurisdictions where research
            peptides are restricted by local law.
          </>
        ),
      },
      {
        q: 'I just placed my order \u2014 can I change the shipping address?',
        a: (
          <>
            Open a support ticket immediately. If the order is still in
            preparation we can update the address. Once the parcel is handed
            to the carrier we cannot reroute it, so reach out as soon as you
            notice the mistake.
          </>
        ),
      },
      {
        q: 'My tracking has not updated in days. What now?',
        a: (
          <>
            Carrier scans can pause for a few days during transit. If the
            tracking has not updated for 10+ business days after the last
            scan, email{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>{' '}
            with your order number and we will open a carrier investigation.
            Investigations typically resolve in 7&ndash;14 business days. If
            the parcel is confirmed lost we replace or refund the order.
          </>
        ),
      },
      {
        q: 'Is there a free-shipping threshold?',
        a: <>Yes &mdash; orders of $200 or more ship free within the US.</>,
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & refunds',
    entries: [
      {
        q: 'What is your return policy?',
        a: (
          <>
            <strong>All sales are final</strong> except for shipping-damage
            claims. Because every product is a temperature-sensitive research
            material that leaves our chain of custody, we do not accept
            change-of-mind, wrong-dose-selected, or no-longer-needed returns.
            Full details on the{' '}
            <Link to="/returns" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              Return &amp; Refund Policy
            </Link>{' '}
            page.
          </>
        ),
      },
      {
        q: 'My package arrived damaged. What do I do?',
        a: (
          <>
            Email{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>{' '}
            <strong>within 24&ndash;48 hours of delivery confirmation</strong>{' '}
            with photos of the outer box, inner packaging, and the damaged
            product, plus your order number. If the claim qualifies we email
            you a <strong>prepaid return shipping label</strong>; once the
            carrier scans the parcel, we issue a refund to the original
            payment method.
          </>
        ),
      },
      {
        q: 'Why the 24\u201348 hour window for damage claims?',
        a: (
          <>
            That is the window the shipping carrier accepts a damage
            investigation. Claims filed later can no longer be backed by a
            carrier claim, so we cannot process them.
          </>
        ),
      },
      {
        q: 'When will I see the refund on my statement?',
        a: (
          <>
            Stripe issues the refund the moment the returned parcel scans in
            with the carrier. The refund settles to your bank in roughly
            5&ndash;10 business days depending on your card issuer.
          </>
        ),
      },
      {
        q: 'Can I cancel an order before it ships?',
        a: (
          <>
            If the order has not entered batch preparation we can usually
            cancel and refund. Reach out as soon as possible &mdash; once a
            batch is reserved we cannot pull the order back.
          </>
        ),
      },
    ],
  },
  {
    id: 'products',
    title: 'Products & research use',
    entries: [
      {
        q: 'What does "Research Use Only" mean?',
        a: (
          <>
            Every product on this site is supplied as a research chemical for
            in-vitro laboratory work. They are{' '}
            <strong>not drugs, supplements, cosmetics, food, or medical
            devices</strong>, and have not been evaluated by the U.S. Food
            and Drug Administration. They are not intended to diagnose,
            treat, cure, or prevent any disease in humans or animals. By
            purchasing you agree to use the materials only for in-vitro
            research. Full agreement is in the{' '}
            <Link to="/terms" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              Terms of Service
            </Link>
            .
          </>
        ),
      },
      {
        q: 'Are the products FDA-approved?',
        a: (
          <>
            No &mdash; they are not approved drugs or supplements and they
            cannot be sold as such. They are reference materials supplied to
            qualified researchers for laboratory work only.
          </>
        ),
      },
      {
        q: 'Where do I find the Certificate of Analysis (COA) for my batch?',
        a: (
          <>
            All current COAs are listed on the{' '}
            <Link to="/coa" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              COA page
            </Link>
            . If you need a COA for a specific lot number that arrived with
            your order, open a support ticket with the lot number and the
            product name and we will send the matching PDF.
          </>
        ),
      },
      {
        q: 'How are the products tested?',
        a: (
          <>
            Every batch is targeted at &ge;99% purity, lyophilized in
            controlled conditions, 0.22 &micro;m filtered prior to vialing,
            and verified by independent third-party labs using electrospray
            ionization mass spectrometry (ESI-MS) for molecular identity.
            Detailed methodology is on the{' '}
            <Link to="/about" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              About page
            </Link>
            .
          </>
        ),
      },
      {
        q: 'How should I store the vials?',
        a: (
          <>
            Lyophilized peptides ship at ambient temperature and remain
            stable for the in-transit window. For laboratory storage,
            standard practice for lyophilized reference peptides is cool /
            dry / dark; once reconstituted, refrigerated. Storage protocol
            specifics for your research workflow are the responsibility of
            the researcher.
          </>
        ),
      },
      {
        q: 'Can you tell me how to use the products?',
        a: (
          <>
            <strong>No.</strong> We are a research-chemical supplier, not a
            compounding pharmacy or outsourcing facility. We cannot and will
            not provide dosing, administration, reconstitution, or
            therapeutic guidance. Please consult your research protocol and
            applicable safety data.
          </>
        ),
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & promotions',
    entries: [
      {
        q: 'What payment methods do you accept?',
        a: (
          <>
            All major debit and credit cards processed by Stripe at checkout
            (Visa, Mastercard, American Express, Discover, JCB, Diners,
            UnionPay). We do not currently accept ACH, wire, or crypto.
          </>
        ),
      },
      {
        q: 'Is my payment information secure?',
        a: (
          <>
            Yes. Payment is processed end-to-end by{' '}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noreferrer"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              Stripe
            </a>
            . Aminomarket.shop never sees or stores full card numbers or
            security codes &mdash; those live exclusively with Stripe.
          </>
        ),
      },
      {
        q: 'My card was declined. Why?',
        a: (
          <>
            Stripe issues the decline; common reasons are an incorrect
            address (AVS mismatch), insufficient funds, the bank flagging
            the merchant category, or a regional restriction on the issuer.
            Try a different card, double-check the billing address matches
            the card on file, or call your bank to approve the transaction.
            If you are still stuck, open a support ticket with the last 4
            digits of the card and we can look up the failure reason.
          </>
        ),
      },
      {
        q: 'I see two charges \u2014 was I double-charged?',
        a: (
          <>
            Sometimes a declined attempt and a successful attempt both show
            up briefly. The failed authorization releases within
            3&ndash;7 business days. If both are still showing as captured
            after 10 days, send us a screenshot and we will refund the
            duplicate.
          </>
        ),
      },
      {
        q: 'How do I use the Launch Week 20% Off promo?',
        a: (
          <>
            The launch-week discount applies automatically at checkout. If
            you don&apos;t see it reflected, refresh the cart or open a
            support ticket and we&apos;ll sort it out.
          </>
        ),
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & data',
    entries: [
      {
        q: 'Do I need an account to order?',
        a: <>No &mdash; guest checkout is fully supported. An account just lets you see order history in one place.</>,
      },
      {
        q: 'I forgot my password.',
        a: (
          <>
            Use the{' '}
            <Link to="/forgot-password" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              forgot-password
            </Link>{' '}
            link on the login page to reset it.
          </>
        ),
      },
      {
        q: 'Can I get a copy of my data, or delete my account?',
        a: (
          <>
            Yes. Email{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>{' '}
            from the address on your account and we will export or delete
            your data. Note that completed-transaction records may be
            retained where tax/accounting law requires.
          </>
        ),
      },
    ],
  },
  {
    id: 'business',
    title: 'Wholesale, affiliates & press',
    entries: [
      {
        q: 'Do you offer wholesale or bulk pricing?',
        a: (
          <>
            For research institutions, contract labs, and qualifying volume
            buyers, yes. Open a support ticket or email{' '}
            <a
              href="mailto:aminomarketsupport@gmail.com"
              className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
            >
              aminomarketsupport@gmail.com
            </a>{' '}
            with the products and approximate monthly volume.
          </>
        ),
      },
      {
        q: 'How does the affiliate program work?',
        a: (
          <>
            See the{' '}
            <Link to="/affiliates" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
              Affiliates
            </Link>{' '}
            page for the current commission structure and signup details.
          </>
        ),
      },
      {
        q: 'Press or partnership requests?',
        a: <>Email aminomarketsupport@gmail.com with "PRESS" or "PARTNERSHIP" in the subject line.</>,
      },
    ],
  },
  {
    id: 'support',
    title: 'Getting support',
    entries: [
      {
        q: 'How fast do you respond?',
        a: <>Within 24&ndash;48 hours, every day except major US holidays.</>,
      },
      {
        q: 'What is the fastest way to get help with an order?',
        a: (
          <>
            Include your <strong>order number</strong> and the{' '}
            <strong>email used at checkout</strong> in your first message.
            For shipping or damage issues, also include carrier tracking
            screenshots and photos of the parcel.
          </>
        ),
      },
      {
        q: 'How do I reach you?',
        a: (
          <>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                Email:{' '}
                <a
                  href="mailto:aminomarketsupport@gmail.com"
                  className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
                >
                  aminomarketsupport@gmail.com
                </a>
              </li>
              <li>
                Telegram:{' '}
                <a
                  href="https://t.me/aminomarketshop"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
                >
                  @aminomarketshop
                </a>
              </li>
              <li>
                Discord:{' '}
                <a
                  href="https://discord.gg/gS7prpfSmy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
                >
                  Amino Market community
                </a>{' '}
                &mdash; open a ticket in #support
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
]

function FaqItem({ entry }: { entry: FAQEntry }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:bg-ink-50"
        aria-expanded={open}
      >
        <span className="font-medium text-ink-900">{entry.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-6 pr-8 text-sm leading-relaxed text-ink-600">{entry.a}</div>
      )}
    </div>
  )
}

export function FAQ() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections
      .map((section) => ({
        ...section,
        entries: section.entries.filter((entry) =>
          (entry.q.toLowerCase().includes(q)) ||
          (typeof entry.a === 'string' && entry.a.toLowerCase().includes(q))
        ),
      }))
      .filter((section) => section.entries.length > 0)
  }, [query])

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-dark">
        Help center
      </p>
      <h1 className="mt-2 font-sans text-3xl font-bold text-ink-900">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-ink-600">
        Most order, shipping, refund, and product questions are answered
        below. If you can&apos;t find what you need, reach out through any of
        the channels at the bottom and a real person responds within
        24&ndash;48 hours.
      </p>

      <div className="mt-8 flex items-center gap-3 border border-ink-200 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-ink-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the FAQ..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 border border-ink-200 bg-ink-50 p-6 text-center text-sm text-ink-500">
          No FAQ entries match &ldquo;{query}&rdquo;. Try a broader search or
          open a support ticket.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {filtered.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-sans text-xl font-bold text-ink-900">{section.title}</h2>
              <div className="mt-4 border-t border-ink-200">
                {section.entries.map((entry, i) => (
                  <FaqItem key={`${section.id}-${i}`} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-16 border-t border-ink-200 pt-10 text-sm text-ink-600">
        <p>
          Still stuck? Reach the team at{' '}
          <a
            href="mailto:aminomarketsupport@gmail.com"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            aminomarketsupport@gmail.com
          </a>
          , Telegram{' '}
          <a
            href="https://t.me/aminomarketshop"
            target="_blank"
            rel="noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            @aminomarketshop
          </a>
          , or in our{' '}
          <a
            href="https://discord.gg/gS7prpfSmy"
            target="_blank"
            rel="noreferrer"
            className="text-ink-900 underline underline-offset-2 hover:text-accent-dark"
          >
            Discord community
          </a>
          . Include your order number for order-related questions.
        </p>
      </div>
    </div>
  )
}
