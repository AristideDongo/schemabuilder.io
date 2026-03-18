import { Project } from "../../entities/Project";
import { Table } from "../../entities/Table";
import { Column } from "../../entities/Column";
import { Relation } from "../../entities/Relation";
import { IProjectExporter } from "../IProjectExporter";

export abstract class BaseSqlExporter implements IProjectExporter {
  abstract getFileExtension(): string;

  export(project: Project): string {
    let sql = `-- ${project.name} Export\n`;
    sql += `-- Generated on ${new Date().toISOString()}\n`;
    sql += `-- Database Engine: ${project.engine}\n\n`;

    // 1. Create Tables
    for (const table of project.tables) {
      sql += this.generateCreateTable(table);
      sql += "\n";
    }

    // 2. Add Foreign Keys (Relations) and Junction Tables
    for (const relation of project.relations) {
      if (relation.type === "ManyToMany") {
        sql += this.generateJunctionTable(relation, project.tables);
      } else {
        sql += this.generateForeignKey(relation, project.tables);
      }
      sql += "\n";
    }

    return sql;
  }

  protected generateJunctionTable(relation: Relation, tables: Table[]): string {
    const sourceTable = tables.find(t => t.id === relation.sourceTableId);
    const targetTable = tables.find(t => t.id === relation.targetTableId);
    
    if (!sourceTable || !targetTable) return `-- ManyToMany junction skipped (missing info)`;

    const junctionName = `${sourceTable.name}_${targetTable.name}`;
    const sourcePk = sourceTable.columns.find(c => c.isPrimaryKey) || sourceTable.columns[0];
    const targetPk = targetTable.columns.find(c => c.isPrimaryKey) || targetTable.columns[0];

    const sourceFkName = `${sourceTable.name}_id`;
    const targetFkName = `${targetTable.name}_id`;

    let sql = `-- Junction Table for Many-to-Many between ${sourceTable.name} and ${targetTable.name}\n`;
    sql += `CREATE TABLE ${this.formatIdentifier(junctionName)} (\n`;
    sql += `  ${this.formatIdentifier(sourceFkName)} ${sourcePk ? this.formatType(sourcePk) : "INTEGER"},\n`;
    sql += `  ${this.formatIdentifier(targetFkName)} ${targetPk ? this.formatType(targetPk) : "INTEGER"},\n`;
    sql += `  PRIMARY KEY (${this.formatIdentifier(sourceFkName)}, ${this.formatIdentifier(targetFkName)}),\n`;
    sql += `  FOREIGN KEY (${this.formatIdentifier(sourceFkName)}) REFERENCES ${this.formatIdentifier(sourceTable.name)}(${sourcePk ? this.formatIdentifier(sourcePk.name) : "id"}),\n`;
    sql += `  FOREIGN KEY (${this.formatIdentifier(targetFkName)}) REFERENCES ${this.formatIdentifier(targetTable.name)}(${targetPk ? this.formatIdentifier(targetPk.name) : "id"})\n`;
    sql += `);\n`;

    return sql;
  }

  protected abstract formatIdentifier(identifier: string): string;
  protected abstract formatType(column: Column): string;

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
      
      if (col.isPrimaryKey) {
        def += this.getInlinePrimaryKeySuffix();
      }
      
      if (col.isUnique && !col.isPrimaryKey) {
        def += " UNIQUE";
      }
      
      return def;
    });

    sql += columnDefinitions.join(",\n");
    sql += "\n);";
    
    return sql;
  }

  protected getInlinePrimaryKeySuffix(): string {
    return " PRIMARY KEY";
  }

  protected formatValue(value: string, type: string): string {
    // Basic heuristic: check if it's likely a string/date
    const lowerType = type.toLowerCase();
    const isString = lowerType.includes("char") || lowerType.includes("text") || lowerType.includes("string") || lowerType.includes("date") || lowerType.includes("time");
    
    if (isString && !value.startsWith("'") && value.toUpperCase() !== "NULL" && value.toUpperCase() !== "CURRENT_TIMESTAMP") {
      return `'${value}'`;
    }
    return value;
  }

  protected generateForeignKey(relation: Relation, tables: Table[]): string {
    const sourceTable = tables.find(t => t.id === relation.sourceTableId);
    const targetTable = tables.find(t => t.id === relation.targetTableId);
    const sourceCol   = sourceTable?.columns.find(c => c.id === relation.sourceColumnId);
    const targetCol   = targetTable?.columns.find(c => c.id === relation.targetColumnId);

    if (!sourceTable || !targetTable || !sourceCol || !targetCol) {
      return `-- Relation ${relation.id} skipped (missing info)`;
    }

    return `ALTER TABLE ${this.formatIdentifier(sourceTable.name)} \n` +
           `ADD CONSTRAINT fk_${sourceTable.name}_${sourceCol.name} \n` +
           `FOREIGN KEY (${this.formatIdentifier(sourceCol.name)}) \n` +
           `REFERENCES ${this.formatIdentifier(targetTable.name)}(${this.formatIdentifier(targetCol.name)});`;
  }
}
