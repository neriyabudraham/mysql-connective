
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Link, 
  Link2Off, 
  Globe, 
  Copy, 
  Check 
} from 'lucide-react';
import { usePublicAccess } from '@/hooks/usePublicAccess';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PublicAccessManagerProps {
  tableName: string;
  defaultIsPublic?: boolean;
}

const PublicAccessManager: React.FC<PublicAccessManagerProps> = ({ 
  tableName,
  defaultIsPublic = false
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Security headers for API requests
  const securityHeaders = {
    'X-Frontend-Access': 'neriyabudraham'
  };
  
  const { 
    makeTablePublic, 
    removePublicAccess, 
    isTablePublic, 
    setPublicTables,
    isLoading 
  } = usePublicAccess({ securityHeaders });
  
  // Initialize with default value
  React.useEffect(() => {
    if (defaultIsPublic) {
      setPublicTables(prev => {
        if (!prev.includes(tableName)) {
          return [...prev, tableName];
        }
        return prev;
      });
    }
  }, [defaultIsPublic, tableName, setPublicTables]);
  
  const handleMakePublic = async () => {
    await makeTablePublic(tableName);
  };
  
  const handleRemovePublic = async () => {
    await removePublicAccess(tableName);
  };
  
  const copyPublicUrl = () => {
    const publicUrl = `https://mysql.neriyabudraham.co.il/public/${tableName}`;
    
    navigator.clipboard.writeText(publicUrl);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "כתובת URL הועתקה",
      description: "כתובת הגישה הציבורית הועתקה ללוח"
    });
  };
  
  const isPublic = isTablePublic(tableName);
  const loading = isLoading(tableName);
  
  if (!isPublic) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs h-7"
        onClick={handleMakePublic}
        disabled={loading}
      >
        <Globe className="h-3.5 w-3.5 mr-1" />
        הפוך לציבורית
      </Button>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs h-7 bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
            <Link className="h-3.5 w-3.5 mr-1" />
            גישה ציבורית
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-2">
            <h4 className="font-medium">כתובת גישה ציבורית לטבלה {tableName}</h4>
            <p className="text-xs text-muted-foreground">
              כתובת זו מאפשרת גישה ישירה לנתונים ללא צורך בהתחברות
            </p>
            
            <div className="flex items-center justify-between text-xs p-2 rounded bg-muted font-mono">
              <div className="truncate">
                https://mysql.neriyabudraham.co.il/public/{tableName}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={copyPublicUrl}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={handleRemovePublic}
                disabled={loading}
              >
                <Link2Off className="h-3.5 w-3.5 mr-1" />
                הסר גישה ציבורית
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PublicAccessManager;
