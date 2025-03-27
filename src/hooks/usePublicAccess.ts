
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UsePublicAccessProps {
  securityHeaders: Record<string, string>;
}

export const usePublicAccess = ({ securityHeaders }: UsePublicAccessProps) => {
  const { toast } = useToast();
  const [loadingTables, setLoadingTables] = useState<Record<string, boolean>>({});
  const [publicTables, setPublicTables] = useState<string[]>([]);

  const apiUrl = 'https://mysql.neriyabudraham.co.il/api/public-access';

  const makeTablePublic = async (tableName: string) => {
    setLoadingTables(prev => ({ ...prev, [tableName]: true }));
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...securityHeaders
        },
        body: JSON.stringify({ table: tableName })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setPublicTables(prev => [...prev, tableName]);
      
      toast({
        title: "הטבלה הפכה לציבורית",
        description: `הטבלה ${tableName} זמינה כעת לגישה ציבורית`
      });
      
      return true;
    } catch (error) {
      console.error("Error making table public:", error);
      
      toast({
        title: "שגיאה בהפיכת הטבלה לציבורית",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoadingTables(prev => ({ ...prev, [tableName]: false }));
    }
  };

  const removePublicAccess = async (tableName: string) => {
    setLoadingTables(prev => ({ ...prev, [tableName]: true }));
    
    try {
      const response = await fetch(`${apiUrl}/${tableName}`, {
        method: 'DELETE',
        headers: securityHeaders
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      setPublicTables(prev => prev.filter(table => table !== tableName));
      
      toast({
        title: "הגישה הציבורית הוסרה",
        description: `הטבלה ${tableName} אינה זמינה יותר לגישה ציבורית`
      });
      
      return true;
    } catch (error) {
      console.error("Error removing public access:", error);
      
      toast({
        title: "שגיאה בהסרת גישה ציבורית",
        description: error instanceof Error ? error.message : "אירעה שגיאה לא ידועה",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoadingTables(prev => ({ ...prev, [tableName]: false }));
    }
  };

  const isTablePublic = (tableName: string) => {
    return publicTables.includes(tableName);
  };

  const isLoading = (tableName: string) => {
    return loadingTables[tableName] || false;
  };

  return {
    publicTables,
    setPublicTables,
    makeTablePublic,
    removePublicAccess,
    isTablePublic,
    isLoading
  };
};
