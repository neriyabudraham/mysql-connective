
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import ConnectionForm from '@/components/ConnectionForm';
import { Database } from 'lucide-react';

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
      <div className="w-full max-w-md mx-auto text-center mb-8 animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Database className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight mb-2">MySQL Connector</h1>
        <p className="text-muted-foreground">
          Connect to your MySQL database and visualize data in a spreadsheet-like interface
        </p>
      </div>
      
      <ConnectionForm />
      
      <div className="mt-8 text-center text-sm text-muted-foreground animate-fadeIn opacity-75">
        <p>Enter your MySQL database credentials to get started</p>
        <p className="mt-1">All connections are securely stored in your browser</p>
      </div>
    </div>
  );
};

export default Index;
