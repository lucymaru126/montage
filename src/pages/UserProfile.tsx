import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, MoreHorizontal, Grid, Bookmark, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/button-variants";
import { 
  getCurrentUser, 
  getUserById, 
  getPosts, 
  followUser, 
  unfollowUser, 
  saveUser,
  User, 
  Post 
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setCurrentUser(user);
    
    if (userId) {
      const profile = getUserById(userId);
      if (profile) {
        setProfileUser(profile);
        setIsFollowing(user.following.includes(userId));
        
        // Get user's posts
        const allPosts = getPosts();
        const myPosts = allPosts.filter(post => post.userId === userId);
        setUserPosts(myPosts);
      }
    }
  }, [userId, navigate]);

  const handleFollowToggle = () => {
    if (!currentUser || !profileUser) return;

    if (isFollowing) {
      unfollowUser(currentUser.id, profileUser.id);
      setIsFollowing(false);
      toast({
        title: "Unfollowed",
        description: `You unfollowed @${profileUser.username}`,
      });
    } else {
      followUser(currentUser.id, profileUser.id);
      setIsFollowing(true);
      toast({
        title: "Following",
        description: `You are now following @${profileUser.username}`,
      });
    }
    
    // Update current user state
    const updatedUser = getCurrentUser();
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const handleMessage = () => {
    // Navigate to messages with user parameter
    navigate(`/messages/chat/${profileUser?.id}`);
  };

  if (!currentUser || !profileUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isOwnProfile = currentUser.id === profileUser.id;

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
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{profileUser.username}</h1>
              {profileUser.isVerified && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground h-5 w-5 p-0 rounded-full flex items-center justify-center">
                  ✓
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-foreground hover:text-primary"
          >
            <MoreHorizontal size={20} />
          </Button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-elevated">
              <AvatarImage src={profileUser.avatar} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
                {profileUser.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Story Ring for demonstration */}
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-story p-0.5">
              <div className="w-full h-full rounded-full bg-background"></div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{profileUser.fullName}</h2>
                {profileUser.isVerified && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground h-6 w-6 p-0 rounded-full flex items-center justify-center">
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{profileUser.username}</p>
            </div>
            
            {profileUser.bio && (
              <p className="text-sm text-foreground">{profileUser.bio}</p>
            )}

            <div className="flex items-center gap-6 text-sm">
              <button 
                className="text-center hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/user/${profileUser.id}/followers`)}
              >
                <p className="font-semibold text-foreground">{profileUser.followers.length}</p>
                <p className="text-muted-foreground">Followers</p>
              </button>
              <button 
                className="text-center hover:opacity-80 transition-opacity"
                onClick={() => navigate(`/user/${profileUser.id}/following`)}
              >
                <p className="font-semibold text-foreground">{profileUser.following.length}</p>
                <p className="text-muted-foreground">Following</p>
              </button>
              <div className="text-center">
                <p className="font-semibold text-foreground">{userPosts.length}</p>
                <p className="text-muted-foreground">Posts</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-lg"
                  onClick={() => navigate("/profile")}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <GradientButton
                    variant={isFollowing ? "secondary" : "primary"}
                    onClick={handleFollowToggle}
                    className="flex-1"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </GradientButton>
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-lg"
                    onClick={handleMessage}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted rounded-full p-1">
            <TabsTrigger value="posts" className="flex items-center gap-2 rounded-full">
              <Grid size={16} />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2 rounded-full">
              <Bookmark size={16} />
              Saved
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2 rounded-full">
              <Heart size={16} />
              Liked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {userPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gradient-subtle rounded-full flex items-center justify-center mb-4">
                  <Grid size={28} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground text-center">
                  {isOwnProfile ? "Share your first photo or video." : "When they share photos and videos, they'll appear on their profile."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map(post => (
                  <div key={post.id} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    {post.images.length > 0 ? (
                      <img 
                        src={post.images[0]} 
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-subtle">
                        <p className="text-xs text-center text-muted-foreground p-2 line-clamp-3">
                          {post.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Bookmark className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isOwnProfile ? "Save posts for later" : "No saved posts"}
              </h3>
              <p className="text-muted-foreground text-center">
                {isOwnProfile ? "Bookmark posts you want to see again." : "Only you can see what you've saved."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isOwnProfile ? "Posts you've liked" : "No liked posts"}
              </h3>
              <p className="text-muted-foreground text-center">
                {isOwnProfile ? "When you like posts, they'll appear here." : "Only you can see what you've liked."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;