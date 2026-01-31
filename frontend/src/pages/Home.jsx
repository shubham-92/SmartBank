import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/authContext";

export default function Home() {
  const [mode, setMode] = useState("login"); // login | signup | admin

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bankSecret, setBankSecret] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    // basic validation
    if (!email || !password || (mode !== "login" && !name)) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      // USER SIGNUP
      if (mode === "signup") {
        await api.post("/auth/signup", { name, email, password });
        const res = await api.post("/auth/login", { email, password });
        login(res.data.access_token);
        navigate("/kyc");
      }

      // USER LOGIN
      if (mode === "login") {
        const res = await api.post("/auth/login", { email, password });
        login(res.data.access_token);
        navigate("/dashboard");
      }

      // ADMIN LOGIN / SIGNUP
      if (mode === "admin") {
        const res = bankSecret
          ? await api.post("/admin/signup", {
              name,
              email,
              password,
              bank_secret: bankSecret,
            })
          : await api.post("/admin/login", { email, password });

        login(res.data.access_token);
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-gray-200">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-center text-yellow-400 mb-6">
          SmartBank
        </h1>

        {/* Mode Toggle */}
        <div className="flex justify-between mb-6">
          {["signup", "login", "admin"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm border transition ${
                mode === m
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-white/20 hover:bg-white/10"
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-400 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {(mode === "signup" || mode === "admin") && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400"
          />

          {mode === "admin" && (
            <input
              type="password"
              placeholder="Bank Secret (Admin only for signup)"
              value={bankSecret}
              onChange={(e) => setBankSecret(e.target.value)}
              className="w-full bg-transparent border border-red-400/40 rounded-md px-4 py-2 outline-none focus:border-red-400"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : mode === "admin"
                  ? "Admin Access"
                  : "Login"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Secure • Trusted • Smart Banking
        </p>
      </div>
    </div>
  );
}
