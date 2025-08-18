import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser, saveUser, setCurrentUser, User as UserType } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const PrivacySettings = () => {
  const [currentUser, setCurrentUserState] = useState<UserType | null>(null);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [storyViews, setStoryViews] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  const [allowMentions, setAllowMentions] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserState(user);
    // In a real app, these would come from user preferences
    setPrivateAccount(false);
    setStoryViews(true);
    setReadReceipts(true);
    setActivityStatus(true);
    setAllowTagging(true);
    setAllowMentions(true);
  }, [navigate]);

  const handleSaveSettings = () => {
    if (!currentUser) return;

    // In a real app, you would save these privacy settings to the user's profile
    toast({
      title: "Privacy settings updated",
      description: "Your privacy settings have been saved successfully.",
    });
  };

  if (!currentUser) return null;

  const privacyItems = [
    {
      icon: Lock,
      title: "Private Account",
      description: "When your account is private, only people you approve can see your photos and videos",
      value: privateAccount,
      onChange: setPrivateAccount
    },
    {
      icon: Eye,
      title: "Story Views",
      description: "Allow others to see when you've viewed their stories",
      value: storyViews,
      onChange: setStoryViews
    },
    {
      icon: MessageSquare,
      title: "Read Receipts",
      description: "Allow others to see when you've read their messages",
      value: readReceipts,
      onChange: setReadReceipts
    },
    {
      icon: Users,
      title: "Activity Status",
      description: "Show when you were last active",
      value: activityStatus,
      onChange: setActivityStatus
    },
    {
      icon: Users,
      title: "Allow Tagging",
      description: "Allow others to tag you in their posts",
      value: allowTagging,
      onChange: setAllowTagging
    },
    {
      icon: MessageSquare,
      title: "Allow Mentions",
      description: "Allow others to mention you in their posts and stories",
      value: allowMentions,
      onChange: setAllowMentions
    }
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
            <h1 className="text-lg font-semibold text-foreground">Privacy</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Privacy Settings */}
        {privacyItems.map((item, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <item.icon size={20} className="text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
                <Switch 
                  checked={item.value}
                  onCheckedChange={(checked) => {
                    item.onChange(checked);
                    handleSaveSettings();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Additional Privacy Info */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-muted-foreground mt-1" />
              <div>
                <h3 className="font-medium text-foreground">Data & Privacy</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Learn more about how we collect, use and share your data in our Privacy Policy.
                </p>
                <Button variant="link" className="h-auto p-0 mt-2 text-primary">
                  View Privacy Policy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacySettings;