import { create } from "zustand";
import { Project } from "../../domain/entities/Project";
import { container } from "../lib/container";
import { DbEngine } from "../../domain/value-objects/DbEngine";
import { ProjectMapper } from "../../application/mappers/ProjectMapper";
import { toast } from "react-toastify";

interface SchemaState {
  activeProject: Project | null;
  projectsList: Project[];
  isLoading: boolean;

  selectedElement: { type: 'table' | 'column' | 'relation'; tableId?: string; columnId?: string; relationId?: string } | null;

  past: string[]; // Store JSON snapshots
  future: string[];

  undo: () => void;
  redo: () => void;

  loadProjects: () => Promise<void>;
  createProject: (name: string, engine?: DbEngine) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  saveCurrentProject: (showToast?: boolean) => Promise<void>;
  setProject: (project: Project | null) => void;
  updateActiveProject: (updater: (draft: Project) => void, skipHistory?: boolean) => void;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
  exportProject: (projectId?: string) => Promise<void>;
  setSelectedElement: (element: { type: 'table' | 'column' | 'relation'; tableId?: string; columnId?: string; relationId?: string } | null) => void;
  addTable: (name: string, x: number, y: number) => void;
  deleteSelectedElement: () => void;
  deleteTable: (tableId: string) => void;
  deleteRelation: (relationId: string) => void;
  isAutoLayoutActive: boolean;
  toggleAutoLayout: () => void;
  autoLayout: () => void;
}

export const useSchemaStore = create<SchemaState>((set, get) => ({
  activeProject: null,
  projectsList: [],
  isLoading: false,
  selectedElement: null,
  isAutoLayoutActive: false,
  past: [],
  future: [],

  setSelectedElement: (element) => set({ selectedElement: element }),

  undo: () => {
    const { past, activeProject, future } = get();
    if (past.length === 0 || !activeProject) return;

    const previousSnapshot = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    // Save current to future for redo
    const currentSnapshot = JSON.stringify(activeProject);
    const newFuture = [currentSnapshot, ...future].slice(0, 30);

    set({
      activeProject: ProjectMapper.toDomain(JSON.parse(previousSnapshot)),
      past: newPast,
      future: newFuture,
      selectedElement: null
    });
    toast.info("Undo: Reverted last change", { autoClose: 1500 });
  },

  redo: () => {
    const { future, activeProject, past } = get();
    if (future.length === 0 || !activeProject) return;

    const nextSnapshot = future[0];
    const newFuture = future.slice(1);

    // Save current to past
    const currentSnapshot = JSON.stringify(activeProject);
    const newPast = [...past, currentSnapshot].slice(-30);

    set({
      activeProject: ProjectMapper.toDomain(JSON.parse(nextSnapshot)),
      past: newPast,
      future: newFuture,
      selectedElement: null
    });
    toast.info("Redo: Applied next change", { autoClose: 1500 });
  },

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
        past: [],
        future: []
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const project = await container.loadProjectUseCase.execute(id);
      set({ activeProject: project, past: [], future: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  saveCurrentProject: async (showToast = false) => {
    const { activeProject } = get();
    if (!activeProject) return;

    set({ isLoading: true });
    try {
      await container.saveProjectUseCase.execute(activeProject);
      if (showToast) {
        toast.success("Project saved successfully", { autoClose: 2000 });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setProject: (project: Project | null) => set({ activeProject: project, past: [], future: [] }),

  deleteProject: async (id: string) => {
    try {
      await container.deleteProjectUseCase.execute(id);
      set((state) => ({
        projectsList: state.projectsList.filter(p => p.id !== id),
        activeProject: state.activeProject?.id === id ? null : state.activeProject,
        past: state.activeProject?.id === id ? [] : state.past,
        future: state.activeProject?.id === id ? [] : state.future
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

  exportProject: async (projectId?: string) => {
    let projectToExport: Project | null = null;
    
    if (projectId) {
      projectToExport = get().projectsList.find(p => p.id === projectId) || null;
    } else {
      projectToExport = get().activeProject;
    }

    if (!projectToExport) return;

    try {
      const { content, filename } = container.exportProjectUseCase.execute(projectToExport);
      
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported as ${filename}`, { autoClose: 2000 });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.");
    }
  },

  // Helper for triggering reactivity by returning a fresh clone constructed via Mapper
  updateActiveProject: (updater: (draft: Project) => void, skipHistory = false) => {
    const { activeProject, past } = get();
    if (!activeProject) return;

    const currentSnapshot = JSON.stringify(activeProject);

    // Deep clone via JSON to break references, then reconstruct standard Entity
    const rawClone = JSON.parse(currentSnapshot);
    const newProject = ProjectMapper.toDomain(rawClone);

    updater(newProject);
    newProject.updatedAt = new Date(); // update timestamp

    const newState: Partial<SchemaState> = { activeProject: newProject };
    
    if (!skipHistory) {
      newState.past = [...past, currentSnapshot].slice(-30);
      newState.future = []; // Clear future on new action
    }

    set(newState);
  },

  addTable: (name: string, x: number, y: number) => {
    const { updateActiveProject } = get();
    updateActiveProject((project) => {
      container.addTableUseCase.execute(project, name, x, y);
    });
    toast.success(`Table "${name}" created`);
  },

  deleteSelectedElement: () => {
    const { selectedElement, activeProject, updateActiveProject, setSelectedElement } = get();
    if (!activeProject || !selectedElement) return;

    if (selectedElement.type === 'table' && selectedElement.tableId) {
      const table = activeProject.tables.find(t => t.id === selectedElement.tableId);
      if (table) {
        updateActiveProject((project) => {
          container.deleteTableUseCase.execute(project, table.id);
        });
        toast.error(`Table "${table.name}" deleted`);
      }
    } else if (selectedElement.type === 'relation' && selectedElement.relationId) {
      updateActiveProject((project) => {
        container.deleteRelationUseCase.execute(project, selectedElement.relationId!);
      });
      toast.warn("Relation deleted");
    }

    setSelectedElement(null);
  },

  deleteTable: (tableId: string) => {
    const { activeProject, updateActiveProject, selectedElement, setSelectedElement } = get();
    if (!activeProject) return;

    const table = activeProject.tables.find(t => t.id === tableId);
    if (!table) return;

    updateActiveProject((project) => {
      container.deleteTableUseCase.execute(project, tableId);
    });

    if (selectedElement?.type === 'table' && selectedElement.tableId === tableId) {
      setSelectedElement(null);
    }
    toast.error(`Table "${table.name}" deleted`);
  },

  deleteRelation: (relationId: string) => {
    const { activeProject, updateActiveProject, selectedElement, setSelectedElement } = get();
    if (!activeProject) return;

    updateActiveProject((project) => {
      container.deleteRelationUseCase.execute(project, relationId);
    });

    if (selectedElement?.type === 'relation' && selectedElement.relationId === relationId) {
      setSelectedElement(null);
    }
    toast.warn("Relation deleted");
  },

  autoLayout: () => {
    const { updateActiveProject } = get();
    updateActiveProject((project) => {
      container.autoLayoutUseCase.execute(project);
    }, true); // skipHistory for auto-layout if it's continuous? 
    // Actually, maybe not. Let's keep it consistent.
  },

  toggleAutoLayout: () => {
    const { isAutoLayoutActive, autoLayout } = get();
    const nextState = !isAutoLayoutActive;
    set({ isAutoLayoutActive: nextState });
    
    if (nextState) {
      autoLayout();
      toast.success("Auto-layout mode: ON (Automatic organization)");
    } else {
      toast.info("Auto-layout mode: OFF (Manual organization)");
    }
  }
}));
