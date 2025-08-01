// src/pages/Dashboard.jsx
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import CollegeDetails from "@/component/CollegeDetails";
import DashboardLayout from "@/component/DashboardLayout";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";
import {toast} from "sonner"

function Dashboard({ children }) {
  const user = useSelector((state) => state?.user?.user?.user);
  console.log(user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isProfileComplete = useSelector((state) => state.user.isProfileComplete);

  const handleLogout = async () => {
    try {
      api.post("/api/logout", {}, {
        withCredentials: true,
      });
      dispatch(logout());
      navigate("/login");
      toast("Logout successful!",  {
          duration: 3000,
          position: "top-right",
          style: {
            background: "black",
            color: "white",
          },
        });
    } catch (err) {
      toast("Logout failed");
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <DashboardLayout>
          <div className="space-y-4">
            {
              isProfileComplete ? (
                <>
                  <p>Welcome back, {user.Name}!</p>
                    {children}
                </>
              ) : (
                <>
                  <p>Complete Profile First To Access The Dashboard.</p>
                  
                </>
              )
            }
    
          </div>
        </DashboardLayout>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default Dashboard;
