import { useState, useCallback } from "react";
import { useAiStream, type UsageInfo } from "@/hooks/use-ai-stream";
import { ModelSelector, type AIModel } from "@/components/ui/model-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Loader2, Mail, Sparkles, Copy, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

export default function EmailGenerator() {
  const queryClient = useQueryClient();
  const [aiModel, setAiModel] = useState<AIModel>("openai");

  const onUsageUpdate = useCallback((usage: UsageInfo) => {
    queryClient.invalidateQueries({ queryKey: ["getUsageStatus"] });
  }, [queryClient]);

  const { content, isLoading, isLimitReached, generate } = useAiStream(onUsageUpdate);
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("English");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt || isLimitReached) return;
    generate("/api/tools/generate", { toolType: "email", prompt, tone, language, aiModel });
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
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Mail className="w-7 h-7" />
          </div>
          Email Drafter
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">Generate context-aware professional emails in seconds.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-5 glass-panel p-6 rounded-2xl"
        >
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Model</Label>
            <ModelSelector value={aiModel} onChange={setAiModel} />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">What is this email about?</Label>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. Following up on the marketing proposal from last week..."
              className="h-36 bg-background/50 border-white/10 focus-visible:ring-blue-500 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">Tone of Voice</Label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="professional">Professional & Formal</option>
              <option value="casual">Casual & Friendly</option>
              <option value="persuasive">Persuasive & Direct</option>
              <option value="urgent">Urgent & Important</option>
              <option value="apologetic">Apologetic & Polite</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">Language</Label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Hindi">Hindi</option>
              <option value="Arabic">Arabic</option>
              <option value="Chinese">Chinese (Simplified)</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt || isLimitReached}
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all border-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
            {isLimitReached ? "Daily Limit Reached" : "Generate Draft"}
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 min-h-[500px] glass-panel p-6 sm:p-8 rounded-2xl flex flex-col relative"
        >
          {content ? (
            <>
              <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="bg-background/80 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-lg">
                  {copied ? <CheckCheck className="w-4 h-4 mr-2 text-green-400" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="flex-1 overflow-auto mt-4 pb-4">
                <MarkdownRenderer content={content} />
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 m-auto text-center max-w-sm">
              <div className="w-20 h-20 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Mail className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-medium text-white/80 mb-2">No content yet</h3>
              <p>Fill out the form on the left and click generate to create your email draft.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
