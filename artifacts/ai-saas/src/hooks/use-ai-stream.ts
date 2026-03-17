import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type UsageInfo = {
  used: number;
  limit: number;
  remaining: number;
  isLimitReached: boolean;
};

export function useAiStream(onUsageUpdate?: (usage: UsageInfo) => void) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const { toast } = useToast();

  const generate = useCallback(async (url: string, body: Record<string, any>) => {
    setIsLoading(true);
    setContent('');
    setError(null);
    setIsLimitReached(false);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (res.status === 429) {
        const data = await res.json();
        setIsLimitReached(true);
        const errMsg = 'Daily limit reached. You have used all 10 free generations for today.';
        setError(errMsg);
        if (onUsageUpdate) {
          onUsageUpdate({ used: data.used, limit: data.limit, remaining: 0, isLimitReached: true });
        }
        toast({
          title: '⚠️ Daily Limit Reached',
          description: 'You have used all 10 free generations today. Limit resets at midnight.',
          variant: 'destructive',
        });
        return;
      }

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

                if (data.content) {
                  setContent(prev => prev + data.content);
                } else if (data.type === 'transcript' && data.data) {
                  setContent(prev => prev + data.data);
                }

                if (data.done) {
                  done = true;
                  if (data.usage && onUsageUpdate) {
                    onUsageUpdate(data.usage);
                  }
                }

                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e: any) {
                if (e.message && !e.message.includes('JSON')) throw e;
              }
            }
          }
        }
      }
    } catch (e: any) {
      setError(e.message);
      toast({
        title: 'Generation Failed',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, onUsageUpdate]);

  return { content, isLoading, error, isLimitReached, generate, setContent };
}
