import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/button-variants";
import { getCurrentUser, getStories, saveStory, generateId, generateStoryExpiration, getUserById, Story } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StoryEditor from "@/components/StoryEditor";

const Stories = () => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [stories, setStories] = useState<Story[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);
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

    // Check if it's video or image
    const isVideo = file.type.startsWith('video/');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        if (isVideo) {
          setSelectedVideo(event.target.result as string);
          setSelectedImage("");
        } else {
          setSelectedImage(event.target.result as string);
          setSelectedVideo("");
        }
        setShowEditor(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateStory = (content: string, textOverlay?: string, textColor?: string) => {
    if (!currentUser || (!content.trim() && !selectedImage && !selectedVideo && !textOverlay)) return;

    const story: Story = {
      id: generateId(),
      userId: currentUser.id,
      content: content,
      image: selectedImage,
      video: selectedVideo,
      textOverlay,
      textColor,
      expiresAt: generateStoryExpiration(),
      views: [],
      likes: [],
      replies: [],
      createdAt: new Date().toISOString()
    };

    saveStory(story);
    setSelectedImage("");
    setSelectedVideo("");
    setShowEditor(false);
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
                    setSelectedImage("");
                    setSelectedVideo("");
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="aspect-square bg-gradient-primary rounded-lg flex flex-col items-center justify-center text-primary-foreground hover:opacity-80 transition-opacity">
                      <Camera size={32} className="mb-2" />
                      <span className="text-sm font-medium">Upload Media</span>
                    </div>
                  </label>
                  
                  <button
                    onClick={() => {
                      setSelectedImage("");
                      setSelectedVideo("");
                      setShowEditor(true);
                    }}
                    className="aspect-square bg-gradient-subtle rounded-lg flex flex-col items-center justify-center text-foreground hover:opacity-80 transition-opacity"
                  >
                    <Plus size={32} className="mb-2" />
                    <span className="text-sm font-medium">Text Story</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Story Editor */}
      {showEditor && (
        <StoryEditor
          selectedImage={selectedImage}
          selectedVideo={selectedVideo}
          onCancel={() => {
            setShowEditor(false);
            setSelectedImage("");
            setSelectedVideo("");
            setIsCreating(false);
          }}
          onShare={handleCreateStory}
        />
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
                    {userStories.map((story, index) => (
                      <Card 
                        key={story.id} 
                        className="bg-card border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/story/${userId}/${index}`)}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-[3/4] relative">
                            {story.image ? (
                              <img 
                                src={story.image} 
                                alt="Story"
                                className="w-full h-full object-cover"
                              />
                            ) : story.video ? (
                              <video 
                                src={story.video} 
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-subtle flex items-center justify-center p-4">
                                <p className="text-sm text-center text-foreground line-clamp-6">
                                  {story.content}
                                </p>
                              </div>
                            )}
                            {story.content && (story.image || story.video) && (
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