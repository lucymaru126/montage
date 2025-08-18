import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { User, saveUser, setCurrentUser, getUserByUsername, generateId, createAdminUser } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Create admin user on component mount
  useState(() => {
    createAdminUser();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login logic
      const existingUser = getUserByUsername(formData.username);
      if (existingUser) {
        // Check if user is banned
        if (existingUser.isBanned) {
          toast({
            title: "Account Banned",
            description: "Your account has been banned.",
            variant: "destructive",
          });
          return;
        }

        // Simple password check for admin
        if (existingUser.username === 'montage' && formData.password !== 'admin123!') {
          toast({
            title: "Error",
            description: "Invalid password.",
            variant: "destructive",
          });
          return;
        }

        setCurrentUser(existingUser);
        toast({
          title: "Welcome back!",
          description: `Logged in as ${existingUser.fullName || existingUser.username}`,
        });
        navigate("/");
      } else {
        toast({
          title: "User not found",
          description: "Please check your username or create a new account.",
          variant: "destructive"
        });
      }
    } else {
      // Signup logic - create new user
      if (!formData.username || !formData.email || !formData.fullName) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Check if username already exists
      if (getUserByUsername(formData.username)) {
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive"
        });
        return;
      }

      // Create new user
      const newUser: User = {
        id: generateId(),
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        bio: "",
        avatar: "",
        followers: [],
        following: [],
        posts: [],
        stories: [],
        createdAt: new Date().toISOString(),
        isVerified: false,
        isAdmin: false,
        isBanned: false
      };

      saveUser(newUser);
      setCurrentUser(newUser);
      
      toast({
        title: "Welcome to Montage!",
        description: "Your account has been created successfully.",
      });
      
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-background/95 backdrop-blur-sm shadow-elevated border-0">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow">
              <span className="text-2xl font-bold text-primary-foreground">M</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Join Montage"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-12 rounded-lg border-input"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="h-12 rounded-lg border-input"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 rounded-lg border-input"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="h-12 rounded-lg border-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <GradientButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </GradientButton>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-medium text-primary">
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;