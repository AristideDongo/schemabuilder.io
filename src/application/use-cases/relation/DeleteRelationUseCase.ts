import { Project } from "../../../domain/entities/Project";

export class DeleteRelationUseCase {
  public execute(project: Project, relationId: string): void {
    project.removeRelation(relationId);
  }
}
