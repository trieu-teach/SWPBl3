import { sendPasswordResetEmail, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { apiRequest } from "../lib/http";
import { auth } from "../lib/firebase";

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

export async function updateProfile(payload) {
  return apiRequest("/users/profile", {
    method: "PATCH",
    body: payload,
  });
}

export async function forgotPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function resetPassword(oobCode, newPassword) {
  await confirmPasswordReset(auth, oobCode, newPassword);
}

export async function verifyResetCode(oobCode) {
  return await verifyPasswordResetCode(auth, oobCode);
}
