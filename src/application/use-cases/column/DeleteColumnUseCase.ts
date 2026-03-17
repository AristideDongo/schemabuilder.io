import { Project } from "../../../domain/entities/Project";

export class DeleteColumnUseCase {
  public execute(project: Project, tableId: string, columnId: string): void {
    const table = project.tables.find(t => t.id === tableId);
    if (!table) throw new Error("Table not found");
    
    table.removeColumn(columnId);
  }
}
