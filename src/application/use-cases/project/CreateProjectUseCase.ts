import { IProjectRepository } from "../../../domain/repositories/IProjectRepository";
import { Project } from "../../../domain/entities/Project";
import { DbEngine } from "../../../domain/value-objects/DbEngine";

export class CreateProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  public async execute(name: string, engine: DbEngine = DbEngine.PostgreSQL): Promise<Project> {
    const id = crypto.randomUUID();
    const project = new Project(id, name, [], [], engine);
    await this.projectRepository.save(project);
    return project;
  }
}
