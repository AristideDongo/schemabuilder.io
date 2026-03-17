import { Project } from "../../../domain/entities/Project";
import { Constraint } from "../../../domain/value-objects/Constraint";

export class UpdateColumnUseCase {
  public execute(
    project: Project,
    tableId: string,
    columnId: string,
    params: {
      name?: string;
      type?: string;
      length?: number | null;
      isNullable?: boolean;
      isPrimaryKey?: boolean;
      isAutoIncrement?: boolean;
      isUnique?: boolean;
      defaultValue?: string | null;
      constraints?: Constraint[];
    }
  ): void {
    const table = project.tables.find((t) => t.id === tableId);
    if (!table) throw new Error("Table not found");

    const column = table.getColumn(columnId);
    if (!column) throw new Error("Column not found");

    if (params.name !== undefined) column.name = params.name;
    if (params.type !== undefined) column.type = params.type;
    if (params.length !== undefined) column.length = params.length;
    if (params.isNullable !== undefined) column.isNullable = params.isNullable;
    if (params.isPrimaryKey !== undefined) column.isPrimaryKey = params.isPrimaryKey;
    if (params.isAutoIncrement !== undefined) column.isAutoIncrement = params.isAutoIncrement;
    if (params.isUnique !== undefined) column.isUnique = params.isUnique;
    if (params.defaultValue !== undefined) column.defaultValue = params.defaultValue;
    if (params.constraints !== undefined) column.constraints = params.constraints;
  }
}
