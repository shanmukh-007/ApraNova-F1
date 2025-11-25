'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

const tracks = [
  {
    code: 'DP',
    name: 'Data Professional',
    price: 499,
    description: 'Master data analytics, ETL pipelines, and cloud data warehousing',
    features: [
      'Business Analytics with Superset',
      'Automated ETL with Prefect',
      'Cloud Data Warehouse (BigQuery/Redshift)',
      'Python & SQL Mastery',
      'Real-world datasets',
      'Industry-ready portfolio'
    ],
    tools: ['Superset', 'Prefect', 'Jupyter', 'PostgreSQL']
  },
  {
    code: 'FSD',
    name: 'Full-Stack Developer',
    price: 599,
    description: 'Build modern web applications from frontend to deployment',
    features: [
      'React & Next.js Development',
      'Backend APIs (Django/Node)',
      'Database Design & Management',
      'DevOps & CI/CD',
      'Cloud Deployment (AWS/Vercel)',
      'Production-ready projects'
    ],
    tools: ['React', 'Next.js', 'Django', 'Docker', 'AWS']
  }
];

export default function GetStartedPage() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (trackCode: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Stripe Checkout will collect email and name
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-simple-checkout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          track: trackCode,
          success_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/get-started`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Stripe Checkout (will ask for email there)
      window.location.href = data.url;
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Start Your Learning Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose your track, pay once, and get lifetime access to your personalized learning environment
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Track Selection */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Your Learning Track</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select the track that matches your career goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {tracks.map((track) => (
              <Card 
                key={track.code}
                className={`relative cursor-pointer transition-all hover:shadow-xl ${
                  selectedTrack === track.code ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => setSelectedTrack(track.code)}
              >
                {track.code === 'FSD' && (
                  <Badge className="absolute top-4 right-4 bg-purple-600">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{track.name}</CardTitle>
                  <CardDescription className="text-base">
                    {track.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${track.price}</span>
                    <span className="text-gray-500 ml-2">one-time payment</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">What you'll learn:</h4>
                    <ul className="space-y-2">
                      {track.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Tools included:</h4>
                    <div className="flex flex-wrap gap-2">
                      {track.tools.map((tool, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleCheckout(track.code)}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading && selectedTrack === track.code ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Enroll in ${track.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-sm text-gray-600">Real-world Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Hands-on Learning</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
              <div className="text-sm text-gray-600">Lifetime Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
