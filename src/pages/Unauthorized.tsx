
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="bg-amber-100 p-3 rounded-full inline-flex mb-4">
          <AlertTriangle size={32} className="text-amber-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Restricted
        </h1>
        
        <p className="text-gray-600 mb-6">
          {user ? (
            <>Your role ({user.role}) does not have permission to access this area.</>
          ) : (
            <>You need to be logged in to access this page.</>
          )}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
