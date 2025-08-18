import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Phone, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  getCurrentUser, 
  getUserById, 
  getConversations,
  saveConversation,
  generateId,
  User, 
  Conversation,
  Message 
} from "@/lib/storage";

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setCurrentUser(user);
    
    if (userId) {
      const other = getUserById(userId);
      if (other) {
        setOtherUser(other);
        
        // Find existing conversation
        const conversations = getConversations(user.id);
        const existingConv = conversations.find(conv => 
          conv.participants.includes(userId)
        );
        
        if (existingConv) {
          setConversation(existingConv);
          setMessages(existingConv.messages);
        } else {
          // Create new conversation structure
          const newConv: Conversation = {
            id: generateId(),
            participants: [user.id, userId],
            messages: [],
            lastMessage: {
              id: '',
              fromUserId: '',
              toUserId: '',
              content: '',
              createdAt: new Date().toISOString(),
              read: true
            }
          };
          setConversation(newConv);
          setMessages([]);
        }
      }
    }
  }, [userId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !otherUser || !conversation) return;

    const message: Message = {
      id: generateId(),
      fromUserId: currentUser.id,
      toUserId: otherUser.id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    const updatedMessages = [...messages, message];
    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      lastMessage: message
    };

    setMessages(updatedMessages);
    setConversation(updatedConversation);
    saveConversation(updatedConversation);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser || !otherUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/messages")}
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft size={20} />
            </Button>
            <button
              onClick={() => navigate(`/user/${otherUser.id}`)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {otherUser.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">{otherUser.username}</h1>
                  {otherUser.isVerified && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground h-5 w-5 p-0 rounded-full flex items-center justify-center">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{otherUser.fullName}</p>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary"
            >
              <Phone size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary"
            >
              <Video size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary"
            >
              <Info size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                {otherUser.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-foreground mb-2">{otherUser.fullName}</h3>
            <p className="text-muted-foreground text-center mb-4">@{otherUser.username}</p>
            <p className="text-muted-foreground text-center text-sm">
              This is the beginning of your conversation with {otherUser.fullName}.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.fromUserId === currentUser.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.fromUserId === currentUser.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.fromUserId === currentUser.id
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-full border-input bg-muted/50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary text-primary-foreground rounded-full w-10 h-10 p-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;