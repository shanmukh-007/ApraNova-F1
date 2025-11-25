import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Terms & Conditions • Apra Nova",
  description: "Terms and Conditions for Apra Nova Learning Management System",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/signup">
            <Button variant="ghost" className="mb-4">
              ← Back to Signup
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
            <CardDescription>Last updated: November 2, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Apra Nova Learning Management System ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials (information or software) on Apra Nova for personal, non-commercial transitory viewing only.
            </p>
            <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on Apra Nova</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>

            <h2>4. Student Responsibilities</h2>
            <p>As a student using Apra Nova, you agree to:</p>
            <ul>
              <li>Complete assigned coursework and assessments honestly</li>
              <li>Respect intellectual property rights of course materials</li>
              <li>Maintain professional conduct in all interactions</li>
              <li>Not share your account credentials with others</li>
              <li>Not engage in any form of academic dishonesty</li>
            </ul>

            <h2>5. Trainer Responsibilities</h2>
            <p>As a trainer using Apra Nova, you agree to:</p>
            <ul>
              <li>Provide quality educational content</li>
              <li>Maintain professional standards in teaching</li>
              <li>Respect student privacy and data</li>
              <li>Provide timely feedback on student work</li>
            </ul>

            <h2>6. Content Ownership</h2>
            <p>
              All course materials, including but not limited to videos, documents, quizzes, and assignments, are the property of Apra Nova or its content providers and are protected by copyright laws.
            </p>

            <h2>7. Privacy Policy</h2>
            <p>
              Your use of Apra Nova is also governed by our Privacy Policy. We collect and use your personal information in accordance with applicable data protection laws.
            </p>

            <h2>8. Payment Terms</h2>
            <p>
              Some features of the Service may require payment. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              In no event shall Apra Nova, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Email: support@apranova.com<br />
              Website: www.apranova.com
            </p>

            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                By clicking "I agree to Terms & Conditions" during signup, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/signup">
            <Button>Back to Signup</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

