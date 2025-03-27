import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Info, Loader2, ArrowLeft } from 'lucide-react';

const Register = () => {
  const { register, user, isLoading } = useAuth();
  const { activeConnection } = useDatabase();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // אם המשתמש כבר מחובר, הפנה לדף הראשי
  useEffect(() => {
    if (user && !isLoading) {
      if (activeConnection) {
        navigate('/dashboard');
      } else {
        navigate('/connect');
      }
    }
  }, [user, isLoading, activeConnection, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      toast({
        title: 'שגיאה',
        description: 'יש למלא את כל השדות',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'שגיאה',
        description: 'הסיסמאות אינן תואמות',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: 'שגיאה',
        description: 'הסיסמה חייבת להכיל לפחות 6 תווים',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await register(username, password);
      
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // אם בטעינה, הצג מסך טעינה
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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
          צור חשבון חדש כדי להתחיל להשתמש במערכת
        </p>
      </div>
      
      <Card className="w-full max-w-md glass-card animate-fadeIn">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-medium">הרשמה</CardTitle>
          <CardDescription>
            צור חשבון חדש במערכת
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">שם משתמש</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הזן שם משתמש"
                className="focus-ring"
                autoComplete="username"
                required
                dir="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזן סיסמה"
                className="focus-ring"
                autoComplete="new-password"
                required
                dir="rtl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אימות סיסמה</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן את הסיסמה שוב"
                className="focus-ring"
                autoComplete="new-password"
                required
                dir="rtl"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>מבצע רישום...</span>
                </>
              ) : (
                <span>הרשם</span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2 border-t pt-4 px-6">
          <Button variant="ghost" asChild className="w-full">
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              חזרה למסך ההתחברות
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            המערכת מאפשרת ניהול ושמירת חיבורים למסדי נתונים שונים
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
