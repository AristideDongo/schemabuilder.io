import { Project } from "../../../domain/entities/Project";
import { Table } from "../../../domain/entities/Table";

export class AddTableUseCase {
  public execute(project: Project, name: string, x: number = 0, y: number = 0): Table {
    const table = new Table(crypto.randomUUID(), name, [], x, y);
    project.addTable(table);
    return table;
  }
}
