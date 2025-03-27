
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import Header from '@/components/Header';
import TableList from '@/components/TableList';

const Dashboard = () => {
  const { activeConnection } = useDatabase();
  const navigate = useNavigate();
  
  // Redirect to login if not connected
  useEffect(() => {
    if (!activeConnection) {
      navigate('/');
    }
  }, [activeConnection, navigate]);
  
  if (!activeConnection) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <div className="grid gap-6">
          <section>
            <h2 className="text-3xl font-medium tracking-tight mb-6">Database Explorer</h2>
            <TableList />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
