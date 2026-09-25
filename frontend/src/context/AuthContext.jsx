import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authApi, passwordApi, userApi } from "../api/services";

const AuthContext = createContext();

const SESSION_DURATION = 4 * 60 * 60 * 1000;
const INACTIVITY_DURATION = 30 * 60 * 1000;

const normalizeUser = (u = {}) => ({
  id: u.id ?? u.userId,
  username: u.username,
  name: u.name,
  email: u.email,
  mobile: u.mobile,
  role: String(u.role || "USER").toUpperCase(),
  unitId: u.unitId,
  active: u.active ?? true,
  forcePasswordChange:
    u.forcePasswordChange ?? u.passwordChangeRequired ?? false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("reeltrack_user") || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("reeltrack_token"),
  );

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Indicates whether the persisted login session has been checked.
  // This prevents authenticated components such as Topbar from making
  // API calls before the JWT has been validated.
  const [authReady, setAuthReady] = useState(false);

  const saveSession = useCallback((u, jwt) => {
    const safe = normalizeUser(u);

    setUser(safe);
    setToken(jwt);

    localStorage.setItem("reeltrack_user", JSON.stringify(safe));
    localStorage.setItem("reeltrack_token", jwt);

    localStorage.setItem(
      "reeltrack_session_expires",
      String(Date.now() + SESSION_DURATION),
    );

    localStorage.setItem(
      "reeltrack_last_activity",
      String(Date.now()),
    );
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    [
      "reeltrack_user",
      "reeltrack_token",
      "reeltrack_session_expires",
      "reeltrack_last_activity",
    ].forEach((key) => localStorage.removeItem(key));
  }, []);

  const login = async (loginId, password) => {
    setLoading(true);

    try {
      const res = await authApi.login({
        username: loginId.trim(),
        password,
      });

      // Save token first so client interceptor uses it
      const jwtToken = res.data.token || res.data;
      localStorage.setItem("reeltrack_token", jwtToken);
      
      // Call /api/auth/me to get user details using the real JWT
      const meRes = await authApi.me();

      saveSession(meRes.data, jwtToken);

      return {
        success: true,
        data: normalizeUser(meRes.data),
      };
    } catch (error) {
      let msg = "Unable to sign in. Please try again.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = `Error: ${error.message}`;
      } else {
        msg = `Unknown error: ${String(error)}`;
      }
      return {
        success: false,
        message: msg,
      };
    } finally {
      setLoading(false);
    }
  };

  /*
   * Validate any persisted JWT when the application starts.
   *
   * Important:
   * We do NOT trust reeltrack_user from localStorage by itself.
   * The backend /auth/me endpoint is used to verify that the JWT
   * is still valid.
   */
  useEffect(() => {
    const validateSession = async () => {
      // No stored token means the user is simply logged out.
      if (!token) {
        setAuthReady(true);
        return;
      }

      try {
        const res = await authApi.me();

        const current = normalizeUser(res.data);

        // Backend is the source of truth for the current user.
        setUser(current);

        localStorage.setItem(
          "reeltrack_user",
          JSON.stringify(current),
        );
      } catch (error) {
        // Invalid/expired token.
        // Clear the entire frontend session.
        logout();
      } finally {
        // Authentication check is complete.
        setAuthReady(true);
      }
    };

    validateSession();
  }, [token, logout]);

  /*
   * Load users only after authentication has been validated.
   * This prevents an old ADMIN value in localStorage from causing
   * an unauthorized /users request during application startup.
   */
  const refreshUsers = useCallback(async () => {
    if (!authReady) return;
    if (user?.role !== "ADMIN") return;

    try {
      const res = await userApi.getAll();

      setUsers((res.data || []).map(normalizeUser));
    } catch {
      /* page will show last known state */
    }
  }, [authReady, user?.role]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  /*
   * Session expiration and inactivity handling.
   */
  useEffect(() => {
    if (!user) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    const activity = () => {
      localStorage.setItem(
        "reeltrack_last_activity",
        String(Date.now()),
      );
    };

    events.forEach((event) => {
      window.addEventListener(event, activity);
    });

    const interval = setInterval(() => {
      const expiry = Number(
        localStorage.getItem("reeltrack_session_expires"),
      );

      const last = Number(
        localStorage.getItem("reeltrack_last_activity"),
      );

      if (
        (expiry && Date.now() > expiry) ||
        (last && Date.now() - last > INACTIVITY_DURATION)
      ) {
        logout();
      }
    }, 10000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, activity);
      });

      clearInterval(interval);
    };
  }, [user, logout]);

  /*
   * Logged-in user's own password change
   */
  const changePassword = async (
    currentPassword,
    newPassword,
  ) => {
    try {
      const res = await passwordApi.change({
        currentPassword,
        newPassword,
      });

      const updated = {
        ...user,
        forcePasswordChange: false,
      };

      setUser(updated);

      localStorage.setItem(
        "reeltrack_user",
        JSON.stringify(updated),
      );

      return {
        success: true,
        message: res.data.message,
      };
    } catch (e) {
      return {
        success: false,
        message:
          e.response?.data?.message ||
          "Unable to change password.",
      };
    }
  };

  /*
   * Forgot Password - Email OTP
   */
  const sendPasswordResetOtp = async (
    email,
    previousRequestId = null,
  ) => {
    try {
      const res = await passwordApi.requestReset(
        email,
        previousRequestId,
      );

      return {
        success: true,
        ...res.data,
      };
    } catch (e) {
      return {
        success: false,
        message:
          e.response?.data?.message ||
          "Unable to send OTP.",
      };
    }
  };

  /*
   * Forgot Password - Mobile OTP
   */
  const sendMobilePasswordResetOtp = async (
    mobileNumber,
    previousRequestId = null,
  ) => {
    try {
      const res = await passwordApi.sendMobileOtp(
        mobileNumber,
        previousRequestId,
      );

      return {
        success: true,
        ...res.data,
      };
    } catch (e) {
      return {
        success: false,
        message:
          e.response?.data?.message ||
          "Unable to send OTP.",
      };
    }
  };

  /*
   * Forgot Password - Verify OTP
   */
  const verifyPasswordResetOtp = async (
    requestId,
    otp,
  ) => {
    try {
      const res = await passwordApi.verifyReset(
        requestId,
        otp,
      );

      return {
        success: true,
        ...res.data,
      };
    } catch (e) {
      return {
        success: false,
        message:
          e.response?.data?.message ||
          "OTP verification failed.",
      };
    }
  };

  /*
   * Forgot Password - Resend OTP
   */
  const resendPasswordResetOtp = async (requestId) => {
    try {
      const res = await passwordApi.resendReset(requestId);

      return {
        success: true,
        ...res.data,
      };
    } catch (e) {
      return {
        success: false,
        message:
          e.response?.data?.message ||
          "Unable to resend OTP.",
      };
    }
  };

  /*
   * Forgot Password - Complete Reset
   */
  const resetForgottenPassword = async (
    requestId,
    resetToken,
    newPassword,
  ) => {
    try {
      const res = await passwordApi.completeReset(
        requestId,
        resetToken,
        newPassword,
      );

      return {
        success: true,
        ...res.data,
      };
    } catch (e) {
      return {
        success: false,
        message:
          e.response?.data?.message ||
          "Unable to reset password.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        token,
        loading,

        // Authentication state
        authReady,

        // Authentication
        login,
        logout,

        // Password
        changePassword,

        // Password reset
        sendPasswordResetOtp,
        sendMobilePasswordResetOtp,
        verifyPasswordResetOtp,
        resendPasswordResetOtp,
        resetForgottenPassword,
        // Role
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}