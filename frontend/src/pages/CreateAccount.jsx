import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAccount } from "../api/accountApi";

export default function CreateAccount() {
  const [accountType, setAccountType] = useState("savings");
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    setError("");
    setAccount(null);

    try {
      setLoading(true);
      const res = await createAccount(accountType);
      setAccount(res.data);

      // Redirect to dashboard after short delay
      setTimeout(
        () => {
          navigate("/dashboard");
        },
        { replace: true },
      );
    } catch (err) {
      const backendError = err.response?.data?.detail;
      setError(
        Array.isArray(backendError)
          ? backendError[0]?.msg
          : backendError || "Account creation failed",
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
          Create Your Bank Account
        </h1>
        <p className="text-sm text-center text-gray-400 mb-6">
          Choose the type of account you want to open
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-400 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Account Type Selection */}
        <div className="space-y-4">
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none focus:border-yellow-400"
          >
            <option value="savings">Savings Account</option>
            <option value="current">Current Account</option>
            <option value="fd">Fixed Deposit (FD)</option>
          </select>

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        {/* Success Card */}
        {account && (
          <div className="mt-6 border border-green-400/30 bg-green-500/10 rounded-md p-4 text-green-400">
            <h3 className="font-semibold mb-2">
              Account Created Successfully 🎉
            </h3>
            <p>
              <b>Account Number:</b> {account.account_number}
            </p>
            <p>
              <b>Account Type:</b> {account.account_type}
            </p>
            <p>
              <b>Balance:</b> ₹{account.balance}
            </p>
            <p>
              <b>Daily Limit:</b> ₹{account.daily_limit}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-6">
          You will be redirected to your dashboard shortly
        </p>
      </div>
    </div>
  );
}
