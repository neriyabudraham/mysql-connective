
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { activeConnection } = useDatabase();
  const location = useLocation();

  // אם בטעינה, הצג מסך טעינה
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // אם המשתמש לא מחובר, הפנה לדף ההתחברות עם המיקום הנוכחי
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // אם המשתמש מחובר אך אין חיבור לדאטאבייס והוא מנסה להיכנס לדף שדורש חיבור
  if (!activeConnection && location.pathname !== '/connect' && location.pathname.includes('/dashboard')) {
    return <Navigate to="/connect" replace />;
  }

  // המשתמש מחובר, הצג את תוכן הדף
  return <>{children}</>;
};

export default ProtectedRoute;
