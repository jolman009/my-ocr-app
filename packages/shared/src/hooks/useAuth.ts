import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register } from "../api/client";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // You can cache the user locally or do other syncs here
      console.log("Login success, user:", data.user.email);
    }
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      // Setup user cache on register as well
      console.log("Register success, user:", data.user.email);
    }
  });
};
