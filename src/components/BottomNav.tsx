import { Home, Search, Plus, Heart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/storage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  if (!currentUser) return null;

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/search", label: "Search" },
    { icon: Plus, path: "/create", label: "Create" },
    { icon: Heart, path: "/activity", label: "Activity" },
    { path: "/profile", label: "Profile", isProfile: true }
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="icon"
            onClick={() => navigate(item.path)}
            className={`h-12 w-12 rounded-lg transition-colors ${
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.isProfile ? (
              <Avatar className="w-6 h-6">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <item.icon size={24} />
            )}
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;