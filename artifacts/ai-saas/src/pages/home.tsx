import { Link } from "wouter";
import { Mail, Share2, Code2, Languages, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  {
    title: "Email Drafter",
    description: "Generate professional emails with the right tone in seconds.",
    icon: Mail,
    href: "/email",
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Social Media Posts",
    description: "Create engaging content optimized for LinkedIn, Twitter, and more.",
    icon: Share2,
    href: "/social",
    color: "from-pink-500 to-rose-500"
  },
  {
    title: "Code Generator",
    description: "Write, explain, and debug code using advanced models.",
    icon: Code2,
    href: "/code",
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Translator",
    description: "Accurate context-aware translations across 30+ languages.",
    icon: Languages,
    href: "/translate",
    color: "from-orange-500 to-amber-500"
  },
  {
    title: "AI Chat Assistant",
    description: "Multi-turn conversational memory for complex ongoing tasks.",
    icon: MessageSquare,
    href: "/chat",
    color: "from-violet-500 to-purple-500"
  }
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mt-8 md:mt-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>New: GPT-5.3 Codex now available</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
          Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI Workspace</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Streamline your workflow with specialized AI tools. Draft emails, generate code, create social content, and converse with advanced models all in one beautifully designed platform.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tools.map((tool, i) => (
          <Link key={tool.title} href={tool.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="group h-full p-6 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl cursor-pointer hover:bg-card/60 hover:border-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} p-0.5 mb-6 shadow-lg`}>
                <div className="w-full h-full bg-card/80 backdrop-blur-sm rounded-[10px] flex items-center justify-center">
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">{tool.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{tool.description}</p>
              
              <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors">
                Try it out <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
