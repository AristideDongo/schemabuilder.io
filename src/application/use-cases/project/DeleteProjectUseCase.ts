import { IProjectRepository } from "../../../domain/repositories/IProjectRepository";

export class DeleteProjectUseCase {
  constructor(private projectRepository: IProjectRepository) {}

  public async execute(id: string): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
