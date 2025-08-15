import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import CollegeDetails from "@/component/CollegeDetails";
import DashboardLayout from "@/component/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Award, 
  Settings, 
  Bell,
  TrendingUp,
  Calendar,
  GraduationCap
} from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";
import DashboardContent from "@/component/DashboardContent";

function Dashboard({ children }) {
  const user = useSelector((state) => state?.user?.user?.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const isProfileComplete = useSelector((state) => state.user.isProfileComplete);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/college/login");
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/api/logout", {}, {
        withCredentials: true,
      });
      dispatch(logout());
      navigate("/college/login");
      toast("Logout successful!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "black",
          color: "white",
        },
      });
    } catch (err) {
      toast.error("Logout failed", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // Show loading state
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Main dashboard content when profile is complete

  return (
    <DashboardLayout>
      {isProfileComplete ? (
        children
      ) : (
        <div className="space-y-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Complete Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                Please complete your college profile to access all dashboard features.
              </p>
              <CollegeDetails />
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Render nested routes */}
      <Outlet />
    </DashboardLayout>
  );
}

export default Dashboard;