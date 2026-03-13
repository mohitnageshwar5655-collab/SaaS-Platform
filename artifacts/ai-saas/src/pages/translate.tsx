import { useState } from "react";
import { useAiStream } from "@/hooks/use-ai-stream";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Loader2, Languages, Sparkles, Copy, CheckCheck, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function TranslateGenerator() {
  const { content, isLoading, generate } = useAiStream();
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("Spanish");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    generate("/api/tools/generate", {
      toolType: "translate",
      prompt,
      language
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
        <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-4 text-white">
          <div className="p-3 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <Languages className="w-7 h-7" />
          </div>
          Smart Translator
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">Context-aware translations that preserve idioms and technical terms.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 glass-panel p-6 rounded-2xl flex flex-col h-full"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-white/80">Source Text</Label>
            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md">Auto-detect</span>
          </div>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter text to translate..."
            className="flex-1 min-h-[300px] bg-background/50 border-white/10 focus-visible:ring-orange-500 text-lg resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] transition-all active-elevate-2 hover-elevate border-0 mt-auto"
          >
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
            Translate
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 glass-panel p-6 rounded-2xl flex flex-col h-full relative"
        >
          <div className="absolute top-[40%] -left-8 z-20 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-card border border-white/10 shadow-xl">
            <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-white/80">Target Language</Label>
            <select 
              value={language} 
              onChange={e => setLanguage(e.target.value)}
              className="flex h-9 w-40 items-center justify-between rounded-lg border border-white/10 bg-background/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Russian">Russian</option>
              <option value="Hindi">Hindi</option>
              <option value="Arabic">Arabic</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px] bg-background/30 rounded-xl border border-white/5 p-4 relative overflow-auto">
            {content ? (
              <>
                <div className="absolute top-2 right-2 z-10">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="bg-background/80 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-lg">
                    {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-lg w-full">
                  <MarkdownRenderer content={content} />
                </div>
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/60 text-center">
                <Languages className="w-12 h-12 mb-4 opacity-20" />
                <p>Translation will appear here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
