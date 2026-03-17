import { Project } from "../../../domain/entities/Project";

export class DeleteTableUseCase {
  public execute(project: Project, tableId: string): void {
    project.removeTable(tableId);
  }
}
