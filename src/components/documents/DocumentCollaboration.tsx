import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentCollaborationProps {
  documentId: string;
}

export const DocumentCollaboration = ({ documentId }: DocumentCollaborationProps) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['document-comments', documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel(`document-comments-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['document-comments', documentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, queryClient]);

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          user_id: user.id,
          content
        });
      
      if (error) throw error;

      // Track analytics
      await supabase.from('document_analytics').insert({
        document_id: documentId,
        user_id: user.id,
        action: 'comment_added'
      });
    },
    onSuccess: () => {
      setComment('');
      toast.success('Comment added');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Team Comments</h3>
      </div>

      <ScrollArea className="h-80 mb-4">
        <div className="space-y-4 pr-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Start the conversation!
            </p>
          ) : (
            comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {c.user_id.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-sm">{c.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="rounded-xl"
          rows={2}
        />
        <Button
          onClick={() => addComment.mutate(comment)}
          disabled={!comment.trim() || addComment.isPending}
          size="icon"
          className="rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
