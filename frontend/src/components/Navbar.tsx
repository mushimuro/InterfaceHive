import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import CreditBadge from './CreditBadge';
import { User, LogOut, FileText, Award, Settings, PlusCircle, Layers } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-7 w-7 bg-primary rounded-md flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base hidden sm:inline">InterfaceHive</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/projects') ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/projects">Projects</Link>
            </Button>

            {user && user.email_verified && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/projects/create">
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Create</span>
                </Link>
              </Button>
            )}

            {user ? (
              <>
                <Button
                  variant={isActive('/my-projects') ? 'secondary' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/my-projects">My Projects</Link>
                </Button>
                <Button
                  variant={isActive('/my-contributions') ? 'secondary' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/my-contributions">My Contributions</Link>
                </Button>

                <ModeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 ml-2">
                      <User className="h-4 w-4" />
                      <span className="hidden md:inline max-w-[120px] truncate">{user.display_name}</span>
                      {user.total_credits !== undefined && (
                        <CreditBadge credits={user.total_credits} />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-projects" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        My Requests
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-contributions" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        My Contributions
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Award className="mr-2 h-4 w-4" />
                        Credits ({user.total_credits || 0})
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <ModeToggle />
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

