import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata = {
  title: "Refund Policy • ApraNova",
  description: "Our refund and cancellation policy",
}

export default function RefundPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7-Day Money-Back Guarantee</h2>
            <p>
              We stand behind the quality of our courses. If you're not completely satisfied with your purchase, 
              you can request a full refund within 7 days of enrollment, no questions asked.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Eligibility for Refund</h2>
            <p className="mb-4">You are eligible for a full refund if:</p>
            <ul className="list-disc pl-6">
              <li>You request the refund within 7 days of your initial purchase</li>
              <li>You have not completed more than 20% of the course content</li>
              <li>You have not received a certificate of completion</li>
              <li>Your account is in good standing with no violations of our Terms of Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Non-Refundable Items</h2>
            <p className="mb-4">The following are not eligible for refunds:</p>
            <ul className="list-disc pl-6">
              <li>Purchases made more than 7 days ago</li>
              <li>Courses where you've completed more than 20% of the content</li>
              <li>Certificates that have already been issued</li>
              <li>Third-party services or tools purchased through our platform</li>
              <li>Promotional or discounted purchases (unless otherwise stated)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">How to Request a Refund</h2>
            <p className="mb-4">To request a refund:</p>
            <ol className="list-decimal pl-6">
              <li className="mb-2">Email us at <strong>refunds@apranova.com</strong> with your order details</li>
              <li className="mb-2">Include your name, email address, and order number</li>
              <li className="mb-2">Briefly explain your reason for the refund (optional)</li>
              <li className="mb-2">We'll process your request within 2-3 business days</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Refund Processing Time</h2>
            <p className="mb-4">Once your refund is approved:</p>
            <ul className="list-disc pl-6">
              <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
              <li><strong>UPI/Net Banking:</strong> 3-5 business days</li>
              <li><strong>Digital Wallets:</strong> 2-3 business days</li>
            </ul>
            <p className="mt-4">
              The exact time may vary depending on your bank or payment provider. You'll receive a confirmation 
              email once the refund is processed.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Partial Refunds</h2>
            <p>
              In exceptional circumstances, we may offer partial refunds on a case-by-case basis. This is at our 
              sole discretion and typically applies to situations such as:
            </p>
            <ul className="list-disc pl-6 mt-4">
              <li>Technical issues preventing course access for extended periods</li>
              <li>Significant changes to course content after purchase</li>
              <li>Medical emergencies or other extenuating circumstances</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Cancellation Policy</h2>
            <p className="mb-4">You can cancel your enrollment at any time by:</p>
            <ul className="list-disc pl-6">
              <li>Logging into your account and going to Settings</li>
              <li>Selecting "Cancel Enrollment" for the specific course</li>
              <li>Confirming your cancellation</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> Cancellation does not automatically trigger a refund. Refunds are only 
              available within the 7-day window as described above.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
            <p>
              If you're on a subscription plan, you can cancel at any time. You'll continue to have access until 
              the end of your current billing period. No refunds are provided for partial months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Failed Payments</h2>
            <p>
              If a payment fails, we'll attempt to process it again. If the payment continues to fail, your 
              access may be suspended until payment is received. No refunds are issued for failed payments.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p>
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately 
              upon posting. Your continued use of our services after changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>
              If you have questions about our Refund Policy, please contact us:
            </p>
            <ul className="list-none mt-4">
              <li><strong>Email:</strong> refunds@apranova.com</li>
              <li><strong>Support:</strong> support@apranova.com</li>
              <li><strong>Phone:</strong> +91 1234567890 (Mon-Fri, 9am-6pm IST)</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
