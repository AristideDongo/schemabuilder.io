import { Handle, Position } from "@xyflow/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TableNode({ data }: { data: any }) {
  const isSelected = data.isSelected;
  return (
    <div className={`bg-card border-2 rounded-md min-w-[200px] shadow-sm relative transition-all duration-200 overflow-visible ${
      isSelected ? "node-selected border-blue-500" : "border-border hover:border-blue-400/50 hover:shadow-md"
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        id={`tgt-${data.id}`}
        className="w-3 h-3 rounded-full bg-blue-500! border-2 border-background"
        style={{ left: -8, top: '50%' }}
      />
      <div className="bg-muted/50 p-2 font-bold text-sm border-b border-border text-foreground">
        {data.label}
      </div>
      <div className="p-2 space-y-1">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {data.columns?.map((col: any) => {
          const isPK = col.isPrimaryKey || col.constraints?.includes("PK");
          const isFK = col.constraints?.includes("FK");
          
          return (
            <div key={col.id} className="text-xs text-muted-foreground flex justify-between relative px-2 py-1 bg-secondary/30 rounded items-center">
              <div className="flex items-center gap-1.5">
                {isPK && <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded border border-amber-500/20" title="Primary Key">PK</span>}
                {isFK && <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1 rounded border border-blue-500/20" title="Foreign Key">FK</span>}
                <span className="text-foreground/90">{col.name}</span>
              </div>
              <span className="text-muted-foreground/60 ml-4 font-mono">{col.type}</span>
            </div>
          );
        })}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={`src-${data.id}`}
        className="w-3 h-3 rounded-full bg-blue-500! border-2 border-background"
        style={{ right: -8, top: '50%' }}
      />
    </div>
  );
}
