"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Lock, Mail } from "lucide-react"

interface PaymentFormProps {
  amount: number
  track: string
  trackName: string
}

export default function PaymentForm({ amount, track, trackName }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: email,
        },
        redirect: "if_required",
      })

      if (stripeError) {
        setError(stripeError.message || "Payment failed")
        setLoading(false)
        return
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setSuccess(true)

        // Store payment info and email in sessionStorage for signup
        sessionStorage.setItem("paymentIntentId", paymentIntent.id)
        sessionStorage.setItem("userEmail", email)
        sessionStorage.setItem("selectedTrack", track)
        sessionStorage.setItem("paymentCompleted", "true")

        // Redirect to success page
        setTimeout(() => {
          router.push(`/payment/success?track=${track}&email=${encodeURIComponent(email)}`)
        }, 2000)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          ✅ Payment successful! Redirecting to your dashboard...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          We'll send your receipt and account details to this email
        </p>
      </div>

      {/* Payment Element */}
      <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-lg font-semibold"
        disabled={!stripe || loading || !email}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay ${amount}
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-xs text-center text-muted-foreground">
        By completing this purchase, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
