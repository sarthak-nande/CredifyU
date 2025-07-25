// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/UserSlice";

function Dashboard() {
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      dispatch(logout())
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  return (
    <div>
      {isLoggedIn ? <div><h2>Welcome to Dashboard</h2>
      <button onClick={handleLogout}>Logout</button></div> : <p>Please log in.</p> }
    </div>
  );
}

export default Dashboard;
