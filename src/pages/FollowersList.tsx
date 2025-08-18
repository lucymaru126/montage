import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GradientButton } from "@/components/ui/button-variants";
import { 
  getCurrentUser, 
  getUserById, 
  getUsers,
  followUser, 
  unfollowUser,
  User 
} from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const FollowersList = () => {
  const { userId, type } = useParams<{ userId: string; type: "followers" | "following" }>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
        
        // Get all users
        const allUsers = getUsers();
        
        // Filter based on type
        let relevantUserIds: string[] = [];
        if (type === "followers") {
          relevantUserIds = profile.followers;
        } else if (type === "following") {
          relevantUserIds = profile.following;
        }
        
        const relevantUsers = allUsers.filter(u => relevantUserIds.includes(u.id));
        setUsers(relevantUsers);
        setFilteredUsers(relevantUsers);
      }
    }
  }, [userId, type, navigate]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleFollowToggle = (targetUserId: string) => {
    if (!currentUser) return;

    const isFollowing = currentUser.following.includes(targetUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    
    if (isFollowing) {
      unfollowUser(currentUser.id, targetUserId);
      toast({
        title: "Unfollowed",
        description: `You unfollowed @${targetUser?.username}`,
      });
    } else {
      followUser(currentUser.id, targetUserId);
      toast({
        title: "Following",
        description: `You are now following @${targetUser?.username}`,
      });
    }
    
    // Update current user state
    const updatedUser = getCurrentUser();
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
  };

  const isFollowing = (userId: string) => {
    return currentUser?.following.includes(userId) || false;
  };

  if (!currentUser || !profileUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const title = type === "followers" ? "Followers" : "Following";

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
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-full border-input bg-muted/50"
          />
        </div>

        {/* Users List */}
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery.trim() ? `No users found for "${searchQuery}"` : `No ${type} yet`}
              </p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <Card key={user.id} className="border border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/user/${user.id}`)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{user.username}</h3>
                          {user.isVerified && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground h-5 w-5 p-0 rounded-full flex items-center justify-center">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.fullName}</p>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground truncate mt-1">{user.bio}</p>
                        )}
                      </div>
                    </button>
                    
                    {currentUser.id !== user.id && (
                      <GradientButton
                        variant={isFollowing(user.id) ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleFollowToggle(user.id)}
                        className="px-4"
                      >
                        {isFollowing(user.id) ? "Following" : "Follow"}
                      </GradientButton>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersList;