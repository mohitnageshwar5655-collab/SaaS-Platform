import { useState } from "react";
import { useAiStream } from "@/hooks/use-ai-stream";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Loader2, Code2, Sparkles, Copy, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CodeGenerator() {
  const { content, isLoading, generate } = useAiStream();
  const [prompt, setPrompt] = useState("");
  const [programmingLanguage, setProgrammingLanguage] = useState("TypeScript");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    generate("/api/tools/generate", {
      toolType: "code",
      prompt,
      programmingLanguage
    });
  };

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4">
          <Sparkles className="w-3 h-3" />
          <span>Powered by gpt-5.3-codex</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-4 text-white">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Code2 className="w-7 h-7" />
          </div>
          Code Generator
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">Generate, debug, or explain complex code structures instantly.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6 glass-panel p-6 rounded-2xl"
        >
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">Describe what to build</Label>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Write a React hook for debouncing input values..."
              className="h-40 bg-background/50 border-white/10 focus-visible:ring-emerald-500 font-mono text-sm"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">Language / Tech Stack</Label>
            <select 
              value={programmingLanguage} 
              onChange={e => setProgrammingLanguage(e.target.value)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="TypeScript">TypeScript / React</option>
              <option value="JavaScript">JavaScript (Node.js)</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
              <option value="SQL">SQL (PostgreSQL)</option>
              <option value="Bash">Bash / Shell</option>
              <option value="HTML/CSS">HTML & CSS / Tailwind</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active-elevate-2 hover-elevate border-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Code2 className="w-5 h-5 mr-2" />}
            Generate Code
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 min-h-[500px] glass-panel p-6 sm:p-8 rounded-2xl flex flex-col relative overflow-hidden"
        >
          {content ? (
            <>
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="bg-background/80 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-lg">
                  {copied ? <CheckCheck className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy All"}
                </Button>
              </div>
              <div className="flex-1 overflow-auto mt-4 pb-4 w-full">
                <MarkdownRenderer content={content} />
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 m-auto text-center max-w-sm">
              <div className="w-20 h-20 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Code2 className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-medium text-white/80 mb-2">Waiting for input</h3>
              <p>Your high-quality, documented code will be streamed right here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
