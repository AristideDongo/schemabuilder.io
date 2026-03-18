import { LocalStorageProjectRepository } from "../../infrastructure/repositories/LocalStorageProjectRepository";
import { CreateProjectUseCase } from "../../application/use-cases/project/CreateProjectUseCase";
import { SaveProjectUseCase } from "../../application/use-cases/project/SaveProjectUseCase";
import { LoadProjectUseCase } from "../../application/use-cases/project/LoadProjectUseCase";
import { DeleteProjectUseCase } from "../../application/use-cases/project/DeleteProjectUseCase";
import { ExportProjectUseCase } from "../../application/use-cases/export/ExportProjectUseCase";
import { AddTableUseCase } from "../../application/use-cases/table/AddTableUseCase";
import { DeleteTableUseCase } from "../../application/use-cases/table/DeleteTableUseCase";
import { DeleteRelationUseCase } from "../../application/use-cases/relation/DeleteRelationUseCase";

const projectRepository = new LocalStorageProjectRepository();

export const container = {
  projectRepository,
  createProjectUseCase: new CreateProjectUseCase(projectRepository),
  saveProjectUseCase: new SaveProjectUseCase(projectRepository),
  loadProjectUseCase: new LoadProjectUseCase(projectRepository),
  deleteProjectUseCase: new DeleteProjectUseCase(projectRepository),
  exportProjectUseCase: new ExportProjectUseCase(),
  addTableUseCase: new AddTableUseCase(),
  deleteTableUseCase: new DeleteTableUseCase(),
  deleteRelationUseCase: new DeleteRelationUseCase(),
};
