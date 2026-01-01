import { Calendar, Menu, X, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { useWindowSize } from "@/hooks/useWindowSize";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Categories", href: "#categories" },
  { label: "About", href: "#about" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout: signOut, loading } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width } = useWindowSize();
  const isDesktop = width >= 1024;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Left: Logo Section */}
        <div className="w-[180px] md:w-[220px] flex-shrink-0">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl gradient-hero flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-300">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="font-bold text-xl md:text-2xl text-[#1A1A1A] tracking-tight">
              BookFlow
            </span>
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center justify-center flex-grow"
          style={{
            gap: isDesktop ? "3rem" : "1rem",
            display: isDesktop ? "flex" : "none",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-bold text-gray-400 hover:text-primary transition-colors whitespace-nowrap px-2"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions Section */}
        <div className="w-[200px] md:w-[300px] flex-shrink-0 flex items-center justify-end">
          <div
            className="hidden lg:flex items-center"
            style={{ display: isDesktop ? "flex" : "none", gap: "2rem" }}
          >
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 md:h-11 md:w-11 rounded-full ring-1 ring-gray-100 p-0 overflow-hidden shadow-sm"
                      >
                        <Avatar className="h-full w-full">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="gradient-hero text-white text-xs font-bold">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end">
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/admin")}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate("/auth")}
                      className="text-[15px] font-bold text-gray-400 hover:text-gray-900 transition-colors px-2"
                    >
                      Sign In
                    </button>
                    <Button
                      variant="hero"
                      onClick={() => navigate("/auth")}
                      className="h-10 md:h-12 px-6 md:px-8 rounded-full font-bold shadow-md hover:shadow-xl transition-all border-2 border-primary text-sm md:text-base"
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            className="lg:hidden flex items-center justify-center p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all ml-3"
            style={{ display: isDesktop ? "none" : "flex" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 absolute w-full shadow-lg">
          <nav className="container mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-base font-medium text-muted-foreground hover:text-primary py-2 transition-colors border-b border-border/30 last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 mt-1">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="justify-start px-0"
                        onClick={() => {
                          navigate("/profile");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-5 w-5" />
                        Profile
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="lg"
                          className="justify-start px-0"
                          onClick={() => {
                            navigate("/admin");
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Shield className="mr-2 h-5 w-5" />
                          Admin Dashboard
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center mt-2"
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="w-full justify-center"
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="hero"
                        size="lg"
                        className="w-full shadow-md"
                        onClick={() => {
                          navigate("/auth");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
