import { useSchemaStore } from "../../store/schemaStore";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, Trash2 } from "lucide-react";
import { Table } from "../../../domain/entities/Table";

export default function Sidebar() {
  const { 
    activeProject, 
    updateActiveProject, 
    setSelectedElement, 
    selectedElement,
    deleteTable 
  } = useSchemaStore();

  if (!activeProject) return null;

  const handleAddTable = () => {
    updateActiveProject((project) => {
      const newTable = new Table(
        crypto.randomUUID(), 
        `table_${project.tables.length + 1}`,
        [],
        Math.random() * 200 + 100, // random x
        Math.random() * 200 + 100  // random y
      );
      project.addTable(newTable);
    });
  };

  const handleTableClick = (tableId: string) => {
    setSelectedElement({ type: 'table', tableId });
  };

  const handleDeleteTable = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    deleteTable(tableId);
  };

  return (
    <div className="w-64 border-r border-slate-200 bg-white flex flex-col h-full z-10 shadow-sm">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Tables</h2>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={handleAddTable}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {activeProject.tables.map(table => {
          const isSelected = selectedElement?.type === 'table' && selectedElement.tableId === table.id;
          
          return (
            <div 
              key={table.id} 
              onClick={() => handleTableClick(table.id)}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-all group ${
                isSelected 
                  ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm" 
                  : "text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3 truncate pr-2">
                <TableIcon className={`w-4 h-4 ${isSelected ? "text-blue-500" : "text-slate-400"}`} />
                <span className="truncate font-medium">{table.name}</span>
              </div>
              <button 
                onClick={(e) => handleDeleteTable(e, table.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                title="Delete table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {activeProject.tables.length === 0 && (
          <div className="text-xs text-slate-400 text-center py-6">
            No tables yet. Click + to add one.
          </div>
        )}
      </div>
    </div>
  );
}
