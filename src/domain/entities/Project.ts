import { Table } from "./Table";
import { Relation } from "./Relation";
import { DbEngine } from "../value-objects/DbEngine";

export class Project {
  public updatedAt: Date;

  constructor(
    public id: string,
    public name: string,
    public tables: Table[] = [],
    public relations: Relation[] = [],
    public engine: DbEngine = DbEngine.PostgreSQL,
    public createdAt: Date = new Date(),
    updatedAt?: Date
  ) {
    this.updatedAt = updatedAt || new Date();
  }

  public addTable(table: Table): void {
    this.tables.push(table);
    this.updateTimestamp();
  }

  public removeTable(tableId: string): void {
    this.tables = this.tables.filter(t => t.id !== tableId);
    this.relations = this.relations.filter(
      r => r.sourceTableId !== tableId && r.targetTableId !== tableId
    );
    this.updateTimestamp();
  }

  public addRelation(relation: Relation): void {
    this.relations.push(relation);
    this.updateTimestamp();
  }

  public removeRelation(relationId: string): void {
    this.relations = this.relations.filter(r => r.id !== relationId);
    this.updateTimestamp();
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
