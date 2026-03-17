import { useState, useCallback } from "react";
import { useAiStream, type UsageInfo } from "@/hooks/use-ai-stream";
import { ModelSelector, type AIModel } from "@/components/ui/model-selector";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Loader2, Share2, Sparkles, Copy, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

export default function SocialGenerator() {
  const queryClient = useQueryClient();
  const [aiModel, setAiModel] = useState<AIModel>("openai");

  const onUsageUpdate = useCallback((_usage: UsageInfo) => {
    queryClient.invalidateQueries({ queryKey: ["getUsageStatus"] });
  }, [queryClient]);

  const { content, isLoading, isLimitReached, generate } = useAiStream(onUsageUpdate);
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [tone, setTone] = useState("thought-leadership");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt || isLimitReached) return;
    generate("/api/tools/generate", { toolType: "social", prompt, platform, tone, aiModel });
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
          <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/20 shadow-lg shadow-pink-500/10">
            <Share2 className="w-7 h-7" />
          </div>
          Social & Blog Creator
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">Generate engaging, platform-optimized social media and blog posts.</p>
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
            <Label className="text-sm font-semibold text-white/80">Topic or Content</Label>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. 5 tips for productive remote work..."
              className="h-36 bg-background/50 border-white/10 focus-visible:ring-pink-500 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">Platform</Label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="Twitter">Twitter / X</option>
              <option value="Instagram">Instagram (Caption)</option>
              <option value="Facebook">Facebook</option>
              <option value="Blog Post">Blog Post (SEO Optimized)</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white/80">Tone</Label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            >
              <option value="thought-leadership">Thought Leadership</option>
              <option value="informational">Informational & Educational</option>
              <option value="humorous">Humorous & Witty</option>
              <option value="controversial">Spicy / Controversial</option>
              <option value="inspirational">Inspirational & Motivational</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt || isLimitReached}
            className="w-full h-12 text-base font-semibold bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-[0_0_20px_rgba(219,39,119,0.3)] hover:shadow-[0_0_25px_rgba(219,39,119,0.5)] transition-all border-0"
          >
            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
            {isLimitReached ? "Daily Limit Reached" : "Generate Content"}
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
                <Share2 className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-medium text-white/80 mb-2">Ready to create?</h3>
              <p>Your optimized social content or blog post will be crafted and displayed here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
