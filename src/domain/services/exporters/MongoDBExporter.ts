import { Project } from "../../entities/Project";
import { IProjectExporter } from "../IProjectExporter";

export class MongoDBExporter implements IProjectExporter {
  getFileExtension(): string {
    return "json";
  }

  export(project: Project): string {
    const collections = project.tables.map(table => {
      const schema: {
        name: string;
        fields: {
          name: string;
          type: string;
          required: boolean;
          primaryKey: boolean;
          unique: boolean;
          default: string | null;
        }[];
        relations?: {
          localField: string | undefined;
          foreignField: string | undefined;
          foreignCollection: string | undefined;
          type: string;
        }[];
      } = {
        name: table.name,
        fields: table.columns.map(col => ({
          name: col.name,
          type: col.type,
          required: !col.isNullable,
          primaryKey: col.isPrimaryKey,
          unique: col.isUnique,
          default: col.defaultValue
        }))
      };

      // Find relations where this table is the source
      const relations = project.relations.filter(rel => rel.sourceTableId === table.id);
      if (relations.length > 0) {
        schema.relations = relations.map(rel => {
          const targetTable = project.tables.find(t => t.id === rel.targetTableId);
          const targetCol = targetTable?.columns.find(c => c.id === rel.targetColumnId);
          const sourceCol = table.columns.find(c => c.id === rel.sourceColumnId);
          
          return {
            localField: sourceCol?.name,
            foreignField: targetCol?.name,
            foreignCollection: targetTable?.name,
            type: rel.type
          };
        });
      }

      return schema;
    });

    return JSON.stringify({
      projectName: project.name,
      engine: project.engine,
      exportedAt: new Date().toISOString(),
      collections
    }, null, 2);
  }
}
