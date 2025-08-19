import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getProfileById, sendMessage, getConversations, createConversation, Message } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser || !userId) {
      navigate("/auth");
      return;
    }
    initializeChat();
  }, [currentUser, userId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Get other user's profile
      const profile = await getProfileById(userId!);
      setOtherUser(profile);

      // Get existing conversations
      const conversations = await getConversations();
      const existingConversation = conversations.find(conv => 
        conv.conversation_participants?.some(p => p.user_id === userId)
      );

      if (existingConversation) {
        setConversationId(existingConversation.id);
        setMessages(existingConversation.messages || []);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !userId) return;

    try {
      let currentConversationId = conversationId;

      // Create conversation if it doesn't exist
      if (!currentConversationId) {
        const newConversation = await createConversation([currentUser.id, userId]);
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      }

      // Send message
      const message = await sendMessage(currentConversationId, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage("");

      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft size={24} />
            </Button>
            <button 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/user/${otherUser.user_id}`)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {(otherUser.full_name || otherUser.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h1 className="font-semibold text-foreground">{otherUser.username}</h1>
                <p className="text-xs text-muted-foreground">
                  {otherUser.full_name}
                </p>
              </div>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-foreground">
              <Phone size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Video size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-xl">
                {(otherUser.full_name || otherUser.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-foreground mb-2">{otherUser.username}</h2>
            <p className="text-muted-foreground text-center mb-6">
              Start a conversation with {otherUser.full_name || otherUser.username}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[70%] ${
                  message.sender_id === currentUser.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === currentUser.id 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full border-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="rounded-full bg-primary text-primary-foreground"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;