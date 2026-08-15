import { apiRequest } from "../lib/http";

export async function register(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      fullName: payload.fullName,
      acceptedTerms: payload.acceptedTerms,
    },
  });
}

export async function registerWithFirebase({ idToken, fullName, acceptedTerms }) {
  return apiRequest("/auth/register", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: { fullName, acceptedTerms: Boolean(acceptedTerms) },
  });
}

export async function loginWithFirebaseToken(payload) {
  return apiRequest("/auth/firebase-login", {
    method: "POST",
    headers: { Authorization: `Bearer ${payload.idToken}` },
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me");
}

export async function getProfile() {
  return apiRequest("/users/profile");
}

export async function updateProfile(payload) {
  return apiRequest("/users/profile", {
    method: "PATCH",
    body: payload,
  });
}