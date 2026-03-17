import { useState } from "react";
import { useGetGenerationHistory } from "@workspace/api-client-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { History, Loader2, Calendar, Trash2, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const TOOL_LABELS: Record<string, { label: string; color: string }> = {
  email: { label: "Email", color: "blue" },
  social: { label: "Social", color: "pink" },
  blog: { label: "Blog", color: "purple" },
  code: { label: "Code", color: "emerald" },
  translate: { label: "Translate", color: "orange" },
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { data: history, isLoading, error } = useGetGenerationHistory({ query: { retry: false } });
  const [filter, setFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await fetch(`/api/tools/history/${id}`, { method: "DELETE", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: ["getGenerationHistory"] });
    } catch {}
    setDeleting(null);
  };

  const toolTypes = ["all", ...Object.keys(TOOL_LABELS)];
  const filtered = filter === "all" ? history : history?.filter(h => h.toolType === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-4 text-white">
          <div className="p-3 bg-white/10 text-white rounded-xl border border-white/20 shadow-lg">
            <History className="w-7 h-7" />
          </div>
          Your Generations
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">Review and manage your past AI tool outputs.</p>
      </motion.div>

      {/* Filter bar */}
      {!isLoading && history && history.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {toolTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                filter === t
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              {t === "all" ? "All" : (TOOL_LABELS[t]?.label ?? t)}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">{filtered?.length ?? 0} items</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20 text-white" />
          <p className="text-white/60">History feature is currently unavailable or empty.</p>
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20 text-white" />
          <h3 className="text-xl font-medium text-white/80 mb-2">
            {filter === "all" ? "No history yet" : `No ${TOOL_LABELS[filter]?.label ?? filter} items`}
          </h3>
          <p className="text-muted-foreground">
            {filter === "all"
              ? "Generate some content using the tools to see it here."
              : "Try a different filter or generate some content."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filtered.map((item, i) => {
            const toolMeta = TOOL_LABELS[item.toolType];
            const colorClass = colorMap[toolMeta?.color ?? "indigo"];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row gap-6 group"
              >
                <div className="md:w-1/3 flex flex-col space-y-3 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("uppercase tracking-wider text-xs font-bold px-2 py-1 rounded border", colorClass)}>
                      {toolMeta?.label ?? item.toolType}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1 rounded-md hover:bg-red-500/10"
                        title="Delete"
                      >
                        {deleting === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Prompt</h4>
                    <p className="text-sm text-muted-foreground line-clamp-5">{item.prompt}</p>
                  </div>
                </div>

                <div className="md:w-2/3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 sticky top-0 bg-card/80 backdrop-blur-md pb-2 z-10">Output</h4>
                  <MarkdownRenderer content={item.result} className="prose-sm" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
