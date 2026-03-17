import { Column } from "../../entities/Column";
import { BaseSqlExporter } from "./BaseSqlExporter";

export class PostgreSQLExporter extends BaseSqlExporter {
  getFileExtension(): string {
    return "sql";
  }

  protected formatIdentifier(identifier: string): string {
    return `"${identifier}"`;
  }

  protected formatType(column: Column): string {
    const type = column.type.toUpperCase();
    
    // Simple mappings for common types if needed
    if (type === "VARCHAR" && column.length) {
      return `VARCHAR(${column.length})`;
    }
    if (type === "INT") {
      return "INTEGER";
    }
    
    return type;
  }
}
