import { IProjectRepository } from "../../../domain/repositories/IProjectRepository";
import { Project } from "../../../domain/entities/Project";

export class SaveProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  public async execute(project: Project): Promise<void> {
    await this.projectRepository.save(project);
  }
}
