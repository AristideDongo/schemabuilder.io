import { Column } from "./Column";

export class Table {
  constructor(
    public id: string,
    public name: string,
    public columns: Column[] = [],
    public x: number = 0,
    public y: number = 0,
    public note: string = "",
    public color: string = ""
  ) {}

  public addColumn(column: Column): void {
    this.columns.push(column);
  }

  public removeColumn(columnId: string): void {
    this.columns = this.columns.filter(c => c.id !== columnId);
  }

  public getColumn(columnId: string): Column | undefined {
    return this.columns.find(c => c.id === columnId);
  }

  public updatePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
