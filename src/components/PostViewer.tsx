import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPostById, likePost, unlikePost, getComments, addComment, getPostLikes, Post, Comment } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PostViewer = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser || !postId) {
      navigate("/auth");
      return;
    }

    const loadPost = async () => {
      try {
        const [postData, commentsData, likesData] = await Promise.all([
          getPostById(postId),
          getComments(postId),
          getPostLikes(postId)
        ]);

        setPost(postData);
        setComments(commentsData);
        setLikesCount(likesData.length);
        setIsLiked(likesData.some(like => like.user_id === currentUser.id));
      } catch (error) {
        console.error('Error loading post:', error);
        toast({
          title: "Error",
          description: "Failed to load post.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [currentUser, postId, navigate, toast]);

  const handleLike = async () => {
    if (!post || !currentUser) return;

    try {
      if (isLiked) {
        await unlikePost(post.id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likePost(post.id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !post || !currentUser) return;

    try {
      const comment = await addComment(post.id, newComment.trim());
      setComments(prev => [...prev, comment]);
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold text-foreground">Post</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Post */}
        <Card className="border-0 rounded-none border-b border-border">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="w-10 h-10 cursor-pointer"
                  onClick={() => navigate(`/user/${post.profiles?.user_id}`)}
                >
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {(post.profiles?.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{post.profiles?.username}</h3>
                    {post.profiles?.is_verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatTime(post.created_at)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal size={20} />
              </Button>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="aspect-square bg-muted">
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
                    onClick={handleLike}
                    className={isLiked ? "text-red-500" : "text-foreground"}
                  >
                    <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <MessageCircle size={24} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-foreground">
                    <Send size={24} />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Bookmark size={24} />
                </Button>
              </div>

              {/* Likes Count */}
              <p className="font-semibold text-foreground mb-2">
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </p>

              {/* Post Content */}
              <div className="mb-2">
                <span className="font-semibold text-foreground mr-2">{post.profiles?.username}</span>
                <span className="text-foreground">{post.content}</span>
              </div>

              {/* View Comments */}
              {comments.length > 0 && (
                <p className="text-muted-foreground text-sm mb-3 cursor-pointer">
                  View all {comments.length} comments
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4 p-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-xs">
                  {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{comment.profiles?.username}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-xs">
                {(currentUser.user_metadata?.username || currentUser.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-0 bg-transparent focus:ring-0"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleComment();
                }
              }}
            />
            {newComment.trim() && (
              <Button 
                onClick={handleComment}
                variant="ghost"
                className="text-primary font-semibold"
              >
                Post
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostViewer;