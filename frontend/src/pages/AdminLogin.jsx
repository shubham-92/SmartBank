import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/authContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bankSecret, setBankSecret] = useState("");
  const [isNewAdmin, setIsNewAdmin] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    try {
      let res;

      if (isNewAdmin) {
        res = await api.post("/admin/signup", {
          email,
          password,
          bank_secret: bankSecret,
          name: "Admin",
        });
      } else {
        res = await api.post("/admin/login", {
          email,
          password,
        });
      }

      login(res.data.access_token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Admin authentication failed");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px" }}>
      <h2>Admin {isNewAdmin ? "Signup" : "Login"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />

      {isNewAdmin && (
        <>
          <input
            placeholder="Bank Secret Password"
            value={bankSecret}
            onChange={(e) => setBankSecret(e.target.value)}
          />
          <br />
          <br />
        </>
      )}

      <label>
        <input
          type="checkbox"
          checked={isNewAdmin}
          onChange={() => setIsNewAdmin(!isNewAdmin)}
        />{" "}
        I am a new admin
      </label>

      <br />
      <br />

      <button onClick={handleSubmit}>
        {isNewAdmin ? "Create Admin" : "Login"}
      </button>
    </div>
  );
}
