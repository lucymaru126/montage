import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Edit, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, getUsers, getConversations, User, Conversation } from "@/lib/storage";

const Messages = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setCurrentUser(user);
    setUsers(getUsers());
    setConversations(getConversations(user.id));
  }, [navigate]);

  const filteredUsers = users.filter(user => 
    user.id !== currentUser?.id &&
    (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUser?.id);
    return users.find(user => user.id === otherUserId);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-foreground hover:text-primary"
          >
            <Edit size={20} />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full border-input bg-muted/50"
          />
        </div>

        {/* Conversations */}
        <div className="space-y-2">
          {searchQuery.trim() ? (
            /* Search Results */
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-2">Start new conversation</h3>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found for "{searchQuery}"</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <Card key={user.id} className="border border-border hover:border-primary/20 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{user.username}</h3>
                          <p className="text-sm text-muted-foreground truncate">{user.fullName}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-primary">
                          <Send size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* Existing Conversations */
            conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow">
                  <Send size={28} className="text-primary-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Your messages</h2>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  Send private photos and messages to a friend or group.
                </p>
                <Button 
                  className="bg-gradient-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-glow hover:shadow-lg transition-all duration-300"
                >
                  Start messaging
                </Button>
              </div>
            ) : (
              conversations.map(conversation => {
                const otherUser = getOtherParticipant(conversation);
                if (!otherUser) return null;

                return (
                  <Card key={conversation.id} className="border border-border hover:border-primary/20 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherUser.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                            {otherUser.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-foreground">{otherUser.username}</h3>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.fromUserId === currentUser.id ? "You: " : ""}
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                        {!conversation.lastMessage.read && conversation.lastMessage.fromUserId !== currentUser.id && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;