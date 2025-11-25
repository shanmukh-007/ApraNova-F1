"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import PaymentForm from "@/components/payment/payment-form"
import apiClient from "@/lib/apiClient"

// Track pricing
const TRACK_PRICING = {
  DP: {
    name: "Data Professional",
    price: 999,
    currency: "usd",
    features: [
      "Apache Superset Analytics",
      "SQL Lab & Query Editor",
      "Interactive Dashboards",
      "10 Real-world Projects",
      "Lifetime Access",
      "Certificate of Completion"
    ]
  },
  FSD: {
    name: "Full Stack Development",
    price: 999,
    currency: "usd",
    features: [
      "VS Code IDE in Browser",
      "React & Next.js",
      "Node.js & Express",
      "10 Real-world Projects",
      "Lifetime Access",
      "Certificate of Completion"
    ]
  }
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const track = searchParams.get("track") as "DP" | "FSD" | null
  
  const [stripePromise, setStripePromise] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if no track selected
    if (!track || !TRACK_PRICING[track]) {
      router.push("/select-track")
      return
    }

    // Initialize Stripe and create payment intent
    initializePayment()
  }, [track])

  const initializePayment = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!track) return

      const trackInfo = TRACK_PRICING[track]

      // Get email from sessionStorage if available
      const email = sessionStorage.getItem("userEmail") || ""

      // Create payment intent using direct axios call (bypass auth interceptor)
      const axios = (await import('axios')).default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      
      const response = await axios.post(`${apiUrl}/api/payments/create-payment/`, {
        amount: trackInfo.price,
        currency: trackInfo.currency,
        email: email,
        metadata: {
          track: track,
          track_name: trackInfo.name
        }
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      })

      const { clientSecret, publishableKey } = response.data

      // Initialize Stripe
      const stripe = await loadStripe(publishableKey)
      setStripePromise(stripe)
      setClientSecret(clientSecret)
    } catch (err: any) {
      console.error("Payment initialization error:", err)
      setError(err.response?.data?.error || err.message || "Failed to initialize payment")
    } finally {
      setLoading(false)
    }
  }

  if (!track || !TRACK_PRICING[track]) {
    return null
  }

  const trackInfo = TRACK_PRICING[track]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Track Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">{trackInfo.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete learning track with projects and certification
                </p>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-sm mb-3">What's Included:</h4>
                <ul className="space-y-2">
                  {trackInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${trackInfo.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="font-semibold">$0</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl">${trackInfo.price}</span>
                </div>
              </div>

              {/* Money Back Guarantee */}
              <Alert>
                <AlertDescription className="text-sm">
                  🛡️ <strong>30-Day Money Back Guarantee</strong>
                  <br />
                  Not satisfied? Get a full refund within 30 days.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-muted-foreground">Initializing payment...</p>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : stripePromise && clientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0070f3",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    amount={trackInfo.price}
                    track={track}
                    trackName={trackInfo.name}
                  />
                </Elements>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Secure payment powered by{" "}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Stripe
            </a>
            . Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PaymentContent />
    </Suspense>
  )
}
