'use client';

import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  url?: string;
  credentials?: {
    host: string;
    port: string;
    database: string;
    schema: string;
    username: string;
    password: string;
    connectionString: string;
  };
  status?: 'active' | 'inactive' | 'provisioning';
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'cyan' | 'teal' | 'red';
}

export default function ToolCard({
  icon,
  title,
  description,
  url,
  credentials,
  status = 'active',
  color = 'green'
}: ToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const colorClasses = {
    green: {
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/30',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      icon: 'text-emerald-400',
      glow: 'shadow-emerald-500/20'
    },
    blue: {
      border: 'border-blue-500/50',
      bg: 'bg-blue-950/30',
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/20'
    },
    purple: {
      border: 'border-purple-500/50',
      bg: 'bg-purple-950/30',
      button: 'bg-purple-600 hover:bg-purple-700',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/20'
    },
    orange: {
      border: 'border-orange-500/50',
      bg: 'bg-orange-950/30',
      button: 'bg-orange-600 hover:bg-orange-700',
      icon: 'text-orange-400',
      glow: 'shadow-orange-500/20'
    },
    cyan: {
      border: 'border-cyan-500/50',
      bg: 'bg-cyan-950/30',
      button: 'bg-cyan-600 hover:bg-cyan-700',
      icon: 'text-cyan-400',
      glow: 'shadow-cyan-500/20'
    },
    teal: {
      border: 'border-teal-500/50',
      bg: 'bg-teal-950/30',
      button: 'bg-teal-600 hover:bg-teal-700',
      icon: 'text-teal-400',
      glow: 'shadow-teal-500/20'
    },
    red: {
      border: 'border-red-500/50',
      bg: 'bg-red-950/30',
      button: 'bg-red-600 hover:bg-red-700',
      icon: 'text-red-400',
      glow: 'shadow-red-500/20'
    }
  };

  const colors = colorClasses[color];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`
      rounded-xl border-2 ${colors.border} ${colors.bg} 
      p-6 transition-all duration-300 
      hover:shadow-lg ${colors.glow}
      backdrop-blur-sm
    `}>
      <div className="flex items-center justify-between gap-4">
        {/* Icon and Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-lg 
            bg-slate-900/50 flex items-center justify-center
            ${colors.icon}
          `}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-400">
              {description}
            </p>
            
            {status === 'provisioning' && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs text-yellow-400">Provisioning...</span>
              </div>
            )}
            
            {status === 'inactive' && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-xs text-gray-400">Inactive</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {url && status === 'active' && (
          <Button
            onClick={handleOpen}
            className={`${colors.button} text-white flex-shrink-0`}
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open {title.split(' ')[0]}
          </Button>
        )}
        
        {credentials && (
          <Button
            onClick={() => setShowCredentials(!showCredentials)}
            className={`${colors.button} text-white flex-shrink-0`}
            size="lg"
          >
            {showCredentials ? 'Hide' : 'Show'} Credentials
          </Button>
        )}
      </div>

      {/* Credentials Section */}
      {credentials && showCredentials && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Host:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-white bg-slate-900/50 px-2 py-1 rounded flex-1">
                  {credentials.host}
                </code>
                <button
                  onClick={() => handleCopy(credentials.host)}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400">Port:</span>
              <code className="block text-white bg-slate-900/50 px-2 py-1 rounded mt-1">
                {credentials.port}
              </code>
            </div>
            
            <div>
              <span className="text-gray-400">Database:</span>
              <code className="block text-white bg-slate-900/50 px-2 py-1 rounded mt-1">
                {credentials.database}
              </code>
            </div>
            
            <div>
              <span className="text-gray-400">Schema:</span>
              <code className="block text-white bg-slate-900/50 px-2 py-1 rounded mt-1">
                {credentials.schema}
              </code>
            </div>
            
            <div>
              <span className="text-gray-400">Username:</span>
              <code className="block text-white bg-slate-900/50 px-2 py-1 rounded mt-1">
                {credentials.username}
              </code>
            </div>
            
            <div>
              <span className="text-gray-400">Password:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-white bg-slate-900/50 px-2 py-1 rounded flex-1">
                  ••••••••
                </code>
                <button
                  onClick={() => handleCopy(credentials.password)}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-gray-400 text-sm">Connection String:</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-white bg-slate-900/50 px-2 py-1 rounded flex-1 text-xs overflow-x-auto">
                {credentials.connectionString}
              </code>
              <button
                onClick={() => handleCopy(credentials.connectionString)}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
