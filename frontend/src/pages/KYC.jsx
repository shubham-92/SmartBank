import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function KYC() {
  const [pan, setPan] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitKYC = async () => {
    setError("");
    setMessage("");

    if (!pan || !address || !phone) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/user/kyc", {
        pan_number: pan,
        address,
        phone,
      });

      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/create-account");
      }, 1200);
    } catch (err) {
      const backendError = err.response?.data?.detail;
      setError(
        Array.isArray(backendError)
          ? backendError[0]?.msg
          : backendError || "KYC submission failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-gray-200">
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-center text-yellow-400 mb-2">
          KYC Verification
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          Complete your KYC to activate your bank account
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-400 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="bg-green-500/10 border border-green-400/30 text-green-400 text-sm p-2 rounded mb-4">
            {message}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="PAN Number (e.g. ABCDE1234F)"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400"
          />

          <textarea
            placeholder="Residential Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400 resize-none"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400"
          />

          <button
            onClick={submitKYC}
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Verifying KYC..." : "Submit KYC"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Your information is encrypted and securely stored
        </p>
      </div>
    </div>
  );
}
