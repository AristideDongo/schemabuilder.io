import { Project } from "../../domain/entities/Project";
import { Table } from "../../domain/entities/Table";
import { Column } from "../../domain/entities/Column";
import { Relation } from "../../domain/entities/Relation";

export class ProjectMapper {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static toDomain(data: any): Project {
    if (!data) throw new Error("Null data provided to ProjectMapper");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tables = (data.tables || []).map((tData: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const columns = (tData.columns || []).map((cData: any) => {
        const col = new Column(
          cData.id,
          cData.name,
          cData.type,
          cData.length,
          cData.isNullable,
          cData.isPrimaryKey,
          cData.isAutoIncrement,
          cData.isUnique,
          cData.defaultValue,
          cData.constraints || []
        );
        return col;
      });
      return new Table(
        tData.id,
        tData.name,
        columns,
        tData.x || 0,
        tData.y || 0,
        tData.note || "",
        tData.color || ""
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relations = (data.relations || []).map((rData: any) => new Relation(
      rData.id,
      rData.sourceTableId,
      rData.targetTableId,
      rData.sourceColumnId,
      rData.targetColumnId,
      rData.type
    ));

    return new Project(
      data.id,
      data.name,
      tables,
      relations,
      data.engine,
      new Date(data.createdAt || Date.now()),
      data.updatedAt ? new Date(data.updatedAt) : undefined
    );
  }
}
