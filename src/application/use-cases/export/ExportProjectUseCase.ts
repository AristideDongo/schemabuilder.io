import { DbEngine } from "../../../domain/value-objects/DbEngine";
import { Project } from "../../../domain/entities/Project";
import { IProjectExporter } from "../../../domain/services/IProjectExporter";
import { PostgreSQLExporter } from "../../../domain/services/exporters/PostgreSQLExporter";
import { MySQLExporter } from "../../../domain/services/exporters/MySQLExporter";
import { MariaDBExporter } from "../../../domain/services/exporters/MariaDBExporter";
import { SQLiteExporter } from "../../../domain/services/exporters/SQLiteExporter";
import { SQLServerExporter } from "../../../domain/services/exporters/SQLServerExporter";
import { MongoDBExporter } from "../../../domain/services/exporters/MongoDBExporter";

export class ExportProjectUseCase {
  execute(project: Project): { content: string; filename: string } {
    const exporter = this.getExporter(project.engine);
    const content = exporter.export(project);
    const extension = exporter.getFileExtension();
    const filename = `${project.name.replace(/\s+/g, "_")}_export.${extension}`;

    return { content, filename };
  }

  private getExporter(engine: DbEngine): IProjectExporter {
    switch (engine) {
      case DbEngine.PostgreSQL:
        return new PostgreSQLExporter();
      case DbEngine.MySQL:
        return new MySQLExporter();
      case DbEngine.MariaDB:
        return new MariaDBExporter();
      case DbEngine.SQLite:
        return new SQLiteExporter();
      case DbEngine.SQLServer:
        return new SQLServerExporter();
      case DbEngine.MongoDB:
        return new MongoDBExporter();
      default:
        throw new Error(`No exporter implemented for engine: ${engine}`);
    }
  }
}
