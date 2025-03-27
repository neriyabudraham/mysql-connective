// This service handles database operations.
// It currently has mock data, but can be modified to connect to a real MySQL database

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
  private useRealConnection: boolean = false;

  private constructor() {
    // Initialize with empty mock data as fallback
    this.mockData = {};
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Connect to a real database
  public async connect(
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would establish a connection
      // to a MySQL server using the provided credentials
      this.useRealConnection = true;
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`Connecting to MySQL database: ${database} on ${host}:${port}`);
      
      // For now, always return success
      // In a production environment, this would actually test the connection
      return true;
      
    } catch (error) {
      console.error("Database connection error:", error);
      this.useRealConnection = false;
      return false;
    }
  }

  // Fetch table names from the database
  public async getTables(database: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (this.useRealConnection) {
      // This would fetch actual tables from the MySQL database
      // For now, returning a placeholder set of real-looking tables
      return [
        'customers',
        'orders',
        'products',
        'employees',
        'inventory',
        'suppliers',
        'categories',
        'payments'
      ];
    }
    
    return Object.keys(this.mockData);
  }

  // Fetch table schema
  public async getTableSchema(tableName: string): Promise<Column[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (this.useRealConnection) {
      // This would fetch the actual schema from MySQL
      // Returning realistic column definitions for common tables
      
      const schemas: Record<string, Column[]> = {
        'customers': [
          { name: 'id', type: 'int', nullable: false },
          { name: 'first_name', type: 'varchar', nullable: false },
          { name: 'last_name', type: 'varchar', nullable: false },
          { name: 'email', type: 'varchar', nullable: false },
          { name: 'phone', type: 'varchar', nullable: true },
          { name: 'address', type: 'text', nullable: true },
          { name: 'created_at', type: 'timestamp', nullable: false }
        ],
        'orders': [
          { name: 'id', type: 'int', nullable: false },
          { name: 'customer_id', type: 'int', nullable: false },
          { name: 'order_date', type: 'timestamp', nullable: false },
          { name: 'status', type: 'varchar', nullable: false },
          { name: 'total_amount', type: 'decimal', nullable: false }
        ],
        'products': [
          { name: 'id', type: 'int', nullable: false },
          { name: 'name', type: 'varchar', nullable: false },
          { name: 'description', type: 'text', nullable: true },
          { name: 'price', type: 'decimal', nullable: false },
          { name: 'stock', type: 'int', nullable: false },
          { name: 'category_id', type: 'int', nullable: true }
        ],
        'employees': [
          { name: 'id', type: 'int', nullable: false },
          { name: 'first_name', type: 'varchar', nullable: false },
          { name: 'last_name', type: 'varchar', nullable: false },
          { name: 'position', type: 'varchar', nullable: false },
          { name: 'hire_date', type: 'date', nullable: false },
          { name: 'salary', type: 'decimal', nullable: false }
        ]
      };
      
      // Return schema if available, otherwise return a default schema
      return schemas[tableName] || [
        { name: 'id', type: 'int', nullable: false },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'description', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: false }
      ];
    }
    
    return this.mockData[tableName]?.columns || [];
  }

  // Query data from a table
  public async queryTable(
    tableName: string,
    options: QueryOptions = {}
  ): Promise<QueryResult> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (this.useRealConnection) {
      // This would execute an actual SQL query to MySQL
      // For now, generating realistic looking data based on the table name
      
      const columns = await this.getTableSchema(tableName);
      let rows: Row[] = [];
      
      // Generate example data based on table name
      switch (tableName) {
        case 'customers':
          rows = this.generateCustomersData(20);
          break;
        case 'orders':
          rows = this.generateOrdersData(15);
          break;
        case 'products':
          rows = this.generateProductsData(25);
          break;
        case 'employees':
          rows = this.generateEmployeesData(10);
          break;
        default:
          // Generate generic data for other tables
          rows = this.generateGenericData(columns, 15);
      }
      
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
      
      return { columns, rows, total };
    }
    
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

  // Update a row in a table
  public async updateRow(
    tableName: string,
    id: number | string,
    data: Record<string, any>
  ): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (this.useRealConnection) {
      // This would execute an UPDATE SQL query to MySQL
      console.log(`Updating row ${id} in table ${tableName}:`, data);
      return true;
    }
    
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
  
  // Helper methods to generate realistic sample data
  
  private generateCustomersData(count: number): Row[] {
    const customers: Row[] = [];
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
      
      customers.push({
        id: i + 1,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        address: `${Math.floor(100 + Math.random() * 9900)} Main St, City`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString()
      });
    }
    
    return customers;
  }
  
  private generateOrdersData(count: number): Row[] {
    const orders: Row[] = [];
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    for (let i = 0; i < count; i++) {
      const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
      
      orders.push({
        id: i + 1,
        customer_id: Math.floor(1 + Math.random() * 20),
        order_date: orderDate.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total_amount: parseFloat((50 + Math.random() * 950).toFixed(2))
      });
    }
    
    return orders;
  }
  
  private generateProductsData(count: number): Row[] {
    const products: Row[] = [];
    const productNames = ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Speaker', 'Camera', 'Printer'];
    
    for (let i = 0; i < count; i++) {
      const name = productNames[i % productNames.length];
      
      products.push({
        id: i + 1,
        name: `${name} ${String.fromCharCode(65 + i % 26)}${i + 1}`,
        description: `High-quality ${name.toLowerCase()} with advanced features`,
        price: parseFloat((50 + Math.random() * 950).toFixed(2)),
        stock: Math.floor(10 + Math.random() * 90),
        category_id: Math.floor(1 + Math.random() * 5)
      });
    }
    
    return products;
  }
  
  private generateEmployeesData(count: number): Row[] {
    const employees: Row[] = [];
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'];
    const positions = ['Manager', 'Developer', 'Designer', 'Analyst', 'Sales Representative', 'HR Specialist'];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const hireDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 3 * 24 * 60 * 60 * 1000));
      
      employees.push({
        id: i + 1,
        first_name: firstName,
        last_name: lastName,
        position: positions[Math.floor(Math.random() * positions.length)],
        hire_date: hireDate.toISOString().split('T')[0],
        salary: parseFloat((40000 + Math.random() * 60000).toFixed(2))
      });
    }
    
    return employees;
  }
  
  private generateGenericData(columns: Column[], count: number): Row[] {
    const rows: Row[] = [];
    
    for (let i = 0; i < count; i++) {
      const row: Row = {};
      
      columns.forEach(column => {
        if (column.name === 'id') {
          row[column.name] = i + 1;
        } else if (column.type.includes('int')) {
          row[column.name] = Math.floor(Math.random() * 1000);
        } else if (column.type.includes('decimal') || column.type.includes('float')) {
          row[column.name] = parseFloat((Math.random() * 1000).toFixed(2));
        } else if (column.type.includes('date') || column.type.includes('time')) {
          row[column.name] = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString();
        } else {
          row[column.name] = `Sample ${column.name} ${i + 1}`;
        }
      });
      
      rows.push(row);
    }
    
    return rows;
  }
}

export default DatabaseService.getInstance();
