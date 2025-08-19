import { useState, useEffect } from "react";
import { Plus, Play, MessageCircle, Send, Bookmark, Camera, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getPosts, getUsers, togglePostLike, getUserStories, hasUnviewedStories, Post, User } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersWithStories, setUsersWithStories] = useState<User[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setCurrentUser(user);
    setPosts(getPosts());
    const allUsers = getUsers();
    setUsers(allUsers);
    
    // Filter users who have stories
    const usersWithActiveStories = allUsers.filter(u => {
      const userStories = getUserStories(u.id);
      return userStories.length > 0;
    });
    setUsersWithStories(usersWithActiveStories);
  }, [navigate]);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    
    togglePostLike(postId, currentUser.id);
    
    // Update local state
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newLikes = post.likes.includes(currentUser.id)
            ? post.likes.filter(id => id !== currentUser.id)
            : [...post.likes, currentUser.id];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <img src="/src/assets/montage-icon.png" alt="Montage" className="w-6 h-6" />
            <h1 className="text-2xl font-bold text-foreground font-inter tracking-tight">
              Cytol
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/create")}
              className="text-foreground hover:text-primary h-8 w-8"
            >
              <Plus size={24} strokeWidth={2} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/messages")}
              className="text-foreground hover:text-primary h-8 w-8"
            >
              <Send size={24} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </header>

      {/* Stories Row */}
      <div className="border-b border-border py-4">
        <div className="flex items-center gap-3 px-4 overflow-x-auto scrollbar-hide">
          {/* Your Story */}
          <button 
            className="flex flex-col items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
            onClick={() => navigate("/stories")}
          >
            <div className="relative">
              {getUserStories(currentUser.id).length > 0 ? (
                <div className={`p-0.5 ${hasUnviewedStories(currentUser.id, currentUser.id) ? 'bg-gradient-story' : 'bg-muted'} rounded-2xl`}>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-background">
                    <img 
                      src={currentUser.avatar || '/placeholder.svg'} 
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-muted bg-muted">
                    <img 
                      src={currentUser.avatar || '/placeholder.svg'} 
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <Plus size={14} className="text-primary-foreground" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-foreground font-medium max-w-[4.5rem] truncate font-inter">
              {getUserStories(currentUser.id).length > 0 ? currentUser.username : "Your story"}
            </span>
          </button>

          {/* Other Users' Stories */}
          {usersWithStories
            .filter(user => user.id !== currentUser.id)
            .map(user => {
              const hasUnviewed = hasUnviewedStories(user.id, currentUser.id);
              return (
                <button
                  key={user.id} 
                  className="flex flex-col items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/story/${user.id}/0`)}
                >
                  <div className={`p-0.5 ${hasUnviewed ? 'bg-gradient-story' : 'bg-muted'} rounded-2xl`}>
                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-background">
                      <img 
                        src={user.avatar || '/placeholder.svg'} 
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-foreground font-medium truncate max-w-[4.5rem] font-inter">
                    {user.username}
                  </span>
                </button>
              );
            })
          }
        </div>
      </div>

      {/* Posts Feed */}
      <div className="pb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mb-6 shadow-glow">
              <Plus size={32} className="text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Montage!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Start sharing your moments. Create your first post to get started.
            </p>
            <Button 
              onClick={() => navigate("/create")}
              className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-glow hover:shadow-lg transition-all duration-300"
            >
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map(post => {
            const postUser = getUserById(post.userId);
            if (!postUser) return null;

            return (
              <Card key={post.id} className="border-0 rounded-none border-b border-border shadow-none">
                <CardContent className="p-0">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <button 
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/user/${postUser.id}`)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={postUser.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                          {postUser.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold text-foreground text-sm">{postUser.username}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </button>
                  </div>

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div 
                      className="aspect-square bg-muted cursor-pointer" 
                      onDoubleClick={() => handleLike(post.id)}
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <img 
                        src={post.images[0]} 
                        alt="Post content"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleLike(post.id)}
                          className={`h-8 w-8 ${
                            post.likes.includes(currentUser.id) 
                              ? 'text-red-500' 
                              : 'text-foreground hover:text-red-500'
                          }`}
                        >
                          <Heart size={24} fill={post.likes.includes(currentUser.id) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-foreground hover:text-primary"
                          onClick={() => navigate(`/post/${post.id}`)}
                        >
                          <MessageCircle size={24} strokeWidth={1.5} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:text-primary">
                          <Send size={24} strokeWidth={1.5} />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:text-primary">
                        <Bookmark size={24} strokeWidth={1.5} />
                      </Button>
                    </div>

                    {/* Likes */}
                    <p className="font-semibold text-sm text-foreground mb-2">
                      {post.likes.length} likes
                    </p>

                    {/* Post Content */}
                    <div className="text-sm text-foreground">
                      <span className="font-semibold">{postUser.username}</span> {post.content}
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <button 
                        className="text-sm text-muted-foreground mt-2 hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/post/${post.id}`)}
                      >
                        View all {post.comments.length} comments
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
