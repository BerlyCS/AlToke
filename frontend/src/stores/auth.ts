import { defineStore } from "pinia";
import { ref } from "vue";
import type { User } from "../services/auth.service";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token"));

  const setAuth = (newUser: User, newToken: string) => {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  return { user, token, setAuth, logout };
});
