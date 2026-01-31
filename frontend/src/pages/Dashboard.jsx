import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { getDashboard } from "../api/dashboardApi";
import { transferMoney, getTransactionHistory } from "../api/transactionApi";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [history, setHistory] = useState([]);
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      const res = await getDashboard();
      setUserData(res.data);
    } catch {
      setError("Failed to load dashboard");
    }
  };

  const loadHistory = async () => {
    try {
      const res = await getTransactionHistory();
      setHistory(res.data);
    } catch {
      setError("Failed to load transaction history");
    }
  };

  const handleTransfer = async () => {
    setError("");
    setMessage("");

    if (!toAccount || !amount) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await transferMoney(toAccount, amount);
      setMessage("Transfer successful");
      setToAccount("");
      setAmount("");
      loadDashboard();
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    loadDashboard();
    loadHistory();
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-200 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-yellow-400">
          SmartBank Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-md text-sm"
        >
          Logout
        </button>
      </div>

      {/* ERROR / SUCCESS */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-400 p-3 rounded mb-4">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-500/10 border border-green-400/30 text-green-400 p-3 rounded mb-4">
          {message}
        </div>
      )}

      {/* ACCOUNT SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Account Number</p>
          <p className="text-lg font-semibold">
            {userData.account.account_number}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Account Balance</p>
          <p className="text-2xl font-bold text-green-400">
            ₹{userData.account.balance}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Daily Limit</p>
          <p className="text-lg font-semibold">
            ₹{userData.account.daily_limit}
          </p>
        </div>
      </div>

      {/* TRANSFER + HISTORY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TRANSFER */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Transfer Money
          </h2>

          <input
            placeholder="Receiver Account Number"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 mb-3 outline-none focus:border-yellow-400"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded-md px-4 py-2 mb-4 outline-none focus:border-yellow-400"
          />

          <button
            onClick={handleTransfer}
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Send Money"}
          </button>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-yellow-400">
            Transaction History
          </h2>

          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {history.map((tx, index) => (
                <div
                  key={index}
                  className={`border-l-4 p-3 rounded-md bg-white/5 ${
                    tx.type === "credit" ? "border-green-400" : "border-red-400"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {tx.type === "credit" ? "CREDIT" : "DEBIT"}
                    </span>
                    <span
                      className={
                        tx.type === "credit" ? "text-green-400" : "text-red-400"
                      }
                    >
                      ₹{tx.amount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Account: {tx.receiver_account_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.time).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
