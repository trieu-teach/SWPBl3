import { apiRequest } from "../../lib/http";

export async function register(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      acceptedTerms: payload.acceptedTerms,
    },
  });
}

export async function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: {
      email: payload.email,
      password: payload.password,
    },
  }).then((response) => response.user || response);
}

export async function loginWithFirebaseToken(payload) {
  return apiRequest("/auth/firebase-login", {
    method: "POST",
    headers: { Authorization: `Bearer ${payload.idToken}` },
  }).then((response) => response.user || response);
}

export async function getCurrentUser() {
  return apiRequest("/auth/me").then((response) => response.user || response);
}

export async function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(token, password, confirmPassword) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: { token, password, confirmPassword },
  });
}

export async function updateProfile(payload) {
  return apiRequest("/auth/profile", {
    method: "PUT",
    body: payload,
  }).then((response) => response.user || response);
}

export async function changePassword(payload) {
  return apiRequest("/auth/change-password", {
    method: "POST",
    body: payload,
  });
}
