import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { User, LogOut, FileText, Award, Settings, Hexagon } from 'lucide-react';
import { ModeToggle } from './ModeToggle';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="glass-card sticky top-0 z-50 px-4 lg:px-6 h-16 flex items-center border-b border-[hsl(var(--border))]">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="h-9 w-9 bg-gradient-to-br from-[hsl(var(--accent-hive-light))] via-[hsl(var(--accent-hive))] to-[hsl(var(--accent-hive-dark))] rounded-xl flex items-center justify-center shadow-lg shadow-[hsl(var(--accent-hive))]/20 group-hover:shadow-[hsl(var(--accent-hive))]/30 transition-shadow duration-300">
                <Hexagon className="h-5 w-5 text-[hsl(222.2_84%_4.9%)]" strokeWidth={2.5} />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            </div>
            <span className="font-display font-bold text-lg hidden sm:inline text-gradient tracking-tight">InterfaceHive</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/projects') ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/projects">{t('nav.projects')}</Link>
            </Button>


            {user ? (
              <>
                <Button
                  variant={isActive('/my-projects') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="font-medium"
                  asChild
                >
                  <Link to="/my-projects">{t('nav.myProjects')}</Link>
                </Button>
                <Button
                  variant={isActive('/my-contributions') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="font-medium"
                  asChild
                >
                  <Link to="/my-contributions">{t('nav.contributions')}</Link>
                </Button>

                <LanguageSwitcher />
                <ModeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2.5 ml-2 pl-2 pr-3 h-9 border-[hsl(var(--border))] hover:border-[hsl(var(--accent-hive))]/30 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--accent-hive))]/20 to-[hsl(var(--accent-hive-dark))]/20 flex items-center justify-center border border-[hsl(var(--accent-hive))]/20">
                        <User className="h-3.5 w-3.5 text-[hsl(var(--accent-hive))]" />
                      </div>
                      <span className="hidden md:inline max-w-[100px] truncate text-sm font-medium">{user.display_name}</span>
                      {user.total_credits !== undefined && (
                        <CreditBadge credits={user.total_credits} />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-[hsl(var(--border))]">
                    <DropdownMenuLabel className="pb-3">
                      <div className="flex flex-col gap-1">
                        <p className="font-display font-semibold">{user.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate font-normal">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link to="/profile">
                        <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                        {t('nav.profile')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link to="/my-projects">
                        <FileText className="mr-2.5 h-4 w-4 text-muted-foreground" />
                        {t('nav.myProjects')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link to="/my-contributions">
                        <FileText className="mr-2.5 h-4 w-4 text-muted-foreground" />
                        {t('nav.contributions')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link to="/profile">
                        <Award className="mr-2.5 h-4 w-4 text-[hsl(var(--accent-hive))]" />
                        <span className="text-[hsl(var(--accent-hive))] font-semibold">{user.total_credits || 0}</span>
                        <span className="ml-1">{t('nav.credits')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive py-2.5 focus:text-destructive">
                      <LogOut className="mr-2.5 h-4 w-4" />
                      {t('nav.signout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <LanguageSwitcher />
                <ModeToggle />
                <Button variant="ghost" size="sm" className="font-medium" asChild>
                  <Link to="/auth/login">{t('nav.signin')}</Link>
                </Button>
                <Link to="/auth/register" className="premium-button text-sm px-4 py-1.5 h-9">
                  {t('nav.getStarted')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

