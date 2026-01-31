import api from "./axios";

export const transferMoney = (toAccount, amount) => {
  return api.post("/transaction/transfer", {
    to_account_number: toAccount,
    amount: Number(amount),
  });
};

export const getTransactionHistory = () => {
  return api.get("/transaction/history");
};
