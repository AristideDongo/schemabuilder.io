import { Column } from "../../entities/Column";
import { BaseSqlExporter } from "./BaseSqlExporter";

export class SQLServerExporter extends BaseSqlExporter {
  getFileExtension(): string {
    return "sql";
  }

  protected formatIdentifier(identifier: string): string {
    return `[${identifier}]`;
  }

  protected formatType(column: Column): string {
    const type = column.type.toUpperCase();
    
    if (type === "VARCHAR" && column.length) {
      return `VARCHAR(${column.length})`;
    }
    if (type === "STRING") {
      return "NVARCHAR(MAX)";
    }
    
    return type;
  }
}
