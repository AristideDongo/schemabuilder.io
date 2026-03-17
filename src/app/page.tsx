"use client";

import { useEffect, useState } from "react";
import { useSchemaStore } from "@/presentation/store/schemaStore";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Database,
  Calendar,
  Trash2,
  Download,
  Edit2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DbEngine } from "@/domain/value-objects/DbEngine";
import { toast } from "react-toastify";
import { ENGINE_COLORS } from "@/presentation/lib/databaseOptions";
import { DeleteProjectModal } from "@/presentation/components/modals/DeleteProjectModal";
import { RenameProjectModal } from "@/presentation/components/modals/RenameProjectModal";
import { CreateProjectModal } from "@/presentation/components/modals/CreateProjectModal";

export default function Home() {
  const router = useRouter();
  const {
    projectsList,
    loadProjects,
    createProject,
    deleteProject,
    renameProject,
    exportProject,
    isLoading,
  } = useSchemaStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCreate = async (name: string, engine: DbEngine) => {
    setCreating(true);
    await createProject(name, engine);
    const state = useSchemaStore.getState();
    if (state.activeProject) router.push(`/projects/${state.activeProject.id}`);
    setCreating(false);
    setShowCreateModal(false);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const name =
      projectsList.find((p) => p.id === confirmDeleteId)?.name ?? "Project";
    setDeleting(true);
    await deleteProject(confirmDeleteId);
    setDeleting(false);
    setConfirmDeleteId(null);
    toast.error(`"${name}" deleted`, { autoClose: 2500 });
  };

  const handleExport = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    await exportProject(projectId);
    toast.success("Export successful!", { autoClose: 2000 });
  };

  const handleRename = async (newName: string) => {
    if (!renameProjectId) return;
    setRenaming(true);
    await renameProject(renameProjectId, newName);
    setRenaming(false);
    setRenameProjectId(null);
    toast.success("Project renamed");
  };

  const openRenameModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setRenameProjectId(id);
  };

  if (isLoading && projectsList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              SchemaBuilder<span className="text-blue-600">.io</span>
            </h1>
          </div>
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </header>

        {/* Projects Grid */}
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-4 px-1">
            Recent Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projectsList.map((project) => (
              <div
                key={project.id}
                className="group border border-slate-200 rounded-xl p-5 bg-white hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-semibold text-lg text-slate-800 mb-3 group-hover:text-blue-700 transition-colors pr-4">
                  {project.name}
                </h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={`border px-2.5 py-1 rounded-md font-medium text-xs ${ENGINE_COLORS[project.engine] ?? "text-slate-600 bg-slate-50 border-slate-200"}`}
                    >
                      {project.engine}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Action buttons — appear on hover */}
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => openRenameModal(e, project.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleExport(e, project.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Export"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(project.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {projectsList.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-500 bg-white rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
                <Database className="w-12 h-12 text-slate-300" />
                <div>
                  <h3 className="text-lg font-medium text-slate-700">
                    No projects yet
                  </h3>
                  <p className="text-sm mt-1">
                    Create your first schema design project to get started.
                  </p>
                </div>
                <Button
                  onClick={openCreateModal}
                  variant="outline"
                  className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      <CreateProjectModal
        key={showCreateModal ? `open-${projectsList.length}` : "closed"}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        isLoading={creating}
        initialProjectName={`New Project ${projectsList.length + 1}`}
      />

      <DeleteProjectModal
        isOpen={!!confirmDeleteId}
        projectName={
          projectsList.find((p) => p.id === confirmDeleteId)?.name ?? ""
        }
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <RenameProjectModal
        key={renameProjectId || "none"}
        isOpen={!!renameProjectId}
        projectName={
          projectsList.find((p) => p.id === renameProjectId)?.name ?? ""
        }
        onClose={() => setRenameProjectId(null)}
        onConfirm={handleRename}
        isLoading={renaming}
      />
    </div>
  );
}
