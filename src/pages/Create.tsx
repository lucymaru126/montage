import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Type, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/button-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser, savePost, Post, generateId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const Create = () => {
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (selectedImages.length >= 10) {
        toast({
          title: "Too many images",
          description: "You can only upload up to 10 images per post.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or images to your post.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);

    try {
      const newPost: Post = {
        id: generateId(),
        userId: currentUser.id,
        content: content.trim(),
        images: selectedImages,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      savePost(newPost);
      
      toast({
        title: "Post shared!",
        description: "Your post has been shared successfully.",
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Failed to post",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

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
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">New Post</h1>
          </div>
          <GradientButton
            variant="primary"
            size="sm"
            onClick={handlePost}
            disabled={isPosting}
          >
            {isPosting ? "Posting..." : "Share"}
          </GradientButton>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{currentUser.username}</p>
            <p className="text-sm text-muted-foreground">{currentUser.fullName}</p>
          </div>
        </div>

        {/* Content Input */}
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] border-input rounded-lg resize-none text-base placeholder:text-muted-foreground"
            maxLength={2200}
          />
          <div className="text-right">
            <span className="text-xs text-muted-foreground">
              {content.length}/2200
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <Card className="border-dashed border-2 border-border hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 shadow-glow">
                <Camera size={24} className="text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Add Photos</h3>
              <p className="text-sm text-muted-foreground text-center">
                Upload up to 10 images to share with your post
              </p>
            </label>
          </CardContent>
        </Card>

        {/* Selected Images */}
        {selectedImages.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Selected Images</h3>
            <div className="grid grid-cols-2 gap-3">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={image} 
                      alt={`Selected ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Post Options */}
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-foreground">Post Options</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Add to story</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Also share
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smile className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Tag friends</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Add tags
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Create;