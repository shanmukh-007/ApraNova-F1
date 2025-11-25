'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found. Please contact support.');
      return;
    }

    verifyPayment(sessionId);
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      // Verify the checkout session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify-checkout-session/?session_id=${sessionId}`
      );

      if (response.status === 202) {
        // Account is being created
        setStatus('pending');
        setMessage('Your account is being set up. This may take a moment...');
        
        // Retry after 3 seconds
        setTimeout(() => verifyPayment(sessionId), 3000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify payment');
      }

      const data = await response.json();
      
      if (data.success) {
        // Store payment info for signup
        sessionStorage.setItem('payment_verified', 'true');
        sessionStorage.setItem('payment_session_id', sessionId);
        sessionStorage.setItem('selected_track', data.track || '');
        sessionStorage.setItem('customer_email', data.customer_email || '');
        
        setStatus('success');
        setMessage('Payment successful! Please complete your account setup.');
        
        // Redirect to signup after 2 seconds
        setTimeout(() => {
          router.push(`/signup?track=${data.track || ''}&payment_verified=true`);
        }, 2000);
      } else {
        throw new Error('Payment verification failed');
      }
      
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'verifying' || status === 'pending' ? (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
              <CardTitle>Processing Your Enrollment</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          ) : status === 'success' ? (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
              <CardDescription>Redirecting you to complete your account setup...</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Payment Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        
        {status === 'success' && userEmail && (
          <CardContent className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg text-center">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We've sent your login credentials to:
              </p>
              <p className="font-mono text-sm bg-white dark:bg-gray-800 p-2 rounded border">
                {userEmail}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Check your email inbox</p>
                  <p className="text-gray-600 dark:text-gray-400">Look for an email from ApraNova with your login credentials</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Login to your account</p>
                  <p className="text-gray-600 dark:text-gray-400">Use the credentials from the email to login</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Start learning</p>
                  <p className="text-gray-600 dark:text-gray-400">Access your dashboard and begin your first project</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/login')}
                className="w-full"
                size="lg"
              >
                Go to Login Page
              </Button>
              
              <Button 
                onClick={() => window.open('https://discord.gg/apranova', '_blank')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join Our Discord Community
              </Button>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-center text-purple-900 dark:text-purple-100">
                <strong>💬 Join our Discord!</strong> Connect with fellow students, get help from mentors, and stay updated.
              </p>
            </div>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or contact support@apranova.com
            </p>
          </CardContent>
        )}
        
        {status === 'error' && (
          <CardContent>
            <Button 
              onClick={() => router.push('/get-started')}
              className="w-full"
            >
              Try Again
            </Button>
            <p className="text-sm text-center mt-4 text-gray-600">
              Need help? Contact support@apranova.com
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
