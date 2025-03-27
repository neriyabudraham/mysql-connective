
import React, { createContext, useContext, useState, useEffect } from 'react';
import databaseService from '@/utils/databaseService';
import { useAuth } from '@/context/AuthContext';

export interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  connected: boolean;
}

export interface TableInfo {
  name: string;
  schema: string;
}

interface DatabaseContextType {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  tables: TableInfo[];
  addConnection: (connection: Omit<DatabaseConnection, 'id' | 'connected'>) => Promise<boolean>;
  removeConnection: (id: string) => void;
  setActiveConnection: (id: string) => void;
  disconnectDatabase: () => void;
  refreshTables: () => Promise<TableInfo[]>;
  loading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // תטען את החיבורים השמורים מלוקל סטורג' עבור המשתמש הנוכחי
  useEffect(() => {
    if (user) {
      const savedConnections = localStorage.getItem(`databaseConnections_${user.id}`);
      const activeConnectionId = localStorage.getItem(`activeConnection_${user.id}`);
      
      if (savedConnections) {
        try {
          const parsed = JSON.parse(savedConnections);
          setConnections(parsed);
          console.log('Loaded saved connections for user:', user.id, parsed);
          
          // אם יש חיבור פעיל, נסה לחבר אליו
          if (activeConnectionId) {
            const active = parsed.find((conn: DatabaseConnection) => conn.id === activeConnectionId);
            if (active) {
              switchActiveConnection(active.id);
            }
          }
        } catch (err) {
          console.error('Failed to parse saved connections:', err);
        }
      }
    } else {
      // אם אין משתמש מחובר, איפוס החיבורים
      setConnections([]);
      setActiveConnection(null);
      setTables([]);
    }
  }, [user]);

  // שמור את החיבורים ל-localStorage כשהם משתנים
  useEffect(() => {
    if (user && connections.length > 0) {
      localStorage.setItem(`databaseConnections_${user.id}`, JSON.stringify(connections));
    }
  }, [connections, user]);

  // שמור את החיבור הפעיל ל-localStorage כשהוא משתנה
  useEffect(() => {
    if (user && activeConnection) {
      localStorage.setItem(`activeConnection_${user.id}`, activeConnection.id);
    } else if (user) {
      localStorage.removeItem(`activeConnection_${user.id}`);
    }
  }, [activeConnection, user]);

  // הוסף חיבור חדש למסד נתונים
  const addConnection = async (connectionDetails: Omit<DatabaseConnection, 'id' | 'connected'>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to connect with:', connectionDetails);
      
      // נסה להתחבר למסד הנתונים
      const success = await databaseService.connect(
        connectionDetails.host,
        connectionDetails.port,
        connectionDetails.username,
        connectionDetails.password,
        connectionDetails.database
      );
      
      if (success) {
        console.log('Connection successful');
        
        const newConnection: DatabaseConnection = {
          ...connectionDetails,
          id: Date.now().toString(),
          connected: true
        };
        
        setConnections(prev => [...prev, newConnection]);
        setActiveConnection(newConnection);
        
        // טען טבלאות עבור החיבור החדש
        await refreshTables();
        return true;
      } else {
        setError('Connection failed. Please check your credentials and ensure the database is accessible.');
        return false;
      }
    } catch (err) {
      console.error('Connection error:', err);
      if (err instanceof Error) {
        setError(`Connection error: ${err.message}`);
      } else {
        setError('An unknown error occurred while connecting to the database.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // הסר חיבור למסד נתונים
  const removeConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    
    // אם החיבור הפעיל הוסר, אפס אותו
    if (activeConnection?.id === id) {
      setActiveConnection(null);
      setTables([]);
    }
  };

  // קבע את החיבור הפעיל למסד נתונים
  const switchActiveConnection = async (id: string) => {
    const connection = connections.find(conn => conn.id === id);
    if (connection) {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Switching to connection:', connection);
        
        // התחבר מחדש למסד הנתונים
        const success = await databaseService.connect(
          connection.host,
          connection.port,
          connection.username,
          connection.password,
          connection.database
        );
        
        if (success) {
          setActiveConnection(connection);
          await refreshTables();
        } else {
          setError('Failed to reconnect to the database. The connection may no longer be valid.');
        }
      } catch (err) {
        console.error('Reconnection error:', err);
        if (err instanceof Error) {
          setError(`Reconnection error: ${err.message}`);
        } else {
          setError('An unknown error occurred while reconnecting to the database.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // התנתק ממסד הנתונים הנוכחי
  const disconnectDatabase = () => {
    setActiveConnection(null);
    setTables([]);
    if (user) {
      localStorage.removeItem(`activeConnection_${user.id}`);
    }
  };

  // רענן את רשימת הטבלאות עבור החיבור הפעיל
  const refreshTables = async (): Promise<TableInfo[]> => {
    if (!activeConnection) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching tables for database:', activeConnection.database);
      
      // שלוף טבלאות משירות מסד הנתונים
      const tableNames = await databaseService.getTables(activeConnection.database);
      
      // המר לפורמט TableInfo
      const tableInfos: TableInfo[] = tableNames.map(name => ({
        name,
        schema: 'public' // ברירת מחדל לסכמה, יחזור מה-DB האמיתי
      }));
      
      console.log('Retrieved tables:', tableInfos);
      setTables(tableInfos);
      return tableInfos;
    } catch (err) {
      console.error('Error fetching tables:', err);
      if (err instanceof Error) {
        setError(`Failed to fetch tables: ${err.message}`);
      } else {
        setError('An unknown error occurred while fetching tables.');
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        connections,
        activeConnection,
        tables,
        addConnection,
        removeConnection,
        setActiveConnection: switchActiveConnection,
        disconnectDatabase,
        refreshTables,
        loading,
        error
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

// עזר Hook לשימוש בקונטקסט מסד הנתונים
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
