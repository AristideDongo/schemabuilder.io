import { Constraint } from "../value-objects/Constraint";

export class Column {
  constructor(
    public id: string,
    public name: string,
    public type: string,
    public length: number | null = null,
    public isNullable: boolean = false,
    public isPrimaryKey: boolean = false,
    public isAutoIncrement: boolean = false,
    public isUnique: boolean = false,
    public defaultValue: string | null = null,
    public constraints: Constraint[] = []
  ) {}

  public addConstraint(constraint: Constraint): void {
    if (!this.constraints.includes(constraint)) {
      this.constraints.push(constraint);
    }
  }

  public removeConstraint(constraint: Constraint): void {
    this.constraints = this.constraints.filter(c => c !== constraint);
  }
}
