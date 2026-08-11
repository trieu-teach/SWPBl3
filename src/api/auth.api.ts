import { apiRequest } from "../lib/http";

// Auth endpoints
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

// Profile endpoints
export async function getProfile() {
  return apiRequest("/users/profile");
}

export async function updateProfile(payload) {
  return apiRequest("/users/profile", {
    method: "PATCH",
    body: payload,
  });
}
