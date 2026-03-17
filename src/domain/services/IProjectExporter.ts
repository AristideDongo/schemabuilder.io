import { Project } from "../entities/Project";

export interface IProjectExporter {
  export(project: Project): string;
  getFileExtension(): string;
}
