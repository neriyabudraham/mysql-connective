
// This is a mock service that simulates database operations
// In a real application, this would make actual API calls to a backend service

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
  private mockData: Record<string, QueryResult> = {};

  private constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Simulate connecting to a database
  public async connect(
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
  ): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For development, always return success
    // In production, this would actually attempt to connect
    return true;
  }

  // Simulate fetching table names from a database
  public async getTables(database: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.keys(this.mockData);
  }

  // Simulate fetching table schema
  public async getTableSchema(tableName: string): Promise<Column[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockData[tableName]?.columns || [];
  }

  // Simulate querying data from a table
  public async queryTable(
    tableName: string,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!this.mockData[tableName]) {
      throw new Error(`Table ${tableName} not found`);
    }
    
    let rows = [...this.mockData[tableName].rows];
    
    // Apply filters if provided
    if (options.filters) {
      rows = rows.filter(row => {
        return Object.entries(options.filters || {}).every(([key, value]) => {
          if (value === undefined || value === null || value === '') return true;
          return String(row[key]).toLowerCase().includes(String(value).toLowerCase());
        });
      });
    }
    
    // Apply sorting if provided
    if (options.sort) {
      const { column, direction } = options.sort;
      rows.sort((a, b) => {
        if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Calculate total before pagination
    const total = rows.length;
    
    // Apply pagination if provided
    if (options.page !== undefined && options.pageSize !== undefined) {
      const start = options.page * options.pageSize;
      rows = rows.slice(start, start + options.pageSize);
    }
    
    return {
      columns: this.mockData[tableName].columns,
      rows,
      total
    };
  }

  // Simulate updating a row in a table
  public async updateRow(
    tableName: string,
    id: number | string,
    data: Record<string, any>
  ): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!this.mockData[tableName]) {
      throw new Error(`Table ${tableName} not found`);
    }
    
    const idField = this.mockData[tableName].columns.find(col => col.name === 'id')?.name || 'id';
    
    const index = this.mockData[tableName].rows.findIndex(row => row[idField] === id);
    if (index === -1) {
      throw new Error(`Row with id ${id} not found in table ${tableName}`);
    }
    
    this.mockData[tableName].rows[index] = {
      ...this.mockData[tableName].rows[index],
      ...data
    };
    
    return true;
  }

  // Initialize mock data for development/testing
  private initializeMockData() {
    // Users table
    this.mockData['users'] = {
      columns: [
        { name: 'id', type: 'int', nullable: false },
        { name: 'username', type: 'varchar', nullable: false },
        { name: 'email', type: 'varchar', nullable: false },
        { name: 'created_at', type: 'timestamp', nullable: false },
        { name: 'is_active', type: 'boolean', nullable: false }
      ],
      rows: [
        { id: 1, username: 'john_doe', email: 'john@example.com', created_at: '2023-01-15T08:30:00', is_active: true },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', created_at: '2023-01-20T14:45:00', is_active: true },
        { id: 3, username: 'bob_johnson', email: 'bob@example.com', created_at: '2023-02-05T11:15:00', is_active: false },
        { id: 4, username: 'alice_williams', email: 'alice@example.com', created_at: '2023-02-10T09:00:00', is_active: true },
        { id: 5, username: 'charlie_brown', email: 'charlie@example.com', created_at: '2023-03-01T16:20:00', is_active: true }
      ],
      total: 5
    };

    // Products table
    this.mockData['products'] = {
      columns: [
        { name: 'id', type: 'int', nullable: false },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'price', type: 'decimal', nullable: false },
        { name: 'stock', type: 'int', nullable: false },
        { name: 'category', type: 'varchar', nullable: true }
      ],
      rows: [
        { id: 1, name: 'Laptop', price: 999.99, stock: 50, category: 'Electronics' },
        { id: 2, name: 'Smartphone', price: 699.99, stock: 100, category: 'Electronics' },
        { id: 3, name: 'Headphones', price: 149.99, stock: 200, category: 'Audio' },
        { id: 4, name: 'Monitor', price: 299.99, stock: 30, category: 'Electronics' },
        { id: 5, name: 'Keyboard', price: 79.99, stock: 150, category: 'Accessories' },
        { id: 6, name: 'Mouse', price: 49.99, stock: 200, category: 'Accessories' },
        { id: 7, name: 'Tablet', price: 399.99, stock: 75, category: 'Electronics' },
        { id: 8, name: 'Printer', price: 199.99, stock: 25, category: 'Office' }
      ],
      total: 8
    };

    // Orders table
    this.mockData['orders'] = {
      columns: [
        { name: 'id', type: 'int', nullable: false },
        { name: 'user_id', type: 'int', nullable: false },
        { name: 'total_amount', type: 'decimal', nullable: false },
        { name: 'status', type: 'varchar', nullable: false },
        { name: 'order_date', type: 'timestamp', nullable: false }
      ],
      rows: [
        { id: 1, user_id: 1, total_amount: 1249.98, status: 'Completed', order_date: '2023-03-10T10:30:00' },
        { id: 2, user_id: 2, total_amount: 699.99, status: 'Completed', order_date: '2023-03-12T14:15:00' },
        { id: 3, user_id: 3, total_amount: 479.97, status: 'Processing', order_date: '2023-03-15T09:45:00' },
        { id: 4, user_id: 1, total_amount: 199.99, status: 'Shipped', order_date: '2023-03-18T16:00:00' },
        { id: 5, user_id: 4, total_amount: 1029.97, status: 'Pending', order_date: '2023-03-20T11:30:00' }
      ],
      total: 5
    };
  }
}

export default DatabaseService.getInstance();
