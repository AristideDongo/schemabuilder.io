import { Handle, Position } from "@xyflow/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TableNode({ data }: { data: any }) {
  const isSelected = data.isSelected;
  return (
    <div className={`bg-white border-2 rounded-md min-w-[200px] shadow-sm relative transition-all duration-200 overflow-visible ${
      isSelected ? "node-selected" : "border-slate-200 hover:border-blue-200 hover:shadow-md"
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id={`tgt-${data.id}`}
        className="w-3 h-3 rounded-full bg-blue-500! border-2 border-white"
        style={{ left: -8, top: '50%' }}
      />
      <div className="bg-slate-100 p-2 font-bold text-sm border-b border-slate-200 text-slate-800">
        {data.label}
      </div>
      <div className="p-2 space-y-1">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {data.columns?.map((col: any) => {
          const isPK = col.isPrimaryKey || col.constraints?.includes("PK");
          const isFK = col.constraints?.includes("FK");
          
          return (
            <div key={col.id} className="text-xs text-slate-600 flex justify-between relative px-2 py-1 bg-slate-50 rounded items-center">
              <div className="flex items-center gap-1.5">
                {isPK && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1 rounded border border-amber-200" title="Primary Key">PK</span>}
                {isFK && <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-1 rounded border border-blue-200" title="Foreign Key">FK</span>}
                <span>{col.name}</span>
              </div>
              <span className="text-slate-400 ml-4 font-mono">{col.type}</span>
            </div>
          );
        })}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={`src-${data.id}`}
        className="w-3 h-3 rounded-full bg-blue-500! border-2 border-white"
        style={{ right: -8, top: '50%' }}
      />
    </div>
  );
}
