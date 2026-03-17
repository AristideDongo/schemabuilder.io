import { RelationType } from "../value-objects/RelationType";

export class Relation {
  constructor(
    public id: string,
    public sourceTableId: string,
    public targetTableId: string,
    public sourceColumnId: string,
    public targetColumnId: string,
    public type: RelationType
  ) {}
}
