
import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load saved connections from localStorage on initial render
  useEffect(() => {
    const savedConnections = localStorage.getItem('databaseConnections');
    if (savedConnections) {
      try {
        setConnections(JSON.parse(savedConnections));
      } catch (err) {
        console.error('Failed to parse saved connections:', err);
      }
    }
  }, []);

  // Save connections to localStorage when they change
  useEffect(() => {
    localStorage.setItem('databaseConnections', JSON.stringify(connections));
  }, [connections]);

  // Add a new database connection
  const addConnection = async (connectionDetails: Omit<DatabaseConnection, 'id' | 'connected'>) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate connecting to the database
      // In a real app, you would make an API call to test the connection
      const success = await testDatabaseConnection(connectionDetails);
      
      if (success) {
        const newConnection: DatabaseConnection = {
          ...connectionDetails,
          id: Date.now().toString(),
          connected: true
        };
        
        setConnections(prev => [...prev, newConnection]);
        setActiveConnection(newConnection);
        
        // Load tables for the new connection
        await refreshTables();
        return true;
      } else {
        setError('Failed to connect to the database. Please check your credentials.');
        return false;
      }
    } catch (err) {
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

  // Remove a database connection
  const removeConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    
    // If the active connection is removed, reset it
    if (activeConnection?.id === id) {
      setActiveConnection(null);
      setTables([]);
    }
  };

  // Set the active database connection
  const switchActiveConnection = (id: string) => {
    const connection = connections.find(conn => conn.id === id);
    if (connection) {
      setActiveConnection(connection);
      refreshTables();
    }
  };

  // Disconnect from the current database
  const disconnectDatabase = () => {
    setActiveConnection(null);
    setTables([]);
  };

  // Refresh the list of tables for the active connection
  const refreshTables = async (): Promise<TableInfo[]> => {
    if (!activeConnection) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate fetching tables
      // In a real app, you would make an API call to get the tables
      const tables = await getDatabaseTables(activeConnection);
      setTables(tables);
      return tables;
    } catch (err) {
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

// Helper hook to use the database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

// Mock functions for testing/development purposes

async function testDatabaseConnection(
  connection: Omit<DatabaseConnection, 'id' | 'connected'>
): Promise<boolean> {
  // This is a mock implementation. In a real app, you would make an API call to test the connection.
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
  
  // Always succeed for now (in development)
  return true;
  
  // For testing error states, you could return false or throw an error:
  // throw new Error("Could not connect to database server");
}

async function getDatabaseTables(connection: DatabaseConnection): Promise<TableInfo[]> {
  // This is a mock implementation. In a real app, you would make an API call to get the tables.
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
  
  // Return some mock tables
  return [
    { name: 'users', schema: 'public' },
    { name: 'products', schema: 'public' },
    { name: 'orders', schema: 'public' },
    { name: 'customers', schema: 'public' },
    { name: 'inventory', schema: 'warehouse' }
  ];
}
