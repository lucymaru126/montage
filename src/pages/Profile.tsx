import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Edit, Grid, Bookmark, Heart, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GradientButton } from "@/components/ui/button-variants";
import { getCurrentUser, saveUser, getPosts, logoutUser, User, Post } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "", 
    bio: "",
    avatar: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setCurrentUser(user);
    setEditForm({
      fullName: user.fullName,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar
    });

    // Get user's posts
    const allPosts = getPosts();
    const myPosts = allPosts.filter(post => post.userId === user.id);
    setUserPosts(myPosts);
  }, [navigate]);

  const handleSaveProfile = () => {
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      fullName: editForm.fullName,
      username: editForm.username,
      bio: editForm.bio,
      avatar: editForm.avatar
    };

    saveUser(updatedUser);
    setCurrentUser(updatedUser);
    setIsEditingProfile(false);
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditForm(prev => ({
          ...prev,
          avatar: event.target!.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/auth");
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{currentUser.username}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-foreground hover:text-destructive"
            >
              <LogOut size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/settings")}
              className="text-foreground hover:text-primary"
            >
              <Settings size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-background shadow-elevated">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Story Ring for demonstration */}
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-story p-0.5">
              <div className="w-full h-full rounded-full bg-background"></div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">{currentUser.fullName}</h2>
              <p className="text-muted-foreground">@{currentUser.username}</p>
            </div>
            
            {currentUser.bio && (
              <p className="text-sm text-foreground">{currentUser.bio}</p>
            )}

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="font-semibold text-foreground">{userPosts.length}</p>
                <p className="text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{currentUser.followers.length}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{currentUser.following.length}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
            </div>

            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full rounded-lg">
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={editForm.avatar} />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-bold">
                        {editForm.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>Change Photo</span>
                      </Button>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Full Name"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                    <Input
                      placeholder="Username"
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <GradientButton
                      variant="primary"
                      onClick={handleSaveProfile}
                      className="flex-1"
                    >
                      Save
                    </GradientButton>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow">
                  <Plus size={28} className="text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Share your first post</h3>
                <p className="text-muted-foreground text-center mb-6">
                  When you share photos and videos, they'll appear on your profile.
                </p>
                <GradientButton
                  variant="primary"
                  onClick={() => navigate("/create")}
                >
                  Create Post
                </GradientButton>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">Save posts for later</h3>
              <p className="text-muted-foreground text-center">
                Bookmark posts you want to see again.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Posts you've liked</h3>
              <p className="text-muted-foreground text-center">
                When you like posts, they'll appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;