"use client";

import { useSchemaStore } from "../../store/schemaStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import { AddColumnUseCase } from "../../../application/use-cases/column/AddColumnUseCase";
import { UpdateColumnUseCase } from "../../../application/use-cases/column/UpdateColumnUseCase";
import { UpdateTableUseCase } from "../../../application/use-cases/table/UpdateTableUseCase";
import { DeleteColumnUseCase } from "../../../application/use-cases/column/DeleteColumnUseCase";
import { DeleteTableUseCase } from "../../../application/use-cases/table/DeleteTableUseCase";
import { DbEngine } from "../../../domain/value-objects/DbEngine";
import { toast } from "react-toastify";

const getEngineTypes = (engine: DbEngine) => {
  switch (engine) {
    case DbEngine.PostgreSQL:
      return ["SERIAL", "INTEGER", "BIGINT", "VARCHAR", "TEXT", "BOOLEAN", "TIMESTAMP", "DATE", "JSONB", "UUID", "FLOAT", "DOUBLE PRECISION"];
    case DbEngine.MySQL:
    case DbEngine.MariaDB:
      return ["INT", "BIGINT", "VARCHAR", "TEXT", "BOOLEAN", "DATETIME", "DATE", "JSON", "FLOAT", "DOUBLE"];
    case DbEngine.MongoDB:
      return ["ObjectId", "String", "Number", "Boolean", "Date", "Array", "Object"];
    default:
      return ["INTEGER", "VARCHAR", "TEXT", "BOOLEAN", "DATE", "FLOAT"];
  }
};

export default function PropertiesPanel() {
  const { activeProject, selectedElement, setSelectedElement, updateActiveProject } = useSchemaStore();

  if (!activeProject || !selectedElement) return null;

  const table = activeProject.tables.find(t => t.id === selectedElement.tableId);
  if (!table) return null;

  const handleUpdateTable = (field: string, value: string) => {
    updateActiveProject((project) => {
      new UpdateTableUseCase().execute(project, table.id, { [field]: value });
    });
  };

  const handleAddColumn = () => {
    updateActiveProject((project) => {
      const defaultType = getEngineTypes(project.engine)[0] ?? "VARCHAR";
      new AddColumnUseCase().execute(project, table.id, `new_column_${table.columns.length + 1}`, defaultType);
    });
  };

  const handleUpdateColumn = (colId: string, field: string, value: string | boolean | number) => {
    updateActiveProject((project) => {
      new UpdateColumnUseCase().execute(project, table.id, colId, { [field]: value });
    });
  };

  const handleDeleteColumn = (colId: string) => {
    const colName = table.columns.find(c => c.id === colId)?.name ?? "Column";
    updateActiveProject((project) => {
      new DeleteColumnUseCase().execute(project, table.id, colId);
    });
    toast.warn(`Column "${colName}" deleted`, { autoClose: 2000 });
  };

  const handleDeleteTable = () => {
    const tableName = table.name;
    updateActiveProject((project) => {
      new DeleteTableUseCase().execute(project, table.id);
    });
    setSelectedElement(null);
    toast.error(`Table "${tableName}" deleted`, { autoClose: 2500 });
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col h-full z-10 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="font-semibold text-slate-700 text-sm">Properties</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedElement(null)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Table Settings</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDeleteTable}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tableName" className="text-xs text-slate-600">Table Name</Label>
            <Input 
              id="tableName" 
              value={table.name} 
              onChange={(e) => handleUpdateTable('name', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tableNote" className="text-xs text-slate-600">Note</Label>
            <Input 
              id="tableNote" 
              value={table.note || ''} 
              onChange={(e) => handleUpdateTable('note', e.target.value)}
              className="h-8 text-sm placeholder:text-slate-300"
              placeholder="Added to export comments"
            />
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Columns</h3>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleAddColumn}>
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          
          <div className="space-y-3">
            {table.columns.map(col => (
              <div key={col.id} className="p-3 border border-slate-200 rounded-md bg-slate-50 space-y-3 relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                  onClick={() => handleDeleteColumn(col.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
                
                <div className="space-y-2 pr-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase">Name</Label>
                    <Input 
                      value={col.name} 
                      onChange={(e) => handleUpdateColumn(col.id, 'name', e.target.value)}
                      className="h-7 text-xs px-2 w-full"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-slate-500 uppercase">Type</Label>
                    <select
                      value={col.type}
                      onChange={(e) => handleUpdateColumn(col.id, 'type', e.target.value)}
                      className="h-7 text-xs px-2 font-mono w-full rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {getEngineTypes(activeProject.engine).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      checked={col.isPrimaryKey}
                      onChange={(e) => handleUpdateColumn(col.id, 'isPrimaryKey', e.target.checked)}
                    />
                    PK
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      checked={col.isNullable}
                      onChange={(e) => handleUpdateColumn(col.id, 'isNullable', e.target.checked)}
                    />
                    Null
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                      checked={col.isUnique}
                      onChange={(e) => handleUpdateColumn(col.id, 'isUnique', e.target.checked)}
                    />
                    Unique
                  </label>
                </div>
              </div>
            ))}
            {table.columns.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-md">
                No columns defined.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
