import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button.js';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <Compass size={32} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2">Investigation Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The requested research workspace or page does not exist or has been archived.
      </p>
      <Link to="/dashboard">
        <Button size="sm" icon={<ArrowLeft size={14} />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

