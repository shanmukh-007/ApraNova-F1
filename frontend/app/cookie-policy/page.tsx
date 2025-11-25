import Navbar from "@/components/landing/navbar"
import Footer from "@/components/landing/footer"

export const metadata = {
  title: "Cookie Policy • ApraNova",
  description: "Learn about how we use cookies",
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit our website. They help us 
              provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mb-3">1. Essential Cookies</h3>
            <p className="mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as 
              security, authentication, and accessibility features.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Session management</li>
              <li>Authentication and security</li>
              <li>Load balancing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2. Performance Cookies</h3>
            <p className="mb-4">
              These cookies help us understand how visitors interact with our website by collecting anonymous information.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Page visit analytics</li>
              <li>Error tracking</li>
              <li>Performance monitoring</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">3. Functional Cookies</h3>
            <p className="mb-4">
              These cookies enable enhanced functionality and personalization.
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Language preferences</li>
              <li>Theme settings (dark/light mode)</li>
              <li>User interface customizations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">4. Targeting/Advertising Cookies</h3>
            <p className="mb-4">
              These cookies may be set through our site by advertising partners to build a profile of your interests.
            </p>
            <ul className="list-disc pl-6">
              <li>Personalized advertising</li>
              <li>Retargeting campaigns</li>
              <li>Social media integration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
            <p className="mb-4">We use services from third-party providers that may set cookies:</p>
            <ul className="list-disc pl-6">
              <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
              <li><strong>Payment Processors:</strong> For secure payment processing</li>
              <li><strong>Social Media:</strong> For social sharing features</li>
              <li><strong>CDN Providers:</strong> For content delivery and performance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
            <p className="mb-4">You can control and manage cookies in several ways:</p>
            
            <h3 className="text-xl font-semibold mb-3">Browser Settings</h3>
            <p className="mb-4">
              Most browsers allow you to refuse or accept cookies. You can usually find these settings in the 
              'Options' or 'Preferences' menu of your browser.
            </p>

            <h3 className="text-xl font-semibold mb-3">Cookie Consent Tool</h3>
            <p className="mb-4">
              When you first visit our website, you'll see a cookie consent banner where you can choose which 
              types of cookies to accept.
            </p>

            <h3 className="text-xl font-semibold mb-3">Opt-Out Links</h3>
            <ul className="list-disc pl-6">
              <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" className="text-purple-600 hover:underline">Opt-out</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Impact of Disabling Cookies</h2>
            <p>
              If you disable cookies, some features of our website may not function properly. Essential cookies 
              cannot be disabled as they are necessary for the website to work.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with 
              an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <ul className="list-none mt-4">
              <li><strong>Email:</strong> privacy@apranova.com</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
