// SQLite database engine simulation for React Local-Only Storage
// Implements SQL statement parsing, relational schema tables, transactional modifications, and export functionality.

export interface SQLResult {
  changes: number;
  lastInsertRowId?: string;
}

class SQLiteDatabase {
  private tables: {
    Products: any[];
    Sales: any[];
    Expenses: any[];
    SystemConfig: { key: string; value: string }[];
  } = {
    Products: [],
    Sales: [],
    Expenses: [],
    SystemConfig: []
  };

  private storageKey = 'akn_sqlite_database_tables';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        this.tables = {
          Products: Array.isArray(parsed.Products) ? parsed.Products : [],
          Sales: Array.isArray(parsed.Sales) ? parsed.Sales : [],
          Expenses: Array.isArray(parsed.Expenses) ? parsed.Expenses : [],
          SystemConfig: Array.isArray(parsed.SystemConfig) ? parsed.SystemConfig : []
        };
      }
    } catch (e) {
      console.error('Failed to load SQLite databases from storage', e);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.tables));
    } catch (e) {
      console.error('Failed to save SQLite state database to storage', e);
    }
  }

  /**
   * Initializes the database with default records if tables are empty.
   */
  public initializeDefaults(products: any[], sales: any[], expenses: any[]) {
    if (this.tables.Products.length === 0) {
      this.tables.Products = [...products];
    }
    if (this.tables.Sales.length === 0) {
      this.tables.Sales = [...sales];
    }
    if (this.tables.Expenses.length === 0) {
      this.tables.Expenses = [...expenses];
    }
    this.saveToStorage();
  }

  /**
   * Main SQL query interface. Parses SELECT statements and returns rows of type T.
   */
  public query<T = any>(sqlStr: string, bindings: any[] = []): T[] {
    const sql = sqlStr.trim();
    const upperSql = sql.toUpperCase();

    if (upperSql.startsWith('SELECT')) {
      // 1. Identify table target
      let tableName: 'Products' | 'Sales' | 'Expenses' | 'SystemConfig' | null = null;
      if (upperSql.includes('FROM PRODUCTS')) tableName = 'Products';
      else if (upperSql.includes('FROM SALES')) tableName = 'Sales';
      else if (upperSql.includes('FROM EXPENSES')) tableName = 'Expenses';
      else if (upperSql.includes('FROM SYSTEMCONFIG')) tableName = 'SystemConfig';

      if (!tableName) return [];

      let rows = [...this.tables[tableName]];

      // Simple single record fetch evaluation (WHERE id = ? or WHERE key = ?)
      if (upperSql.includes('WHERE')) {
        const whereClause = sql.substring(upperSql.indexOf('WHERE') + 5).trim();
        const parts = whereClause.split(/\s*=\s*/);
        const colName = parts[0].trim();
        
        if (bindings.length > 0) {
          const val = bindings[0];
          rows = rows.filter(row => String(row[colName]) === String(val));
        }
      }

      return rows as T[];
    }

    return [];
  }

  /**
   * Execute INSERT, UPDATE, or DELETE SQL statements with bindings.
   */
  public run(sqlStr: string, bindings: any[] = []): SQLResult {
    const sql = sqlStr.trim();
    const upperSql = sql.toUpperCase();
    let changes = 0;
    let lastInsertRowId: string | undefined = undefined;

    try {
      if (upperSql.startsWith('INSERT INTO')) {
        // Parse target table
        let tableName: 'Products' | 'Sales' | 'Expenses' | 'SystemConfig' | null = null;
        if (upperSql.includes('INSERT INTO PRODUCTS')) tableName = 'Products';
        else if (upperSql.includes('INSERT INTO SALES')) tableName = 'Sales';
        else if (upperSql.includes('INSERT INTO EXPENSES')) tableName = 'Expenses';
        else if (upperSql.includes('INSERT INTO SYSTEMCONFIG')) tableName = 'SystemConfig';

        if (!tableName) throw new Error(`Unknown table in SQL query: ${sqlStr}`);

        // Parse column list inside parentheses
        const colMatch = sql.match(/\(([^)]+)\)/);
        if (!colMatch) throw new Error('Could not parse columns in SQL INSERT statement');

        const columns = colMatch[1].split(',').map(c => c.trim());
        
        if (columns.length !== bindings.length) {
          throw new Error(`SQL insertion values count (${bindings.length}) doesn't match columns count (${columns.length})`);
        }

        const newRow: any = {};
        columns.forEach((col, idx) => {
          newRow[col] = bindings[idx];
        });

        // Add to active dataset
        this.tables[tableName].push(newRow);
        changes = 1;
        lastInsertRowId = newRow.id || newRow.key;
        this.saveToStorage();

      } else if (upperSql.startsWith('UPDATE')) {
        let tableName: 'Products' | 'Sales' | 'Expenses' | 'SystemConfig' | null = null;
        if (upperSql.includes('UPDATE PRODUCTS')) tableName = 'Products';
        else if (upperSql.includes('UPDATE SALES')) tableName = 'Sales';
        else if (upperSql.includes('UPDATE EXPENSES')) tableName = 'Expenses';
        else if (upperSql.includes('UPDATE SYSTEMCONFIG')) tableName = 'SystemConfig';

        if (!tableName) throw new Error(`Unknown table in SQL query: ${sqlStr}`);

        // Handle UPDATE with bindings: UPDATE Products SET ... WHERE id = ?
        // By conventions, the last binding is the primary key (id / key) in WHERE id = ?
        if (upperSql.includes('WHERE ID') || upperSql.includes('WHERE KEY')) {
          const idVal = bindings[bindings.length - 1]; // Select ID
          const updateCols = sql.match(/SET([\s\S]+?)WHERE/i);
          
          if (updateCols) {
            const columns = updateCols[1].split(',').map(c => c.trim().split(/\s*=\s*/)[0].trim());
            
            this.tables[tableName] = this.tables[tableName].map(row => {
              const currentId = row.id || row.key;
              if (String(currentId) === String(idVal)) {
                changes++;
                const updatedRow = { ...row };
                columns.forEach((col, idx) => {
                  updatedRow[col] = bindings[idx];
                });
                return updatedRow;
              }
              return row;
            });
            this.saveToStorage();
          }
        }

      } else if (upperSql.startsWith('DELETE FROM')) {
        let tableName: 'Products' | 'Sales' | 'Expenses' | 'SystemConfig' | null = null;
        if (upperSql.includes('DELETE FROM PRODUCTS')) tableName = 'Products';
        else if (upperSql.includes('DELETE FROM SALES')) tableName = 'Sales';
        else if (upperSql.includes('DELETE FROM EXPENSES')) tableName = 'Expenses';
        else if (upperSql.includes('DELETE FROM SYSTEMCONFIG')) tableName = 'SystemConfig';

        if (!tableName) throw new Error(`Unknown table in SQL query: ${sqlStr}`);

        if (upperSql.includes('WHERE ID') || upperSql.includes('WHERE KEY')) {
          const idVal = bindings[0];
          const initialLen = this.tables[tableName].length;
          
          this.tables[tableName] = this.tables[tableName].filter(row => {
            const currentId = row.id || row.key;
            return String(currentId) !== String(idVal);
          });

          changes = initialLen - this.tables[tableName].length;
          this.saveToStorage();
        }
      } else if (upperSql.startsWith('DROP TABLE') || upperSql.startsWith('CLEAR')) {
        // Operation safety fallback protection
        console.warn("SQL Query blocked by operational locks. DROP, DELETE ALL, or CLEAR commands are forbidden in this portal.");
      }
    } catch (e) {
      console.error('SQLite execution error', e, 'on query:', sqlStr);
    }

    return { changes, lastInsertRowId };
  }

  /**
   * Resets all tables to the initial defaults (re-seeding)
   */
  public resetToDefaults(products: any[], sales: any[], expenses: any[]) {
    this.tables.Products = [...products];
    this.tables.Sales = [...sales];
    this.tables.Expenses = [...expenses];
    this.saveToStorage();
  }

  /**
   * Export the SQLite records as standard SQL query string dump (CREATE + INSERT statements)
   */
  public exportToSQLDump(): string {
    let sql = `-- =========================================================\n`;
    sql += `-- AKN GLOBAL GROUP LTD - LOCAL SQLITE DATABASE TRANSCRIPTION\n`;
    sql += `-- Export Date: ${new Date().toISOString()}\n`;
    sql += `-- Schema: SQLite Dynamic Relational Model (3 Core Tables)\n`;
    sql += `-- =========================================================\n\n`;

    // 1. PRODUCTS TABLE
    sql += `CREATE TABLE IF NOT EXISTS Products (\n`;
    sql += `  id VARCHAR(30) PRIMARY KEY,\n`;
    sql += `  name TEXT NOT NULL,\n`;
    sql += `  barcode TEXT,\n`;
    sql += `  purchasePrice REAL,\n`;
    sql += `  salePrice REAL,\n`;
    sql += `  currentStock INTEGER,\n`;
    sql += `  lowStockThreshold INTEGER,\n`;
    sql += `  category TEXT\n`;
    sql += `);\n\n`;

    this.tables.Products.forEach(p => {
      const cleanName = String(p.name).replace(/'/g, "''");
      const cleanCategory = String(p.category).replace(/'/g, "''");
      sql += `INSERT INTO Products VALUES ('${p.id}', '${cleanName}', '${p.barcode || ''}', ${p.purchasePrice}, ${p.salePrice}, ${p.currentStock}, ${p.lowStockThreshold}, '${cleanCategory}');\n`;
    });

    sql += `\n-- =========================================================\n\n`;

    // 2. SALES TABLE
    sql += `CREATE TABLE IF NOT EXISTS Sales (\n`;
    sql += `  id VARCHAR(30) PRIMARY KEY,\n`;
    sql += `  productId TEXT NOT NULL,\n`;
    sql += `  quantity INTEGER,\n`;
    sql += `  totalAmount REAL,\n`;
    sql += `  date TEXT\n`;
    sql += `);\n\n`;

    this.tables.Sales.forEach(s => {
      sql += `INSERT INTO Sales VALUES ('${s.id}', '${s.productId}', ${s.quantity}, ${s.totalAmount}, '${s.date}');\n`;
    });

    sql += `\n-- =========================================================\n\n`;

    // 3. EXPENSES TABLE
    sql += `CREATE TABLE IF NOT EXISTS Expenses (\n`;
    sql += `  id VARCHAR(30) PRIMARY KEY,\n`;
    sql += `  description TEXT NOT NULL,\n`;
    sql += `  amount REAL,\n`;
    sql += `  category TEXT,\n`;
    sql += `  date TEXT\n`;
    sql += `);\n\n`;

    this.tables.Expenses.forEach(e => {
      const cleanDesc = String(e.description).replace(/'/g, "''");
      const cleanCategory = String(e.category || '').replace(/'/g, "''");
      sql += `INSERT INTO Expenses VALUES ('${e.id}', '${cleanDesc}', ${e.amount}, '${cleanCategory}', '${e.date}');\n`;
    });

    sql += `\n-- End of Backup Dump --\n`;
    return sql;
  }

  /**
   * Export the SQLite tables as standard structured CSV dump
   */
  public exportToCSVDump(tableName: 'Products' | 'Sales' | 'Expenses'): string {
    const list = this.tables[tableName];
    if (list.length === 0) return '';
    
    // Get headers
    const headers = Object.keys(list[0]);
    const csvRows = [headers.join(',')];

    for (const item of list) {
      const values = headers.map(header => {
        const val = item[header];
        const stringified = val === null || val === undefined ? '' : String(val);
        // Escape quotes to preserve standard CSV readability
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

export const sqliteDb = new SQLiteDatabase();
