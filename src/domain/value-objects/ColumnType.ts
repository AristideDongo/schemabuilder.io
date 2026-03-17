import { DbEngine } from "./DbEngine";

export interface ColumnType {
  name: string;
  engine: DbEngine;
  hasLength?: boolean;
  hasPrecision?: boolean;
}
