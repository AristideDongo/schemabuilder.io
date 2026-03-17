import { Project } from "../../../domain/entities/Project";
import { Column } from "../../../domain/entities/Column";

export class AddColumnUseCase {
  public execute(project: Project, tableId: string, name: string, type: string): Column {
    const table = project.tables.find(t => t.id === tableId);
    if (!table) throw new Error("Table not found");

    const column = new Column(crypto.randomUUID(), name, type);
    table.addColumn(column);
    
    // Auto-PK for first 'id' column
    if (name.toLowerCase() === "id" && table.columns.length === 1) {
      column.isPrimaryKey = true;
      column.isAutoIncrement = true;
    }

    return column;
  }
}
