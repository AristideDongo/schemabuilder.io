import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { ProjectMapper } from "../../application/mappers/ProjectMapper";

const STORAGE_KEY = "schema_builder_projects";

export class LocalStorageProjectRepository implements IProjectRepository {
  public async getAll(): Promise<Project[]> {
    if (typeof window === "undefined") return []; // Safety for Next.js SSR
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      const parsed = JSON.parse(data) as unknown[];
      return parsed.map((p) => ProjectMapper.toDomain(p));
    } catch (e) {
      console.error("Failed to parse projects from localStorage", e);
      return [];
    }
  }

  public async getById(id: string): Promise<Project | null> {
    const projects = await this.getAll();
    return projects.find(p => p.id === id) || null;
  }

  public async save(project: Project): Promise<void> {
    if (typeof window === "undefined") return;
    
    const projects = await this.getAll();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  public async delete(id: string): Promise<void> {
    if (typeof window === "undefined") return;
    
    const projects = await this.getAll();
    const updated = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}
