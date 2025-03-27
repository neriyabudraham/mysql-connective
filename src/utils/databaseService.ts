
// This service handles database operations through a REST API.

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
  private apiBaseUrl: string = '';

  private constructor() {
    // Initialize empty
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Set the API base URL
  public setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
    console.log(`API base URL set to: ${url}`);
  }

  // Attempt to connect to a database
  public async connect(
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
  ): Promise<boolean> {
    try {
      console.log(`Attempting to connect to MySQL database: ${database} on ${host}:${port}`);
      
      // Validate basic connection parameters
      if (!host || !username || !database) {
        throw new Error("Missing required connection parameters");
      }
      
      // In this implementation, we're not actually connecting to the database directly
      // Instead, we're storing the connection details to use in API requests
      // You might want to add a test API call here to verify connectivity
      
      // Set the API base URL to the provided MySQL API endpoint
      this.setApiBaseUrl('https://mysql.neriyabudraham.co.il/api');
      
      // Store connection details for reference
      this.connectionDetails = {
        host,
        port,
        username,
        password,
        database
      };
      
      this.connected = true;
      return true;
    } catch (error) {
      console.error("Database connection error:", error);
      this.connected = false;
      throw error; // Re-throw to be handled by the caller
    }
  }

  // Fetch table names from the database via API
  public async getTables(database: string): Promise<string[]> {
    if (!this.connected || !this.apiBaseUrl) {
      throw new Error("Not connected to database or API base URL not set");
    }
    
    console.log(`Fetching tables from API for database: ${database}`);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/tables`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching tables:", error);
      throw error;
    }
  }

  // Fetch table schema (columns) from the API
  public async getTableSchema(tableName: string): Promise<Column[]> {
    if (!this.connected || !this.apiBaseUrl) {
      throw new Error("Not connected to database or API base URL not set");
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/${tableName}/columns`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // The API returns an array of column names
      const columnNames = await response.json();
      
      // Transform to the Column interface format
      // Since the API doesn't provide type and nullable information,
      // we'll set defaults
      return columnNames.map((name: string) => ({
        name,
        type: 'unknown', // Default type since the API doesn't provide it
        nullable: true    // Default nullable since the API doesn't provide it
      }));
    } catch (error) {
      console.error(`Error fetching schema for table ${tableName}:`, error);
      throw error;
    }
  }

  // Query data from a table via API
  public async queryTable(
    tableName: string,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    if (!this.connected || !this.apiBaseUrl) {
      throw new Error("Not connected to database or API base URL not set");
    }
    
    try {
      // Construct the URL with query parameters for filtering, sorting, pagination
      let url = `${this.apiBaseUrl}/${tableName}`;
      const queryParams = new URLSearchParams();
      
      // Add sorting if specified
      if (options.sort) {
        queryParams.append('sort', options.sort.column);
        queryParams.append('order', options.sort.direction);
      }
      
      // Add pagination if specified
      if (options.page !== undefined && options.pageSize !== undefined) {
        queryParams.append('page', options.page.toString());
        queryParams.append('limit', options.pageSize.toString());
      }
      
      // Add filters if specified
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          queryParams.append(`filter[${key}]`, value.toString());
        });
      }
      
      // Append query parameters to URL if there are any
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const rows = await response.json();
      const columns = await this.getTableSchema(tableName);
      
      return {
        columns,
        rows,
        total: rows.length // This might need to be updated if the API provides a total count
      };
    } catch (error) {
      console.error(`Error querying table ${tableName}:`, error);
      throw error;
    }
  }
  
  // Update a row in a table via API
  public async updateRow(
    tableName: string, 
    id: any, 
    updatedData: Record<string, any>
  ): Promise<boolean> {
    if (!this.connected || !this.apiBaseUrl) {
      throw new Error("Not connected to database or API base URL not set");
    }
    
    console.log(`Updating row with ID ${id} in table: ${tableName}`, updatedData);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/${tableName}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating row in table ${tableName}:`, error);
      throw error;
    }
  }
  
  // Create a new row in a table via API
  public async createRow(
    tableName: string,
    data: Record<string, any>
  ): Promise<any> {
    if (!this.connected || !this.apiBaseUrl) {
      throw new Error("Not connected to database or API base URL not set");
    }
    
    console.log(`Creating new row in table: ${tableName}`, data);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/${tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error creating row in table ${tableName}:`, error);
      throw error;
    }
  }
  
  // Delete a row from a table via API
  public async deleteRow(
    tableName: string,
    id: any
  ): Promise<boolean> {
    if (!this.connected || !this.apiBaseUrl) {
      throw new Error("Not connected to database or API base URL not set");
    }
    
    console.log(`Deleting row with ID ${id} from table: ${tableName}`);
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/${tableName}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting row from table ${tableName}:`, error);
      throw error;
    }
  }
}

export default DatabaseService.getInstance();
