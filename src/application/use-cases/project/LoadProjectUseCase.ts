import { IProjectRepository } from "../../../domain/repositories/IProjectRepository";
import { Project } from "../../../domain/entities/Project";

export class LoadProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  public async execute(id: string): Promise<Project | null> {
    return await this.projectRepository.getById(id);
  }
  
  public async loadAll(): Promise<Project[]> {
    return await this.projectRepository.getAll();
  }
}
