import api from "./axios";

export const getDashboard = () => {
  return api.get("/user/dashboard");
};
