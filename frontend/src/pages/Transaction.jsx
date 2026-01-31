import { useEffect, useState } from "react";
import {
  transferMoney,
  getTransactionHistory,
} from "../api/transactionApi";

export default function Transaction() {
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.detail || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Transfer Money</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <input
        placeholder="Receiver Account Number"
        value={toAccount}
        onChange={(e) => setToAccount(e.target.value)}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br /><br />

      <button onClick={handleTransfer} disabled={loading}>
        {loading ? "Processing..." : "Send Money"}
      </button>

      <hr />

      <h3>Transaction History</h3>

      {history.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        history.map((tx, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              padding: "10px",
              borderLeft:
                tx.type === "credit"
                  ? "4px solid green"
                  : "4px solid red",
            }}
          >
            <b>{tx.type.toUpperCase()}</b> — ₹{tx.amount}
            <br />
            <span>Account: {tx.account_number}</span>
            <br />
            <small>{new Date(tx.time).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}
