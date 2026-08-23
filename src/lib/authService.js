// authService — central auth orchestration
// Flow (per BE behavior — BE does NOT issue accessToken; Firebase idToken IS the bearer):
//   signUp:        Firebase createUser → POST /auth/register → sendEmailVerification
//   signIn:        Firebase signIn → store idToken → POST /auth/firebase-login
//   signInGoogle:  Firebase popup → POST /auth/register (catch 403 "already registered") → POST /auth/firebase-login

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "./firebase";
import * as authApi from "../api/auth.api";
import { setStoredAuthToken } from "./http";

function firebaseErrorMessage(err, fallback) {
  if (!err) return fallback;
  if (err.code === "auth/popup-closed-by-user") return "Thao tác đã bị hủy.";
  if (err.code === "auth/email-already-in-use") return "Email này đã được đăng ký.";
  if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password")
    return "Sai email hoặc mật khẩu.";
  if (err.code === "auth/user-not-found") return "Tài khoản không tồn tại.";
  if (err.code === "auth/weak-password") return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
  if (err.code === "auth/invalid-email") return "Email không hợp lệ.";
  if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
    return "Mật khẩu hiện tại không đúng.";
  if (err.code === "auth/requires-recent-login")
    return "Vui lòng đăng nhập lại trước khi thực hiện thao tác này.";
  if (err.code === "auth/too-many-requests") return "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
  return err.message || fallback;
}

function isAlreadyRegisteredError(err) {
  if (!err) return false;
  const status = err.status ?? err.response?.status;
  const message = err.message ?? err.response?.data?.error?.message ?? "";
  return (
    status === 403 &&
    /already\s*registered/i.test(String(message))
  );
}

async function persistFirebaseIdToken(user) {
  // BE does not issue its own accessToken — use Firebase idToken as the Bearer.
  // Force refresh to avoid 401 from a stale token.
  if (!user) return null;
  const idToken = await user.getIdToken(true);
  setStoredAuthToken(idToken);
  return idToken;
}

export async function signUpEmailPassword({ email, password, fullName, acceptedTerms }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();

  // Create app profile (INACTIVE) on BE
  await authApi.registerWithFirebase({
    idToken,
    fullName,
    acceptedTerms: Boolean(acceptedTerms),
  });

  // Send verification email
  await sendEmailVerification(cred.user);

  // Sign out so user can't accidentally hit protected routes pre-verification
  await signOut(auth);

  return {
    email,
    needsVerification: true,
  };
}

export async function signInEmailPassword({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
  const data = await authApi.loginWithFirebaseToken({ idToken: await cred.user.getIdToken(true) });
  await persistFirebaseIdToken(cred.user);
  return data;
}

export async function signInGoogle({ fullName, acceptedTerms } = {}) {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken(true);

  // Try register first (new user); on 403 "already registered" fall through to login.
  try {
    await authApi.registerWithFirebase({
      idToken,
      fullName: fullName ?? result.user.displayName ?? "User",
      acceptedTerms: acceptedTerms ?? true,
    });
  } catch (e) {
    if (!isAlreadyRegisteredError(e)) throw e;
  }

  const data = await authApi.loginWithFirebaseToken({ idToken });
  await persistFirebaseIdToken(result.user);
  return data;
}

export async function logout() {
  try {
    await signOut(auth);
  } catch {
    // ignore firebase signout errors
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  const { currentUser } = auth;
  if (!currentUser) throw new Error("Người dùng chưa đăng nhập.");

  // Re-authenticate to prevent brute-force changing another user's password
  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);

  // Update password
  await updatePassword(currentUser, newPassword);

  return { success: true };
}

export { firebaseErrorMessage };
