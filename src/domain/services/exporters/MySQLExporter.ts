import { Column } from "../../entities/Column";
import { Table } from "../../entities/Table";
import { BaseSqlExporter } from "./BaseSqlExporter";

export class MySQLExporter extends BaseSqlExporter {
  getFileExtension(): string {
    return "sql";
  }

  protected formatIdentifier(identifier: string): string {
    return `\`${identifier}\``;
  }

  protected formatType(column: Column): string {
    const type = column.type.toUpperCase();
    
    if (type === "VARCHAR" && column.length) {
      return `VARCHAR(${column.length})`;
    }
    
    return type;
  }

  protected generateCreateTable(table: Table): string {
    let sql = `CREATE TABLE ${this.formatIdentifier(table.name)} (\n`;
    
    const columnDefinitions = table.columns.map(col => {
      let def = `  ${this.formatIdentifier(col.name)} ${this.formatType(col)}`;
      
      if (!col.isNullable) {
        def += " NOT NULL";
      }
      
      if (col.defaultValue !== null && col.defaultValue !== "") {
        def += ` DEFAULT ${this.formatValue(col.defaultValue, col.type)}`;
      }
      
      if (col.isAutoIncrement) {
        def += " AUTO_INCREMENT";
      }
      
      if (col.isPrimaryKey) {
        def += " PRIMARY KEY";
      }
      
      if (col.isUnique && !col.isPrimaryKey) {
        def += " UNIQUE";
      }
      
      return def;
    });

    sql += columnDefinitions.join(",\n");
    sql += "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    return sql;
  }
}
