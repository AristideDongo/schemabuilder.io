import { Project } from "../../../domain/entities/Project";

export class UpdateTableUseCase {
  public execute(
    project: Project,
    tableId: string,
    params: { name?: string; note?: string; color?: string; x?: number; y?: number }
  ): void {
    const table = project.tables.find((t) => t.id === tableId);
    if (!table) throw new Error("Table not found");

    if (params.name !== undefined) table.name = params.name;
    if (params.note !== undefined) table.note = params.note;
    if (params.color !== undefined) table.color = params.color;
    if (params.x !== undefined && params.y !== undefined) {
      table.updatePosition(params.x, params.y);
    }
  }
}
