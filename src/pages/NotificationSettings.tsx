import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Heart, MessageSquare, Users, Camera, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser, User as UserType } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [likesComments, setLikesComments] = useState(true);
  const [followers, setFollowers] = useState(true);
  const [directMessages, setDirectMessages] = useState(true);
  const [stories, setStories] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const handleSaveSettings = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  if (!currentUser) return null;

  const notificationSections = [
    {
      title: "Push Notifications",
      items: [
        {
          icon: Bell,
          title: "Push Notifications",
          description: "Receive push notifications on your device",
          value: pushNotifications,
          onChange: setPushNotifications
        },
        {
          icon: Heart,
          title: "Likes and Comments",
          description: "Notifications when someone likes or comments on your posts",
          value: likesComments,
          onChange: setLikesComments
        },
        {
          icon: Users,
          title: "Followers",
          description: "Notifications when someone follows you",
          value: followers,
          onChange: setFollowers
        },
        {
          icon: MessageSquare,
          title: "Direct Messages",
          description: "Notifications for new direct messages",
          value: directMessages,
          onChange: setDirectMessages
        },
        {
          icon: Camera,
          title: "Stories",
          description: "Notifications when people you follow post stories",
          value: stories,
          onChange: setStories
        }
      ]
    },
    {
      title: "Email & SMS",
      items: [
        {
          icon: Bell,
          title: "Email Notifications",
          description: "Receive notifications via email",
          value: emailNotifications,
          onChange: setEmailNotifications
        },
        {
          icon: Bell,
          title: "SMS Notifications",
          description: "Receive notifications via SMS",
          value: smsNotifications,
          onChange: setSmsNotifications
        }
      ]
    },
    {
      title: "Other",
      items: [
        {
          icon: Volume2,
          title: "Sound Effects",
          description: "Play sounds for notifications and app interactions",
          value: soundEffects,
          onChange: setSoundEffects
        }
      ]
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
            <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {notificationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <div className="space-y-2">
              {section.items.map((item, index) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSettings;