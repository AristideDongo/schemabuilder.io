import { Column } from "../../entities/Column";
import { Table } from "../../entities/Table";
import { Relation } from "../../entities/Relation";
import { BaseSqlExporter } from "./BaseSqlExporter";

export class SQLiteExporter extends BaseSqlExporter {
  getFileExtension(): string {
    return "sql";
  }

  protected formatIdentifier(identifier: string): string {
    return `"${identifier}"`;
  }

  protected formatType(column: Column): string {
    const type = column.type.toUpperCase();
    
    // SQLite uses simplified types
    if (type.includes("CHAR") || type.includes("TEXT") || type.includes("STRING")) {
      return "TEXT";
    }
    if (type.includes("INT")) {
      return "INTEGER";
    }
    if (type.includes("REAL") || type.includes("DOUBLE") || type.includes("FLOAT")) {
      return "REAL";
    }
    if (type.includes("BLOB")) {
      return "BLOB";
    }
    
    return "TEXT"; // fallback
  }

  // SQLite doesn't support ADD CONSTRAINT for FK in ALTER TABLE easily.
  protected generateForeignKey(relation: Relation): string {
    return `-- SQLite: FK for ${relation.id} should be defined in CREATE TABLE.\n` +
           `-- ALTER TABLE ADD CONSTRAINT is not supported by SQLite.`;
  }
}
