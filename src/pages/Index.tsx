
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import ConnectionForm from '@/components/ConnectionForm';
import { Database, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const { activeConnection } = useDatabase();
  const navigate = useNavigate();
  
  // הפנה לדשבורד אם כבר מחובר
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
          התחבר למסד הנתונים MySQL שלך וצפה בנתונים בממשק דמוי גיליון אלקטרוני
        </p>
        
        <Alert className="bg-blue-50 text-blue-800 border-blue-200 mb-4">
          <Info className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-sm">
            זוהי הדגמה של ממשק למסד נתונים. באפליקציה אמיתית, חיבורים ישירים למסד נתונים מהדפדפן אינם אפשריים מטעמי אבטחה. API אחורי יידרש.
          </AlertDescription>
        </Alert>
      </div>
      
      <ConnectionForm />
      
      <div className="mt-6 text-center text-sm text-muted-foreground animate-fadeIn opacity-75">
        <p>למטרות הדגמה בלבד</p>
      </div>
    </div>
  );
};

export default Index;
