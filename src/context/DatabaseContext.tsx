
import React, { createContext, useContext, useState, useEffect } from 'react';
import databaseService from '@/utils/databaseService';

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
        const parsed = JSON.parse(savedConnections);
        setConnections(parsed);
        console.log('Loaded saved connections:', parsed);
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
      console.log('Attempting to connect with:', connectionDetails);
      
      // Attempt to connect to the database
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
        
        // Load tables for the new connection
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
  const switchActiveConnection = async (id: string) => {
    const connection = connections.find(conn => conn.id === id);
    if (connection) {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Switching to connection:', connection);
        
        // Reconnect to the database
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
      console.log('Fetching tables for database:', activeConnection.database);
      
      // Fetch tables from the database service
      const tableNames = await databaseService.getTables(activeConnection.database);
      
      // Convert to TableInfo format
      const tableInfos: TableInfo[] = tableNames.map(name => ({
        name,
        schema: 'public' // Default schema, would be fetched from real DB
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

// Helper hook to use the database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
