import { create } from "zustand";
import { Project } from "../../domain/entities/Project";
import { container } from "../lib/container";
import { DbEngine } from "../../domain/value-objects/DbEngine";
import { ProjectMapper } from "../../application/mappers/ProjectMapper";

interface SchemaState {
  activeProject: Project | null;
  projectsList: Project[];
  isLoading: boolean;

  selectedElement: { type: 'table' | 'column'; tableId: string; columnId?: string } | null;

  loadProjects: () => Promise<void>;
  createProject: (name: string, engine?: DbEngine) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
  setProject: (project: Project | null) => void;
  updateActiveProject: (updater: (draft: Project) => void) => void;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
  setSelectedElement: (element: { type: 'table' | 'column'; tableId: string; columnId?: string } | null) => void;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  activeProject: null,
  projectsList: [],
  isLoading: false,
  selectedElement: null,

  setSelectedElement: (element) => set({ selectedElement: element }),

  loadProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await container.loadProjectUseCase.loadAll();
      set({ projectsList: projects });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (name: string, engine = DbEngine.PostgreSQL) => {
    set({ isLoading: true });
    try {
      const project = await container.createProjectUseCase.execute(name, engine);
      set((state) => ({
        projectsList: [...state.projectsList, project],
        activeProject: project,
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const project = await container.loadProjectUseCase.execute(id);
      set({ activeProject: project });
    } finally {
      set({ isLoading: false });
    }
  },

  saveCurrentProject: async () => {
    const { activeProject } = get();
    if (!activeProject) return;

    set({ isLoading: true });
    try {
      await container.saveProjectUseCase.execute(activeProject);
    } finally {
      set({ isLoading: false });
    }
  },

  setProject: (project: Project | null) => set({ activeProject: project }),

  deleteProject: async (id: string) => {
    try {
      await container.deleteProjectUseCase.execute(id);
      set((state) => ({
        projectsList: state.projectsList.filter(p => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
      }));
    } catch {
      // if no delete method, remove from list only
      set((state) => ({
        projectsList: state.projectsList.filter(p => p.id !== id),
      }));
    }
  },

  renameProject: async (id: string, newName: string) => {
    const { projectsList } = get();
    const rawProject = projectsList.find(p => p.id === id);
    if (!rawProject) return;

    // Deep clone and reconstruct entity to ensure reactivity and consistency
    const project = ProjectMapper.toDomain(JSON.parse(JSON.stringify(rawProject)));
    project.name = newName;
    project.updatedAt = new Date();

    await container.saveProjectUseCase.execute(project);

    set((state) => ({
      projectsList: state.projectsList.map(p => p.id === id ? project : p),
      activeProject: state.activeProject?.id === id ? project : state.activeProject,
    }));
  },

  // Helper for triggering reactivity by returning a fresh clone constructed via Mapper
  updateActiveProject: (updater: (draft: Project) => void) => {
    const { activeProject } = get();
    if (!activeProject) return;

    // Deep clone via JSON to break references, then reconstruct standard Entity
    const rawClone = JSON.parse(JSON.stringify(activeProject));
    const newProject = ProjectMapper.toDomain(rawClone);

    updater(newProject);
    newProject.updatedAt = new Date(); // update timestamp

    set({ activeProject: newProject });
  }
}));
