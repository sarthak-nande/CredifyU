// src/pages/Signup.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post(
        "/api/signup",
        { email, password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        alert("Signup successful!");
        navigate("/login");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Signup Failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
