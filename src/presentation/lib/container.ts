import { LocalStorageProjectRepository } from "../../infrastructure/repositories/LocalStorageProjectRepository";
import { CreateProjectUseCase } from "../../application/use-cases/project/CreateProjectUseCase";
import { SaveProjectUseCase } from "../../application/use-cases/project/SaveProjectUseCase";
import { LoadProjectUseCase } from "../../application/use-cases/project/LoadProjectUseCase";
import { DeleteProjectUseCase } from "../../application/use-cases/project/DeleteProjectUseCase";

const projectRepository = new LocalStorageProjectRepository();

export const container = {
  projectRepository,
  createProjectUseCase: new CreateProjectUseCase(projectRepository),
  saveProjectUseCase: new SaveProjectUseCase(projectRepository),
  loadProjectUseCase: new LoadProjectUseCase(projectRepository),
  deleteProjectUseCase: new DeleteProjectUseCase(projectRepository),
};
