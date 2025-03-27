import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// משתמשים לדוגמה - במערכת אמיתית זה יהיה בשרת
const DEMO_USERS = [
  { id: '1', username: 'admin', password: 'admin123' },
  { id: '2', username: 'user', password: 'user123' }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // בדיקה אם המשתמש מחובר כבר בעת טעינת האפליקציה
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // סימולציה של בקשת התחברות לשרת
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // חיפוש המשתמש בנתונים לדוגמה
      const foundUser = DEMO_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (foundUser) {
        // שמירת פרטי המשתמש ללא הסיסמה
        const userData: User = {
          id: foundUser.id,
          username: foundUser.username
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: 'התחברות בוצעה בהצלחה',
          description: `ברוך הבא, ${userData.username}!`,
        });
        
        return true;
      } else {
        toast({
          title: 'התחברות נכשלה',
          description: 'שם משתמש או סיסמה שגויים',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'שגיאת התחברות',
        description: 'אירעה שגיאה בעת ניסיון ההתחברות',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // סימולציה של בקשת רישום לשרת
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // בדיקה אם שם המשתמש כבר קיים
      const userExists = DEMO_USERS.some(u => u.username === username);
      
      if (userExists) {
        toast({
          title: 'הרשמה נכשלה',
          description: 'שם המשתמש כבר קיים במערכת',
          variant: 'destructive',
        });
        return false;
      }
      
      // יצירת משתמש חדש
      const newUserId = (Math.max(...DEMO_USERS.map(u => parseInt(u.id))) + 1).toString();
      
      const newUser = {
        id: newUserId,
        username,
        password
      };
      
      // במערכת אמיתית, נשלח את המשתמש החדש לשרת
      // כאן אנחנו רק מוסיפים אותו למערך המשתמשים המקומי
      DEMO_USERS.push(newUser);
      
      // שמירת פרטי המשתמש ללא הסיסמה
      const userData: User = {
        id: newUser.id,
        username: newUser.username
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: 'הרשמה בוצעה בהצלחה',
        description: `ברוך הבא, ${userData.username}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'שגיאת הרשמה',
        description: 'אירעה שגיאה בעת ניסיון ההרשמה',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
    toast({
      title: 'התנתקות בוצעה בהצלחה',
      description: 'אתה מנותק כעת מהמערכת',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
