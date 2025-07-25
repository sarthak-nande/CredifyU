// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginFailure, loginStart, loginSuccess } from "../redux/UserSlice";
import api from "../utils/api";

function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(loginStart());
      const res = await api.post(
        "/api/login",
        { email, password }
      );

      const data = await res.data;

      if (res.status === 200) { 
        dispatch(loginSuccess(data))
        navigate("/dashboard");
      } else{
        dispatch(loginFailure(data.message))
      }
    } catch (err) {
      dispatch(loginFailure(err.message))
      alert(err?.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
