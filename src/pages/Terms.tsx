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
        <strong>PLEASE READ CAREFULLY.</strong> By using the site or placing
        an order you agree to these Terms, including the Research Use Only
        requirements in Section&nbsp;2.
      </p>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          1. Acceptance of these terms
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          &ldquo;Amino Market&rdquo;, the &ldquo;Company&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer
          to the operator of aminomarket.shop. By accessing
          aminomarket.shop, completing the age and research-use
          gate, creating an account, or placing an order, you (the
          &ldquo;Customer&rdquo;, &ldquo;you&rdquo;, or
          &ldquo;Researcher&rdquo;) enter a binding agreement under these
          Terms. If you do not agree to any part of these
          Terms, do not use the site and do not place an order.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          2. Research-Use-Only agreement
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          All products sold on aminomarket.shop are supplied as research
          chemicals for <strong>in-vitro laboratory research only</strong>.
          By creating an account and by placing an order, you affirmatively
          represent and warrant that:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>
            You are at least <strong>21 years of age</strong> and have the
            legal authority to enter this agreement.
          </li>
          <li>
            You are a <strong>qualified researcher</strong>, an institution,
            or are otherwise acquiring the materials for legitimate
            laboratory or analytical research.
          </li>
          <li>
            You will use the materials <strong>only for in-vitro research</strong>{' '}
            and will not administer, ingest, inject, apply to, or otherwise
            introduce them into the body of any human or animal.
          </li>
          <li>
            You will not resell, repackage, relabel, compound, or otherwise
            distribute the materials for any consumer, cosmetic, dietary, or
            therapeutic purpose.
          </li>
          <li>
            You will comply with all applicable federal, state, local, and
            international laws and regulations governing the handling,
            storage, transport, and disposal of research chemicals.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink-600">
          The age-and-research-use gate that appears when you first enter
          the site and the checkbox you confirm at checkout are your
          written acknowledgment of every representation in this section.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Once an order has shipped, the Company has no practical ability
          to control what a customer does with the product. The Customer
          accepts that any use beyond in-vitro research violates this
          agreement, voids any warranty, and exposes the Customer (not the
          Company) to legal and regulatory consequences. By placing the
          order the Customer assumes all such consequences.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          3. No medical claims, no medical advice
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          No statement on this site, in our packaging, or in any
          communication from us is intended as medical, veterinary,
          clinical, or therapeutic advice. Our products are <strong>not
          drugs, dietary supplements, food, cosmetics, or medical
          devices</strong>. They have not been evaluated by the U.S. Food
          and Drug Administration and are not intended to diagnose, treat,
          cure, or prevent any disease in humans or animals. We do not and
          will not provide dosing, reconstitution, administration, or
          therapeutic guidance under any circumstance.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Amino Market is{' '}
          <strong>not</strong> a compounding pharmacy under FDCA &sect;503A
          and is <strong>not</strong> an outsourcing facility under
          &sect;503B. We are a research-chemical supplier only.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          4. Accounts, security, and marketing communications
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
          of any unauthorized use.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          At account creation you may opt in to receive marketing
          notifications about discounts, promotions, and product launches
          by email and/or SMS. You can change these preferences at any
          time in your account settings, by replying STOP to any marketing
          SMS, or by clicking unsubscribe in any marketing email.
          Transactional messages (order status, shipping, support, and
          security notices) are not marketing and will continue as long as
          you have an active order or account.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          5. Orders, pricing, and payment
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Payments are processed by <strong>Stripe</strong>. Submitting an
          order is an offer to purchase; we reserve the right to accept or
          decline any order, to limit quantities, to require additional
          verification, and to correct pricing or product errors before
          fulfillment. Prices, product availability, and promotional
          discounts are subject to change without notice. If payment is
          reversed, charged back, or otherwise fails after the order has
          shipped, you remain liable for the purchase price plus any
          associated fees.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Any sales, use, VAT, GST, customs duties, or other taxes
          assessed on the order or on its delivery are the Customer&apos;s
          responsibility unless we expressly collect and remit them at
          checkout for your jurisdiction.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          6. Promotional codes, loyalty, and affiliate discounts
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          From time to time we offer promotional discounts on the
          storefront. Active promo codes are posted publicly on the site
          and are applied at checkout. Loyalty discounts are extended
          automatically to customers whose lifetime spend crosses our
          loyalty threshold. Affiliate discount codes provide the
          customer using the code with 10% off and credit the referring
          affiliate per our affiliate program terms.
        </p>
        <p className="mt-4 leading-relaxed text-ink-600">
          Promotional discounts cannot be combined with other discounts
          unless we expressly state otherwise. We reserve the right to
          revoke, invalidate, or refuse to honor any promotional code that
          is used fraudulently, abusively, or in a way that was not
          intended at the time the code was issued.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          7. Shipping, returns, and refunds
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          Shipping timelines, carriers, costs, and destinations are
          governed by our{' '}
          <Link to="/shipping" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
            Shipping &amp; Delivery Policy
          </Link>
          . All sales are final once an order is marked as processed,
          except for shipping-damage claims and pre-processing
          cancellations, both of which are governed by our{' '}
          <Link to="/returns" className="text-ink-900 underline underline-offset-2 hover:text-accent-dark">
            Return &amp; Refund Policy
          </Link>
          . By placing an order you agree to those policies.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          8. Assumption of risk &amp; indemnification
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          You assume <strong>all risk</strong> associated with your
          acquisition, handling, storage, and use of the materials
          purchased from us. You agree to indemnify, defend, and hold
          harmless Amino Market and its members,
          officers, employees, contractors, suppliers, and affiliates
          from any claim, loss, liability, fine, penalty, or expense
          (including reasonable attorneys&apos; fees) arising out of or
          related to:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink-600">
          <li>your use, misuse, or distribution of any product purchased from us;</li>
          <li>your breach of these Terms or of any representation in Section&nbsp;2;</li>
          <li>
            your violation of any law or regulation relating to the materials.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          9. Disclaimer &amp; limitation of liability
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          The site and all products are provided on an &ldquo;as is&rdquo;
          and &ldquo;as available&rdquo; basis with no warranty of any
          kind, express or implied, beyond what is explicitly stated in
          the Certificate of Analysis for the specific batch shipped. To
          the maximum extent permitted by law, our aggregate liability for
          any claim arising out of or related to your purchase shall not
          exceed the amount you paid us for the order giving rise to the
          claim. We are not liable for any indirect, incidental,
          consequential, special, exemplary, or punitive damages, even if
          we have been advised of the possibility of such damages.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          10. Intellectual property
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          All site content, branding, photography, copy, and the
          &ldquo;Amino Market&rdquo; mark are owned by Amino Market or
          its licensors and may not be copied, reproduced, scraped, or
          used commercially without prior written permission.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          11. Changes to these terms
        </h2>
        <p className="mt-4 leading-relaxed text-ink-600">
          We may update these Terms from time to time. The version posted
          on this page at the time you place an order is the version that
          governs that order. Material changes will be communicated by
          email to active account holders. Continued use of the site after
          an update constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-xl font-bold text-ink-900">
          12. Contact
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
        ,{' '}
        <Link to="/returns" className="underline underline-offset-2 hover:text-ink-700">
          Return &amp; Refund Policy
        </Link>
        , and{' '}
        <Link to="/shipping" className="underline underline-offset-2 hover:text-ink-700">
          Shipping &amp; Delivery Policy
        </Link>
        .
      </p>
    </div>
  )
}
