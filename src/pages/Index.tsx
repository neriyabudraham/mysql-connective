
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import ConnectionForm from '@/components/ConnectionForm';
import { Database, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const { activeConnection } = useDatabase();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already connected
  useEffect(() => {
    if (activeConnection) {
      navigate('/dashboard');
    }
  }, [activeConnection, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md mx-auto text-center mb-6 animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Database className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight mb-2">MySQL Connector</h1>
        <p className="text-muted-foreground mb-4">
          Connect to your MySQL database and visualize data in a spreadsheet-like interface
        </p>
        
        <Alert className="bg-blue-50 text-blue-800 border-blue-200 mb-4">
          <Info className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-sm">
            This is a demonstration of a database UI. In a real application, direct database connections from a 
            browser are not possible for security reasons. A backend API would be required.
          </AlertDescription>
        </Alert>
      </div>
      
      <ConnectionForm />
      
      <div className="mt-6 text-center text-sm text-muted-foreground animate-fadeIn opacity-75">
        <p>For demonstration purposes only</p>
      </div>
    </div>
  );
};

export default Index;
