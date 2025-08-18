import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Mail, MessageSquare, FileText, Shield, Bug, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HelpSettings = () => {
  const navigate = useNavigate();

  const helpItems = [
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Get answers to frequently asked questions",
      action: () => console.log("Navigate to help center")
    },
    {
      icon: Mail,
      title: "Contact Us",
      description: "Send us an email for support",
      action: () => window.open("mailto:support@montage.com")
    },
    {
      icon: MessageSquare,
      title: "Report a Problem",
      description: "Report bugs or issues with the app",
      action: () => console.log("Open report form")
    },
    {
      icon: FileText,
      title: "Terms of Service",
      description: "Read our terms and conditions",
      action: () => console.log("Navigate to terms")
    },
    {
      icon: Shield,
      title: "Privacy Policy",
      description: "Learn about our privacy practices",
      action: () => console.log("Navigate to privacy policy")
    },
    {
      icon: Bug,
      title: "Send Feedback",
      description: "Share your thoughts and suggestions",
      action: () => console.log("Open feedback form")
    },
    {
      icon: Star,
      title: "Rate App",
      description: "Rate us on the app store",
      action: () => console.log("Navigate to app store")
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
            <h1 className="text-lg font-semibold text-foreground">Help</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {helpItems.map((item, index) => (
          <Card 
            key={index} 
            className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={item.action}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* App Info */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-foreground">Montage</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground">
                © 2024 Montage. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpSettings;