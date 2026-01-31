import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchAdminUser,
  getUserByAccount,
  updateDailyLimit,
  deactivateAccount,
} from "../api/adminApi";
import { AuthContext } from "../context/authContext";

export default function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newLimit, setNewLimit] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filters
  const [txType, setTxType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ===================== AUTH ===================== */
  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  /* ===================== SEARCH ===================== */
  const handleSearch = async () => {
    setError("");
    setMessage("");
    setSelectedUser(null);

    if (!query) {
      setError("Enter account number or user name");
      return;
    }

    try {
      const res = await searchAdminUser(query);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      setResults(data);

      if (data.length === 1) {
        loadUserDetails(data[0].account_number);
      }
    } catch {
      setResults([]);
      setError("No records found");
    }
  };

  const loadUserDetails = async (accountNumber) => {
    try {
      const res = await getUserByAccount(accountNumber);
      setSelectedUser(res.data);
      setNewLimit(res.data.account.daily_limit);
    } catch {
      setError("Failed to load user details");
    }
  };

  /* ===================== ADMIN ACTIONS ===================== */
  const handleLimitUpdate = async () => {
    try {
      await updateDailyLimit(selectedUser.account.account_number, newLimit);
      setMessage("Daily transaction limit updated");
    } catch {
      setError("Failed to update daily limit");
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate this account?"))
      return;

    try {
      await deactivateAccount(selectedUser.account.account_number);
      setMessage("Account deactivated successfully");
    } catch {
      setError("Failed to deactivate account");
    }
  };

  /* ===================== FILTERED TRANSACTIONS + ANALYTICS ===================== */
  let totalCredit = 0;
  let totalDebit = 0;
  let txCount = 0;

  const filteredTx =
    selectedUser?.transactions.filter((tx) => {
      const acc = selectedUser.account.account_number;
      const isDebit = tx.from_account === acc;
      const isCredit = tx.to_account === acc;

      if (txType === "debit" && !isDebit) return false;
      if (txType === "credit" && !isCredit) return false;

      const txDate = new Date(tx.time);
      if (fromDate && txDate < new Date(fromDate)) return false;
      if (toDate && txDate > new Date(toDate + "T23:59:59")) return false;

      if (minAmount && tx.amount < Number(minAmount)) return false;

      if (isDebit) totalDebit += tx.amount;
      if (isCredit) totalCredit += tx.amount;
      txCount++;

      return true;
    }) || [];

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-200 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-yellow-400">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-md text-sm"
        >
          Logout
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-yellow-400">
          Search Account / User
        </h2>
        <div className="flex gap-3">
          <input
            placeholder="Enter account number or user name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border border-white/20 rounded-md px-4 py-2 outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-yellow-400 text-black px-6 rounded-md font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* ERROR / MESSAGE */}
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

      {/* USER SECTION */}
      {selectedUser && (
        <>
          {/* USER + ACCOUNT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-yellow-400 font-semibold mb-3">
                User Details
              </h3>
              <p>
                <b>Name:</b> {selectedUser.name}
              </p>
              <p>
                <b>Email:</b> {selectedUser.email}
              </p>
              <p>
                <b>Phone:</b> {selectedUser.phone}
              </p>
              <p>
                <b>Address:</b> {selectedUser.address}
              </p>
              <p>
                <b>PAN:</b> {selectedUser.pan_number}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-yellow-400 font-semibold mb-3">
                Account Details
              </h3>
              <p>
                <b>Account No:</b> {selectedUser.account.account_number}
              </p>
              <p>
                <b>Balance:</b> ₹{selectedUser.account.balance}
              </p>
              <p>
                <b>Status:</b>{" "}
                {selectedUser.account.is_active ? "Active" : "Inactive"}
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="flex-1 bg-transparent border border-white/20 rounded-md px-3 py-2"
                />
                <button
                  onClick={handleLimitUpdate}
                  className="bg-yellow-400 text-black px-4 rounded-md font-semibold"
                >
                  Update
                </button>
              </div>

              <button
                onClick={handleDeactivate}
                className="mt-4 bg-red-500/80 px-4 py-2 rounded-md text-sm"
              >
                Deactivate Account
              </button>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Summary title="Total Credit" value={totalCredit} color="green" />
            <Summary title="Total Debit" value={totalDebit} color="red" />
            <Summary
              title="Net Flow"
              value={totalCredit - totalDebit}
              color={totalCredit - totalDebit >= 0 ? "green" : "red"}
            />
            <Summary
              title="Transactions"
              value={txCount}
              color="yellow"
              isCurrency={false}
            />
          </div>

          {/* FILTERS */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="bg-transparent border border-white/20 rounded-md px-3 py-2"
            >
              <option value="all">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent border border-white/20 rounded-md px-3 py-2"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent border border-white/20 rounded-md px-3 py-2"
            />
            <input
              type="number"
              placeholder="Min Amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="bg-transparent border border-white/20 rounded-md px-3 py-2"
            />
          </div>

          {/* TRANSACTIONS */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-yellow-400 font-semibold mb-4">
              Transaction History
            </h3>
            {filteredTx.map((tx, i) => {
              const isDebit =
                tx.from_account === selectedUser.account.account_number;
              return (
                <div
                  key={i}
                  className={`border-l-4 p-4 mb-3 rounded-md bg-white/5 ${isDebit ? "border-red-400" : "border-green-400"}`}
                >
                  <div className="flex justify-between">
                    <span
                      className={isDebit ? "text-red-400" : "text-green-400"}
                    >
                      {isDebit ? "DEBIT" : "CREDIT"}
                    </span>
                    <span
                      className={isDebit ? "text-red-400" : "text-green-400"}
                    >
                      ₹{tx.amount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {isDebit
                      ? `To: ${tx.to_account}`
                      : `From: ${tx.from_account}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.time).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ===== SUMMARY CARD ===== */
function Summary({ title, value, color, isCurrency = true }) {
  const colors = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>
        {isCurrency ? `₹${value}` : value}
      </p>
    </div>
  );
}
