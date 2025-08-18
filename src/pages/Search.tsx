import { useState, useEffect } from "react";
import { Search as SearchIcon, Users, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers, getPosts, User, Post, getCurrentUser } from "@/lib/storage";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setUsers(getUsers());
    setPosts(getPosts());
  }, [currentUser, navigate]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const userResults = users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const postResults = posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredUsers(userResults);
      setFilteredPosts(postResults);
    } else {
      setFilteredUsers([]);
      setFilteredPosts([]);
    }
  }, [searchQuery, users, posts]);

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Search users and posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-input bg-muted/50"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {!searchQuery.trim() ? (
          /* Explore Section */
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Discover People</h2>
              <div className="grid grid-cols-2 gap-4">
                {users.filter(user => user.id !== currentUser.id).slice(0, 6).map(user => (
                  <Card 
                    key={user.id} 
                    className="border border-border hover:border-primary/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <CardContent className="p-4 text-center">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-sm text-foreground">{user.username}</h3>
                      <p className="text-xs text-muted-foreground mb-3 truncate">{user.fullName}</p>
                      <Button 
                        size="sm" 
                        className="bg-gradient-primary text-primary-foreground text-xs px-4 py-1 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${user.id}`);
                        }}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted rounded-full p-1 mb-6">
              <TabsTrigger value="users" className="flex items-center gap-2 rounded-full">
                <Users size={16} />
                Users ({filteredUsers.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2 rounded-full">
                <Hash size={16} />
                Posts ({filteredPosts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No users found for "{searchQuery}"</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <Card 
                    key={user.id} 
                    className="border border-border hover:border-primary/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{user.username}</h3>
                          <p className="text-sm text-muted-foreground truncate">{user.fullName}</p>
                          {user.bio && (
                            <p className="text-xs text-muted-foreground truncate mt-1">{user.bio}</p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/${user.id}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="posts" className="space-y-3">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <Hash className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No posts found for "{searchQuery}"</p>
                </div>
              ) : (
                filteredPosts.map(post => {
                  const postUser = getUserById(post.userId);
                  if (!postUser) return null;

                  return (
                    <Card key={post.id} className="border border-border hover:border-primary/20 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={postUser.avatar} />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-sm">
                              {postUser.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm text-foreground">{postUser.username}</h3>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-3">{post.content}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{post.likes.length} likes</span>
                              <span>{post.comments.length} comments</span>
                            </div>
                          </div>
                          {post.images.length > 0 && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img 
                                src={post.images[0]} 
                                alt="Post preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Search;