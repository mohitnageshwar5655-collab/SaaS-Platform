import { useGetGenerationHistory } from "@workspace/api-client-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { History, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function HistoryPage() {
  // Let missing APIs fail gracefully or return empty arrays
  const { data: history, isLoading, error } = useGetGenerationHistory({ query: { retry: false }});

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-4 text-white">
          <div className="p-3 bg-white/10 text-white rounded-xl border border-white/20 shadow-lg">
            <History className="w-7 h-7" />
          </div>
          Your Generations
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">Review your past AI tool outputs.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20 text-white" />
          <p className="text-white/60">History feature is currently unavailable or empty.</p>
        </div>
      ) : !history || history.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center">
          <History className="w-12 h-12 mx-auto mb-4 opacity-20 text-white" />
          <h3 className="text-xl font-medium text-white/80 mb-2">No history yet</h3>
          <p className="text-muted-foreground">Generate some content using the tools to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row gap-6"
            >
              <div className="md:w-1/3 flex flex-col space-y-3 pr-6 border-r border-white/5">
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-wider text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                    {item.toolType}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-1">Prompt</h4>
                  <p className="text-sm text-muted-foreground line-clamp-4">{item.prompt}</p>
                </div>
              </div>
              
              <div className="md:w-2/3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                <h4 className="text-sm font-semibold text-white/80 mb-3 sticky top-0 bg-card/80 backdrop-blur-md pb-2 z-10">Output</h4>
                <MarkdownRenderer content={item.result} className="prose-sm" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
