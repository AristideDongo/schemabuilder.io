import { Project } from "../../../domain/entities/Project";
import { Relation } from "../../../domain/entities/Relation";
import { RelationType } from "../../../domain/value-objects/RelationType";
import { Column } from "../../../domain/entities/Column";
import { Constraint } from "../../../domain/value-objects/Constraint";

export class CreateRelationUseCase {
  public execute(
    project: Project,
    sourceTableId: string,
    targetTableId: string
  ): Relation {
    const sourceTable = project.tables.find((t) => t.id === sourceTableId);
    const targetTable = project.tables.find((t) => t.id === targetTableId);

    if (!sourceTable || !targetTable) {
      throw new Error("Source or target table not found");
    }

    // Auto-detect source column (prefer primary key, else first column)
    let sourceColumn = sourceTable.columns.find(c => c.isPrimaryKey || c.constraints.includes(Constraint.PrimaryKey));
    if (!sourceColumn && sourceTable.columns.length > 0) {
      sourceColumn = sourceTable.columns[0];
    }
    
    if (!sourceColumn) {
      throw new Error("Source table has no columns to relate");
    }

    // Auto-configure the target column as a Foreign Key
    const newColumnName = `${sourceTable.name.toLowerCase()}_id`;
    
    // Check if we already created a FK for this specific source table
    let targetColumn = targetTable.columns.find(c => c.name === newColumnName && c.constraints.includes(Constraint.ForeignKey));
    
    if (!targetColumn) {
      // Create it
      targetColumn = new Column(
        crypto.randomUUID(),
        newColumnName,
        sourceColumn.type,
        sourceColumn.length,
        true
      );
      targetColumn.addConstraint(Constraint.ForeignKey);
      targetTable.addColumn(targetColumn);
    }

    const relation = new Relation(
      crypto.randomUUID(),
      sourceTableId,
      targetTableId,
      sourceColumn.id,
      targetColumn.id,
      RelationType.OneToMany // Default to 1:N
    );

    project.addRelation(relation);

    return relation;
  }
}
