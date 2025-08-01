// src/App.js
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddStudent from "./component/AddStudent";
import TableDemo from "./component/StudentTable";
import AuthLayout from "./context/AuthContext";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import api from "./utils/api";
import { loginFailure, loginStart, loginSuccess, setProfileComplete } from "./redux/userSlice";


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.post("/api/get-user", { withCredentials: true });

        if (res.status !== 200) {
          throw new Error("User not logged in");
        }else{
          dispatch(loginSuccess(res.data));
          dispatch(setProfileComplete(res.data.user.isProfileComplete));
        }
        
      } catch (err) {
        dispatch(loginFailure("User not logged in"));
        console.error("User not logged in");
      }
    }
    fetchData();
  }, [dispatch]);

  return (
    <>
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;