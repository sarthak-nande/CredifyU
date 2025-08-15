// src/components/Dashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner"; // Assuming you want to use sonner for toasts here too

function DashboardLayout({ children }) {
  const user = useSelector((state) => state?.user?.user?.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSidebar, setShowSidebar] = useState(false); // Changed to false for a mobile-first approach

  const handleLogout = async () => {
    try {
      await api.post("/api/logout", {}, { withCredentials: true });
      dispatch(logout());
      navigate("/college/login");
      toast("Logout successful!");
    } catch (err) {
      toast("Logout failed");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - conditionally rendered for mobile */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64`}
      >
        <div className="p-4 font-bold border-b border-gray-600 flex items-center justify-between">
          Dashboard
          <Button
            variant="ghost"
            size="icon"
            className="text-white md:hidden"
            onClick={() => setShowSidebar(false)}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {/* Use links or navigation components here */}
          <p className="p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => navigate("/college/dashboard")}>Profile</p>
          <p className="p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => navigate("/college/dashboard/students")}>Students</p>
          <Button variant="secondary" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="p-4 bg-gray-900 text-white flex items-center justify-between shadow-md md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setShowSidebar(true)}
          >
            <Menu size={20} />
          </Button>
          <h1 className="text-lg font-bold">Dashboard</h1>
          <div></div> {/* For spacing */}
        </header>

        <main className="p-4 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;