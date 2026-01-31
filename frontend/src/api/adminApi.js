import api from "./axios";

export const searchAdminUser = (query) =>
  api.get(`/admin/search`, { params: { query } });

export const getUserByAccount = (accountNumber) =>
  api.get(`/admin/user/${accountNumber}`);

export const updateDailyLimit = (accountNumber, newLimit) =>
  api.patch(`/admin/account/limit`, {
    account_number: accountNumber,
    new_limit: Number(newLimit),
  });

export const deactivateAccount = (accountNumber) =>
  api.delete(`/admin/account/${accountNumber}`);
