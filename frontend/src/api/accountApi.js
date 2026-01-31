import api from "./axios";

export const createAccount = (accountType) => {
  return api.post("/account/create", {
    account_type: accountType,
  });
};
