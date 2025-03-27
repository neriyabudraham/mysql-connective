
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import Header from '@/components/Header';
import DataGrid from '@/components/DataGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, LayoutGrid } from 'lucide-react';

const TableView = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const { activeConnection } = useDatabase();
  const navigate = useNavigate();
  
  // Redirect to login if not connected
  useEffect(() => {
    if (!activeConnection) {
      navigate('/');
    }
  }, [activeConnection, navigate]);
  
  if (!activeConnection || !tableName) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>חזור לטבלאות</span>
            </Button>
            
            <div className="flex items-center gap-2 mr-4">
              <div className="p-1.5 rounded-md bg-primary/10">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-medium tracking-tight">
                טבלה: {tableName}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-muted/50 text-muted-foreground text-sm px-3 py-1 rounded-full">
            <Database className="h-3.5 w-3.5 ml-1" />
            <span>{activeConnection.database}</span>
          </div>
        </div>
        
        <DataGrid tableName={tableName} />
      </main>
    </div>
  );
};

export default TableView;
