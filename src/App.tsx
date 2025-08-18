import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Activity from "./pages/Activity";
import Stories from "./pages/Stories";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import FollowersList from "./pages/FollowersList";
import Chat from "./pages/Chat";
import BottomNav from "./components/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout component to conditionally show bottom navigation
const AppLayout = () => {
  const location = useLocation();
  const showBottomNav = location.pathname !== "/auth" && !location.pathname.startsWith("/messages/chat");

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create" element={<Create />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/user/:userId/:type" element={<FollowersList />} />
        <Route path="/messages/chat/:userId" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
