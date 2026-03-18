import { Project } from "../../../domain/entities/Project";

export class DeleteRelationUseCase {
  public execute(project: Project, relationId: string): void {
    const relation = project.relations.find(r => r.id === relationId);
    if (!relation) return;

    const { targetTableId, targetColumnId } = relation;

    // Remove the relation
    project.removeRelation(relationId);

    // Check if any other relation still uses this target column
    const isColumnStillUsed = project.relations.some(
      r => r.targetTableId === targetTableId && r.targetColumnId === targetColumnId
    );

    if (!isColumnStillUsed) {
      const targetTable = project.tables.find(t => t.id === targetTableId);
      if (targetTable) {
        targetTable.removeColumn(targetColumnId);
      }
    }
  }
}
