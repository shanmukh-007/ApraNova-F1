import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata = {
  title: "Privacy Policy • ApraNova",
  description: "Learn how we protect your privacy and handle your data",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p>
              At ApraNova, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our platform and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Name, email address, and phone number</li>
              <li>Educational background and professional experience</li>
              <li>Payment and billing information</li>
              <li>Profile photo and bio (optional)</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
            <ul className="list-disc pl-6">
              <li>Course progress and completion data</li>
              <li>Project submissions and assessments</li>
              <li>Platform interaction and engagement metrics</li>
              <li>Device information and IP address</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6">
              <li>To provide and improve our educational services</li>
              <li>To personalize your learning experience</li>
              <li>To communicate course updates and important notifications</li>
              <li>To process payments and prevent fraud</li>
              <li>To analyze platform usage and improve features</li>
              <li>To provide customer support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6">
              <li><strong>Service Providers:</strong> Payment processors, cloud hosting, analytics tools</li>
              <li><strong>Mentors:</strong> Your assigned mentor receives access to your progress and submissions</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure servers, and regular 
              security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver 
              personalized content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 16 years of age. We do not knowingly collect 
              information from children under 16.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than India. We ensure 
              appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              via email or platform notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-none mt-4">
              <li><strong>Email:</strong> privacy@apranova.com</li>
              <li><strong>Address:</strong> Bangalore, Karnataka, India</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
