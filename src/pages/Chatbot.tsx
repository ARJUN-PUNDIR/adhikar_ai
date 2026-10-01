import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User as UserIcon, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { PageTransition } from '@/components/ui/PageTransition';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const Chatbot = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      return (data || []) as Conversation[];
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });
      return (data || []) as Message[];
    },
    enabled: !!selectedConversation
  });

  // Auto-select first conversation or create new one
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const createNewConversation = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation'
      })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to create conversation');
      return;
    }
    
    await queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    setSelectedConversation(data.id);
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
    
    if (error) {
      toast.error('Failed to delete conversation');
      return;
    }
    
    await queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user || !selectedConversation) return;
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      conversation_id: selectedConversation,
      role,
      content
    });
  };

  const updateConversationTitle = async (firstMessage: string) => {
    if (!user || !selectedConversation) return;
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', selectedConversation);
    await queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
  };

  const streamChat = async (userMessage: string) => {
    if (!user || !selectedConversation) return;

    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // If this is the first message, update conversation title
      if (messages.length === 0) {
        await updateConversationTitle(userMessage);
      }

      // Save user message
      await saveMessage('user', userMessage);
      await queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedConversation] });

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;
      
      const systemContextMessage = {
        role: 'user', 
        content: `System Context: The user is a ${user.user_metadata?.role || 'owner'} at ${user.user_metadata?.business_name || 'an MSME'}, operating in the ${user.user_metadata?.business_type || 'unspecified'} sector in India. Keep this context in mind to tailor your legal and compliance advice specifically for their business type.` 
      };

      const messagesPayload = messages.length === 0 
        ? [systemContextMessage, { role: 'user', content: userMessage }]
        : [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ];

      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messagesPayload
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
          return;
        }
        if (response.status === 402) {
          toast.error('Payment required. Please add credits to your workspace.');
          return;
        }
        throw new Error('Failed to start stream');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              setStreamingMessage(fullResponse);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (fullResponse) {
        await saveMessage('assistant', fullResponse);
        await queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedConversation] });
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', selectedConversation);
        await queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      }
      
      setStreamingMessage('');
    } catch (error) {
      console.error('Streaming error:', error);
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    // Create new conversation if none selected
    if (!selectedConversation) {
      await createNewConversation();
      // Wait a bit for the conversation to be created and selected
      setTimeout(async () => {
        const userMessage = input.trim();
        setInput('');
        await streamChat(userMessage);
      }, 100);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    await streamChat(userMessage);
  };

  return (
    <PageTransition className="flex h-[calc(100vh-4rem)] lg:h-screen">
      {/* Sidebar */}
      <div className={cn(
        "w-64 border-r bg-card/50 backdrop-blur flex flex-col transition-all duration-300",
        showSidebar ? "translate-x-0" : "-translate-x-full absolute lg:relative"
      )}>
        <div className="p-4 border-b">
          <Button 
            onClick={createNewConversation}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-accent group transition-colors",
                selectedConversation === conversation.id && "bg-accent"
              )}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <button
                onClick={() => setSelectedConversation(conversation.id)}
                className="flex-1 text-left text-sm truncate"
              >
                {conversation.title}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conversation.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 lg:p-6 border-b">
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Legal Assistant</h1>
          <p className="text-muted-foreground text-sm">Expert guidance on MSME legal compliance</p>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-strong bg-card/50 backdrop-blur m-4 lg:m-6">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {messages.length === 0 && !streamingMessage && selectedConversation && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 max-w-2xl">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-medium">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Welcome to AdhikarAI</h3>
                  <p className="text-muted-foreground text-sm">Your expert legal assistant for Indian MSME compliance</p>
                </div>
                <div className="grid gap-3 max-w-lg mx-auto">
                  <button
                    onClick={() => setInput("What are the GST requirements for MSMEs?")}
                    className="text-left p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all hover:shadow-medium border border-border"
                  >
                    <p className="text-sm font-medium">GST requirements for MSMEs</p>
                    <p className="text-xs text-muted-foreground mt-1">Learn about tax compliance</p>
                  </button>
                  <button
                    onClick={() => setInput("How do I register my MSME business?")}
                    className="text-left p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all hover:shadow-medium border border-border"
                  >
                    <p className="text-sm font-medium">MSME registration process</p>
                    <p className="text-xs text-muted-foreground mt-1">Step-by-step guidance</p>
                  </button>
                  <button
                    onClick={() => setInput("What labor laws apply to my business?")}
                    className="text-left p-4 rounded-xl bg-accent hover:bg-accent/80 transition-all hover:shadow-medium border border-border"
                  >
                    <p className="text-sm font-medium">Labor law compliance</p>
                    <p className="text-xs text-muted-foreground mt-1">Understand your obligations</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-soft">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 shadow-soft',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 backdrop-blur border border-border'
                )}
              >
                {message.role === 'user' ? (
                  <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm lg:text-base leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 shadow-soft">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {streamingMessage && (
            <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-soft">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="max-w-[85%] lg:max-w-[75%] rounded-2xl px-4 py-3 bg-muted/50 backdrop-blur border border-border shadow-soft">
                <div className="text-sm lg:text-base leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                  <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {isStreaming && !streamingMessage && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-soft">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-muted/50 backdrop-blur border border-border shadow-soft">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

            {!selectedConversation && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Bot className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold">No conversation selected</h3>
                    <p className="text-muted-foreground text-sm mt-2">Start a new chat to begin</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t bg-background/95 backdrop-blur p-4 lg:p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedConversation ? "Ask about legal compliance, regulations, documents..." : "Create a new chat to start"}
                disabled={isStreaming}
                className="flex-1 h-12 rounded-xl border-border bg-background shadow-soft focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button 
                type="submit" 
                disabled={isStreaming || !input.trim()}
                className="h-12 px-6 rounded-xl shadow-soft hover:shadow-medium transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Chatbot;
