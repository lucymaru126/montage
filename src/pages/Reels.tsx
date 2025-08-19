import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getPosts, getUsers, togglePostLike, Post, User } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Reels = () => {
  const [reels, setReels] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setCurrentUser(user);
    // Filter for video posts (reels) - for now, use all posts
    const allPosts = getPosts();
    setReels(allPosts);
    setUsers(getUsers());
  }, [navigate]);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    
    togglePostLike(postId, currentUser.id);
    
    setReels(prevReels => 
      prevReels.map(reel => {
        if (reel.id === postId) {
          const newLikes = reel.likes.includes(currentUser.id)
            ? reel.likes.filter(id => id !== currentUser.id)
            : [...reel.likes, currentUser.id];
          return { ...reel, likes: newLikes };
        }
        return reel;
      })
    );
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-foreground">Reels</h1>
          <Button variant="ghost" size="icon" className="text-foreground hover:text-primary h-8 w-8">
            <MoreHorizontal size={20} />
          </Button>
        </div>
      </header>

      {/* Reels Feed */}
      <div className="pb-20">
        {reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow">
              <Heart size={32} className="text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Reels Yet!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Start creating video content to see reels here.
            </p>
            <Button 
              onClick={() => navigate("/create")}
              className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-glow hover:shadow-lg transition-all duration-300"
            >
              Create Your First Reel
            </Button>
          </div>
        ) : (
          reels.map(reel => {
            const reelUser = getUserById(reel.userId);
            if (!reelUser) return null;

            return (
              <Card key={reel.id} className="border-0 rounded-none border-b border-border shadow-none">
                <CardContent className="p-0">
                  {/* Reel Header */}
                  <div className="flex items-center justify-between p-4">
                    <button 
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/user/${reelUser.id}`)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={reelUser.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                          {reelUser.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-sm">{reelUser.username}</p>
                      </div>
                    </button>
                  </div>

                  {/* Reel Video */}
                  {reel.images.length > 0 && (
                    <div 
                      className="aspect-[9/16] bg-muted cursor-pointer relative max-h-[70vh]" 
                      onDoubleClick={() => handleLike(reel.id)}
                    >
                      <img 
                        src={reel.images[0]} 
                        alt="Reel content"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Reel Actions Overlay */}
                      <div className="absolute bottom-4 right-4 flex flex-col gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleLike(reel.id)}
                          className={`h-12 w-12 bg-black/20 backdrop-blur-sm rounded-full ${
                            reel.likes.includes(currentUser.id) 
                              ? 'text-red-500' 
                              : 'text-white hover:text-red-500'
                          }`}
                        >
                          <Heart size={24} fill={reel.likes.includes(currentUser.id) ? 'currentColor' : 'none'} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 bg-black/20 backdrop-blur-sm rounded-full text-white hover:text-primary"
                          onClick={() => navigate(`/post/${reel.id}`)}
                        >
                          <MessageCircle size={24} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 bg-black/20 backdrop-blur-sm rounded-full text-white hover:text-primary"
                        >
                          <Send size={24} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 bg-black/20 backdrop-blur-sm rounded-full text-white hover:text-primary"
                        >
                          <Bookmark size={24} />
                        </Button>
                      </div>

                      {/* Reel Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-16 text-white">
                        <p className="font-semibold text-sm mb-1">{reelUser.username}</p>
                        <p className="text-sm opacity-90">{reel.content}</p>
                        <p className="text-xs opacity-75 mt-1">{reel.likes.length} likes</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Reels;