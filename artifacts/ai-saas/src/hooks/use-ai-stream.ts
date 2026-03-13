import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useAiStream() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = useCallback(async (url: string, body: Record<string, any>) => {
    setIsLoading(true);
    setContent('');
    setError(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Important for passing Replit auth cookies if required
        credentials: 'omit', 
      });

      if (!res.ok) {
        let errMsg = 'Failed to generate content';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      if (!res.body) throw new Error('No response body received');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                
                // Handle different SSE chunk formats (chat vs generic tools)
                if (data.content) {
                  setContent(prev => prev + data.content);
                } else if (data.type === 'transcript' && data.data) {
                  setContent(prev => prev + data.data);
                }
                
                if (data.done) {
                  done = true;
                }
              } catch (e) {
                // Ignore incomplete JSON chunks from split boundaries
              }
            }
          }
        }
      }
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Generation Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { content, isLoading, error, generate, setContent };
}
