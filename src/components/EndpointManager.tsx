
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Link, Trash2, Plus, Copy, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDatabase } from '@/context/DatabaseContext';

interface EndpointManagerProps {
  tableName: string;
}

interface Endpoint {
  id: string;
  tableName: string;
  token: string;
  createdAt: string;
}

const EndpointManager: React.FC<EndpointManagerProps> = ({ tableName }) => {
  const { toast } = useToast();
  const { activeConnection } = useDatabase();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Load endpoints from localStorage
  useEffect(() => {
    if (activeConnection) {
      const savedEndpoints = localStorage.getItem(`endpoints_${activeConnection.id}`);
      if (savedEndpoints) {
        try {
          const allEndpoints = JSON.parse(savedEndpoints) as Endpoint[];
          // Filter endpoints for this table
          const tableEndpoints = allEndpoints.filter(ep => ep.tableName === tableName);
          setEndpoints(tableEndpoints);
        } catch (err) {
          console.error('Failed to parse saved endpoints:', err);
        }
      }
    }
  }, [activeConnection, tableName]);
  
  // Save endpoints to localStorage
  const saveEndpoints = (newEndpoints: Endpoint[]) => {
    if (activeConnection) {
      // Get all endpoints
      const savedEndpoints = localStorage.getItem(`endpoints_${activeConnection.id}`);
      let allEndpoints: Endpoint[] = [];
      
      if (savedEndpoints) {
        try {
          allEndpoints = JSON.parse(savedEndpoints) as Endpoint[];
          // Remove endpoints for this table
          allEndpoints = allEndpoints.filter(ep => ep.tableName !== tableName);
        } catch (err) {
          console.error('Failed to parse saved endpoints:', err);
        }
      }
      
      // Add new endpoints for this table
      allEndpoints = [...allEndpoints, ...newEndpoints];
      localStorage.setItem(`endpoints_${activeConnection.id}`, JSON.stringify(allEndpoints));
    }
  };
  
  const createEndpoint = () => {
    setIsLoading(true);
    
    // Generate a random token (in a real app, this would be more secure)
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    const newEndpoint: Endpoint = {
      id: Date.now().toString(),
      tableName,
      token,
      createdAt: new Date().toISOString()
    };
    
    // Add to state
    const newEndpoints = [...endpoints, newEndpoint];
    setEndpoints(newEndpoints);
    
    // Save to localStorage
    saveEndpoints(newEndpoints);
    
    toast({
      title: "נקודת קצה נוצרה",
      description: "נקודת קצה חדשה לטבלה נוצרה בהצלחה",
    });
    
    setIsLoading(false);
  };
  
  const deleteEndpoint = (id: string) => {
    const newEndpoints = endpoints.filter(ep => ep.id !== id);
    setEndpoints(newEndpoints);
    
    // Save to localStorage
    saveEndpoints(newEndpoints);
    
    toast({
      title: "נקודת קצה נמחקה",
      description: "נקודת הקצה נמחקה בהצלחה",
    });
  };
  
  const copyEndpointUrl = (token: string) => {
    // Construct the API URL for this endpoint
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api/${tableName}?token=${token}`;
    
    navigator.clipboard.writeText(apiUrl);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "כתובת URL הועתקה",
      description: "כתובת הגישה לנקודת הקצה הועתקה ללוח",
    });
  };
  
  return (
    <div className="flex items-center gap-2">
      {endpoints.length === 0 ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7"
          onClick={createEndpoint}
          disabled={isLoading}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          צור נקודת קצה
        </Button>
      ) : (
        <>
          {endpoints.map((endpoint) => (
            <Popover key={endpoint.id}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs h-7">
                  <Link className="h-3.5 w-3.5 mr-1" />
                  נקודת קצה
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium">נקודת קצה לטבלה {tableName}</h4>
                  <p className="text-xs text-muted-foreground">
                    כתובת זו מאפשרת גישה ישירה לנתונים ללא צורך בהתחברות
                  </p>
                  
                  <div className="flex items-center justify-between text-xs p-2 rounded bg-muted font-mono">
                    <div className="truncate">
                      {window.location.origin}/api/{tableName}?token={endpoint.token.substring(0, 10)}...
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyEndpointUrl(endpoint.token)}
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
                      onClick={() => deleteEndpoint(endpoint.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      מחק נקודת קצה
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7"
            onClick={createEndpoint}
            disabled={isLoading}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            צור נקודת קצה נוספת
          </Button>
        </>
      )}
    </div>
  );
};

export default EndpointManager;
