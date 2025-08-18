import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Bell, HelpCircle, Shield, Settings2, Users, BarChart3, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser, getUsers, banUser, verifyUser, logoutUser, User as UserType } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
    setAllUsers(getUsers());
  }, [navigate]);

  const handleBanUser = (userId: string) => {
    banUser(userId);
    setAllUsers(getUsers());
    toast({
      title: "User banned",
      description: "User has been banned successfully.",
    });
  };

  const handleVerifyUser = (userId: string) => {
    verifyUser(userId);
    setAllUsers(getUsers());
    toast({
      title: "User verified",
      description: "User has been verified successfully.",
    });
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/auth");
  };

  if (!currentUser) return null;

  const settingsItems = [
    { icon: User, label: "Account", subtitle: "Privacy, security, password", path: "/settings/account" },
    { icon: Bell, label: "Notifications", subtitle: "Push, email, SMS", hasSwitch: true },
    { icon: Lock, label: "Privacy", subtitle: "Account privacy", hasSwitch: true },
    { icon: HelpCircle, label: "Help", subtitle: "Help center, contact us", path: "/settings/help" },
    { icon: Shield, label: "About", subtitle: "Terms, privacy policy", path: "/settings/about" },
  ];

  const adminItems = [
    { icon: Users, label: "User Management", subtitle: "Manage all users" },
    { icon: BarChart3, label: "Analytics", subtitle: "App statistics" },
    { icon: Settings2, label: "Admin Settings", subtitle: "Admin configuration" },
  ];

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
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{currentUser.fullName}</h3>
                  {currentUser.isVerified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                  {currentUser.isAdmin && <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">ADMIN</span>}
                </div>
                <p className="text-muted-foreground">@{currentUser.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings List */}
        <div className="space-y-2">
          {settingsItems.map((item, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  {item.hasSwitch && (
                    <Switch 
                      checked={item.label === "Notifications" ? notifications : privateAccount}
                      onCheckedChange={(checked) => {
                        if (item.label === "Notifications") {
                          setNotifications(checked);
                        } else {
                          setPrivateAccount(checked);
                        }
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Panel */}
        {currentUser.isAdmin && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Admin Panel</h2>
            
            <div className="space-y-2">
              {adminItems.map((item, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Management */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">All Users ({allUsers.length})</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{user.username}</p>
                            {user.isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>}
                            {user.isAdmin && <span className="px-1 py-0.5 bg-red-500 text-white text-xs rounded">ADN</span>}
                            {user.isBanned && <span className="px-1 py-0.5 bg-red-600 text-white text-xs rounded">BANNED</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {!user.isAdmin && (
                        <div className="flex gap-2">
                          {!user.isVerified && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleVerifyUser(user.id)}
                            >
                              Verify
                            </Button>
                          )}
                          {!user.isBanned && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleBanUser(user.id)}
                            >
                              <Ban size={14} />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Settings;