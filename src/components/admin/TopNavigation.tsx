import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, Loader2, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { logout } from "../../redux/features/authSlice";
import type { RootState } from "@/redux/store/store";
import { getInitials } from "@/validations/validations";
import { LogoutApi } from "@/api/services/authApis/logoutApi";
import { getPageTitle } from "@/config/navigation";

interface TopNavigationProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const TopNavigation = ({ onToggleSidebar }: TopNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const pageTitle = getPageTitle(location.pathname);

  const authLoginState = useSelector((state: RootState) => state.auth.loginState) as {
    profilePic?: string;
    fullName?: string;
    email?: string;
    role?: string;
  } | undefined;

  const [loading, setLoading] = useState(false);

  const logoutHandler = async () => {
    try {
      setLoading(true);
      await LogoutApi();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      setLoading(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <motion.header
      className="flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm sm:px-6"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0 lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <h2 className="text-lg font-semibold tracking-tight">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-3">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Avatar className="h-8 w-8">
                  {authLoginState?.profilePic ? (
                    <AvatarImage
                      src={`${authLoginState.profilePic}?t=${Date.now()}`}
                      alt={authLoginState.fullName || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(authLoginState?.fullName || "Admin User")}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {authLoginState?.fullName || "Admin User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {authLoginState?.email || "admin@2star.com"}
                </p>
                {authLoginState?.role && (
                  <Badge
                    variant="secondary"
                    className="mt-1 w-fit border-0 bg-primary text-primary-foreground text-xs"
                  >
                    <Shield className="mr-1 h-2 w-2" />
                    {authLoginState.role.charAt(0).toUpperCase() +
                      authLoginState.role.slice(1).replace("_", " ")}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logoutHandler}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default TopNavigation;
