import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/button-variants";
import { getStories, createStory, getAllProfiles, Story } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StoryEditor from "@/components/StoryEditor";

const Stories = () => {
  const { user: currentUser } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
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

  const loadStories = async () => {
    try {
      const [storiesData, profilesData] = await Promise.all([
        getStories(),
        getAllProfiles()
      ]);
      setStories(storiesData);
      setProfiles(profilesData);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
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

  const handleCreateStory = async (content: string, textOverlay?: string, textColor?: string) => {
    if (!currentUser || (!content.trim() && !selectedImage && !selectedVideo && !textOverlay)) return;

    try {
      // Convert base64 strings to File objects if needed
      let imageFile = null;
      let videoFile = null;
      
      if (selectedImage) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        imageFile = new File([blob], 'story-image.jpg', { type: 'image/jpeg' });
      }
      
      if (selectedVideo) {
        const response = await fetch(selectedVideo);
        const blob = await response.blob();
        videoFile = new File([blob], 'story-video.mp4', { type: 'video/mp4' });
      }

      await createStory(
        content.trim() || null,
        imageFile,
        videoFile,
        textOverlay || null,
        textColor || null
      );
      
      setSelectedImage("");
      setSelectedVideo("");
      setShowEditor(false);
      setIsCreating(false);
      loadStories();
      
      toast({
        title: "Story posted",
        description: "Your story has been shared successfully.",
      });
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to post story. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!currentUser) return null;

  const userStories = stories.filter(story => story.user_id === currentUser.id);
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
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

      {/* Stories Section */}
      <div className="px-4 py-6">
        {/* Your Stories */}
        {userStories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Stories</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {userStories.map((story, index) => (
                <button
                  key={story.id}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/story/${currentUser.id}/${index}`)}
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                    {story.image_url ? (
                      <img src={story.image_url} alt="Your story" className="w-full h-full object-cover" />
                    ) : story.video_url ? (
                      <video src={story.video_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                        <span className="text-xs text-center text-foreground font-medium px-2">
                          {story.content?.slice(0, 20)}...
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Stories Grid */}
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
            <h2 className="text-lg font-semibold text-foreground">All Stories</h2>
            {Object.entries(groupedStories).map(([userId, userStories]) => {
              const user = profiles.find(p => p.user_id === userId);
              if (!user) return null;

              return (
                <div key={userId} className="space-y-3">
                   <div className="flex items-center gap-3">
                     <button
                       className="p-0.5 rounded-full bg-gradient-story hover:opacity-80 transition-opacity"
                       onClick={() => navigate(`/story/${userId}/0`)}
                     >
                       <Avatar className="w-14 h-14 ring-2 ring-background">
                         <AvatarImage src={user.avatar_url} />
                         <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                           {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                         </AvatarFallback>
                       </Avatar>
                     </button>
                     <button 
                       className="flex-1 text-left hover:opacity-80 transition-opacity"
                       onClick={() => navigate(`/user/${userId}`)}
                     >
                       <p className="font-semibold text-foreground">{user.full_name || user.username}</p>
                       <p className="text-sm text-muted-foreground">
                         @{user.username} • {userStories.length} {userStories.length === 1 ? 'story' : 'stories'}
                       </p>
                     </button>
                   </div>

                  <div className="grid grid-cols-3 gap-1 ml-16">
                    {userStories.slice(0, 6).map((story, index) => (
                      <button
                        key={story.id}
                        className="aspect-square overflow-hidden rounded-lg border border-border hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/story/${userId}/${index}`)}
                      >
                        {story.image_url ? (
                          <img 
                            src={story.image_url} 
                            alt="Story preview"
                            className="w-full h-full object-cover"
                          />
                        ) : story.video_url ? (
                          <video 
                            src={story.video_url} 
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-subtle flex items-center justify-center p-2">
                            <p className="text-xs text-center text-foreground line-clamp-3">
                              {story.content}
                            </p>
                          </div>
                        )}
                      </button>
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