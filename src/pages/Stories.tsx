import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { GradientButton } from "@/components/ui/button-variants";
import { getCurrentUser, getStories, saveStory, generateId, generateStoryExpiration, getUserById, Story } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Stories = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [stories, setStories] = useState<Story[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newStoryContent, setNewStoryContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    loadStories();
  }, [currentUser, navigate]);

  const loadStories = () => {
    const allStories = getStories();
    setStories(allStories);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = () => {
    if (!currentUser || (!newStoryContent.trim() && !selectedImage)) return;

    const story: Story = {
      id: generateId(),
      userId: currentUser.id,
      content: newStoryContent,
      image: selectedImage,
      expiresAt: generateStoryExpiration(),
      views: [],
      createdAt: new Date().toISOString()
    };

    saveStory(story);
    setNewStoryContent("");
    setSelectedImage("");
    setIsCreating(false);
    loadStories();
    
    toast({
      title: "Story posted",
      description: "Your story has been shared successfully.",
    });
  };

  if (!currentUser) return null;

  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="text-foreground"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Stories</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCreating(true)}
            className="text-foreground"
          >
            <Plus size={20} />
          </Button>
        </div>
      </header>

      {/* Create Story Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Create Story</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setIsCreating(false);
                    setNewStoryContent("");
                    setSelectedImage("");
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                {selectedImage && (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Story preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedImage("")}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Add Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Caption
                  </label>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newStoryContent}
                    onChange={(e) => setNewStoryContent(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setNewStoryContent("");
                      setSelectedImage("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <GradientButton
                    variant="primary"
                    onClick={handleCreateStory}
                    className="flex-1"
                    disabled={!newStoryContent.trim() && !selectedImage}
                  >
                    Share
                  </GradientButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stories Grid */}
      <div className="p-4">
        {Object.keys(groupedStories).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow">
              <Plus size={28} className="text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No stories yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Be the first to share a story!
            </p>
            <GradientButton
              variant="primary"
              onClick={() => setIsCreating(true)}
            >
              Create Story
            </GradientButton>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStories).map(([userId, userStories]) => {
              const user = getUserById(userId);
              if (!user) return null;

              return (
                <div key={userId} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-primary">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 w-12 h-12 rounded-full bg-gradient-story p-0.5">
                        <div className="w-full h-full rounded-full bg-transparent"></div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {userStories.length} {userStories.length === 1 ? 'story' : 'stories'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {userStories.map((story) => (
                      <Card key={story.id} className="bg-card border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        <CardContent className="p-0">
                          <div className="aspect-[3/4] relative">
                            {story.image ? (
                              <img 
                                src={story.image} 
                                alt="Story"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-subtle flex items-center justify-center p-4">
                                <p className="text-sm text-center text-foreground line-clamp-6">
                                  {story.content}
                                </p>
                              </div>
                            )}
                            {story.content && story.image && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                                <p className="text-white text-xs line-clamp-2">
                                  {story.content}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;