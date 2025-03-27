
// This service handles database operations through a backend API.
// Browser-based applications CANNOT connect directly to a MySQL database.
// This service communicates with your backend API.

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Row {
  [key: string]: any;
}

export interface QueryResult {
  columns: Column[];
  rows: Row[];
  total: number;
}

export interface QueryOptions {
  filters?: Record<string, any>;
  sort?: { column: string; direction: 'asc' | 'desc' };
  page?: number;
  pageSize?: number;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private connectionDetails: { 
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  } | null = null;
  private connected: boolean = false;
  private apiBaseUrl: string = ''; // כאן יש להזין את כתובת ה-API שלך, למשל: 'https://your-api.example.com/api'

  private constructor() {
    // Initialize empty
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // הגדר את כתובת ה-API
  public setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }

  // התחבר לבסיס נתונים דרך ה-API
  public async connect(
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
  ): Promise<boolean> {
    try {
      console.log(`Attempting to connect to MySQL database: ${database} on ${host}:${port} via API`);
      
      if (!this.apiBaseUrl) {
        throw new Error("API URL not set. Please call setApiBaseUrl() first.");
      }
      
      // שליחת בקשת התחברות ל-API
      const response = await fetch(`${this.apiBaseUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host,
          port,
          username,
          password,
          database
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Connection failed");
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.connectionDetails = {
          host,
          port,
          username,
          password,
          database
        };
        
        this.connected = true;
        return true;
      } else {
        throw new Error(result.message || "Connection failed");
      }
    } catch (error) {
      console.error("Database connection error:", error);
      this.connected = false;
      throw error;
    }
  }

  // קבל רשימת טבלאות מבסיס הנתונים דרך ה-API
  public async getTables(database: string): Promise<string[]> {
    if (!this.connected || !this.connectionDetails) {
      throw new Error("Not connected to database");
    }
    
    console.log(`Fetching tables for database: ${database} via API`);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/tables?database=${encodeURIComponent(database)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tables");
      }
      
      const result = await response.json();
      return result.tables;
    } catch (error) {
      console.error("Error fetching tables:", error);
      throw error;
    }
  }

  // קבל סכמה של טבלה דרך ה-API
  public async getTableSchema(tableName: string): Promise<Column[]> {
    if (!this.connected || !this.connectionDetails) {
      throw new Error("Not connected to database");
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/schema/${encodeURIComponent(tableName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch table schema");
      }
      
      const result = await response.json();
      return result.columns;
    } catch (error) {
      console.error("Error fetching table schema:", error);
      throw error;
    }
  }

  // שאילתת נתונים מטבלה דרך ה-API
  public async queryTable(
    tableName: string,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    if (!this.connected || !this.connectionDetails) {
      throw new Error("Not connected to database");
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/query/${encodeURIComponent(tableName)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Query failed");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error querying table:", error);
      throw error;
    }
  }
  
  // עדכון שורה בטבלה דרך ה-API
  public async updateRow(
    tableName: string, 
    id: any, 
    updatedData: Record<string, any>
  ): Promise<boolean> {
    if (!this.connected || !this.connectionDetails) {
      throw new Error("Not connected to database");
    }
    
    console.log(`Updating row with ID ${id} in table: ${tableName}`, updatedData);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/update/${encodeURIComponent(tableName)}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Update failed");
      }
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error updating row:", error);
      throw error;
    }
  }
}

export default DatabaseService.getInstance();
