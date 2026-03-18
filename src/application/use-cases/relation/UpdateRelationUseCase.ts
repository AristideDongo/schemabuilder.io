import { Project } from "../../../domain/entities/Project";
import { RelationType } from "../../../domain/value-objects/RelationType";

export class UpdateRelationUseCase {
  public execute(
    project: Project,
    relationId: string,
    updates: {
      type?: RelationType;
      sourceColumnId?: string;
      targetColumnId?: string;
    }
  ): void {
    const relation = project.relations.find((r) => r.id === relationId);
    if (!relation) {
      throw new Error("Relation not found");
    }

    if (updates.type !== undefined) relation.type = updates.type;
    if (updates.sourceColumnId !== undefined) relation.sourceColumnId = updates.sourceColumnId;
    if (updates.targetColumnId !== undefined) relation.targetColumnId = updates.targetColumnId;
    
    // In a mature implementation, changing the type or columns might trigger
    // migrations of Foreign Keys between tables. For now, we just update the model.
  }
}
