import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { users as initialUsers } from "../pages/data/mockData";
import client from "../api/client";

const AuthContext = createContext();

const SESSION_DURATION = 4 * 60 * 60 * 1000;
const INACTIVITY_DURATION = 30 * 60 * 1000;
const LOCK_DURATION = 15 * 60 * 1000;

const OTP_EXPIRY_MS = 5 * 60 * 1000;

export function AuthProvider({ children }) {
  // ============================================================
  // LOCAL FRONTEND USERS
  // ============================================================
  // These are still used by the existing User Management UI.
  // Authentication itself is now handled by the backend.
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("reeltrack_users");

    return savedUsers
      ? JSON.parse(savedUsers)
      : initialUsers;
  });

  useEffect(() => {
    localStorage.setItem(
      "reeltrack_users",
      JSON.stringify(users)
    );
  }, [users]);

  // ============================================================
  // CURRENT USER
  // ============================================================
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("reeltrack_user");
    const expiresAt = localStorage.getItem(
      "reeltrack_session_expires"
    );

    if (!savedUser) {
      return null;
    }

    // If there is a session expiry, check it.
    if (expiresAt && Date.now() > Number(expiresAt)) {
      localStorage.removeItem("reeltrack_user");
      localStorage.removeItem("reeltrack_token");
      localStorage.removeItem("reeltrack_session_expires");
      localStorage.removeItem("reeltrack_last_activity");

      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("reeltrack_user");
      return null;
    }
  });

  // ============================================================
  // REAL JWT TOKEN
  // ============================================================
  const [token, setToken] = useState(() => {
    return localStorage.getItem("reeltrack_token");
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("reeltrack_token");
    localStorage.removeItem("reeltrack_user");
    localStorage.removeItem("reeltrack_session_expires");
    localStorage.removeItem("reeltrack_last_activity");
  }, []);

  // ============================================================
  // RESTORE / VALIDATE SESSION AFTER PAGE REFRESH
  // ============================================================
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const storedToken =
        localStorage.getItem("reeltrack_token");

      const storedUser =
        localStorage.getItem("reeltrack_user");

      const expiresAt =
        localStorage.getItem("reeltrack_session_expires");

      if (!storedToken) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      // Check frontend 4-hour session.
      if (
        expiresAt &&
        Date.now() > Number(expiresAt)
      ) {
        logout();

        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        // The axios client automatically sends:
        // Authorization: Bearer <JWT>
        const response = await client.get("/auth/me");

        if (!mounted) return;

        const data = response.data;

        const restoredUser = {
          id: data.userId,
          userId: data.userId,
          username: data.username,
          name: data.name,
          role: data.role,
          unitId: data.unitId,
          passwordChangeRequired:
            data.passwordChangeRequired,

          // Compatibility with existing frontend code.
          forcePasswordChange:
            data.passwordChangeRequired,
        };

        setUser(restoredUser);
        setToken(storedToken);

        localStorage.setItem(
          "reeltrack_user",
          JSON.stringify(restoredUser)
        );

        if (
          !localStorage.getItem(
            "reeltrack_last_activity"
          )
        ) {
          localStorage.setItem(
            "reeltrack_last_activity",
            String(Date.now())
          );
        }
      } catch (error) {
        console.error(
          "Session restore failed:",
          error
        );

        // JWT is invalid/expired.
        logout();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [logout]);

  // ============================================================
  // ROLE HELPERS
  // ============================================================
  const normalizeRole = (role) =>
    String(role || "USER").toUpperCase() === "ADMIN"
      ? "ADMIN"
      : "USER";

  const isAdmin = () =>
    String(user?.role || "").toUpperCase() === "ADMIN";

  // ============================================================
  // LOCAL USER HELPERS
  // ============================================================
  const persistUsers = (nextUsers) => {
    setUsers(nextUsers);

    localStorage.setItem(
      "reeltrack_users",
      JSON.stringify(nextUsers)
    );
  };

  // ============================================================
  // CREATE USER
  // ============================================================
  const createUser = (userData) => {
    if (!isAdmin()) {
      return {
        success: false,
        message: "Only an Admin can create users.",
      };
    }

    const name = userData.name?.trim();
    const email = userData.email?.trim().toLowerCase();
    const mobile = userData.mobile?.trim();
    const password = userData.password || "";
    const role = normalizeRole(userData.role);

    if (!name || !email || !mobile || !password) {
      return {
        success: false,
        message: "Please fill in all required fields.",
      };
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    if (!/^\d{10}$/.test(mobile)) {
      return {
        success: false,
        message: "Mobile number must contain 10 digits.",
      };
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return {
        success: false,
        message:
          "Password must be at least 8 characters with one uppercase letter and one special character.",
      };
    }

    const duplicate = users.some(
      (item) =>
        item.email?.toLowerCase() === email ||
        item.mobile === mobile
    );

    if (duplicate) {
      return {
        success: false,
        message:
          "A user with this email or mobile number already exists.",
      };
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      mobile,
      password,
      role,
      unitId:
        role === "ADMIN"
          ? "HO"
          : userData.unitId || "U1",
      active: userData.active ?? true,
      failedAttempts: 0,
      lockedUntil: null,
      forcePasswordChange:
        userData.forcePasswordChange ?? true,
    };

    persistUsers([...users, newUser]);

    return {
      success: true,
      data: newUser,
      message: "User created successfully.",
    };
  };

  // ============================================================
  // UPDATE USER
  // ============================================================
  const updateUser = (id, updates) => {
    if (!isAdmin()) {
      return {
        success: false,
        message: "Only an Admin can edit users.",
      };
    }

    const target = users.find(
      (item) => item.id === id
    );

    if (!target) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const email = updates.email
      ?.trim()
      .toLowerCase();

    const mobile = updates.mobile?.trim();

    if (
      email &&
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    if (
      mobile &&
      !/^\d{10}$/.test(mobile)
    ) {
      return {
        success: false,
        message:
          "Mobile number must contain 10 digits.",
      };
    }

    const duplicate = users.some(
      (item) =>
        item.id !== id &&
        ((email &&
          item.email?.toLowerCase() === email) ||
          (mobile &&
            item.mobile === mobile))
    );

    if (duplicate) {
      return {
        success: false,
        message:
          "Another user already uses this email or mobile number.",
      };
    }

    const nextRole = updates.role
      ? normalizeRole(updates.role)
      : target.role;

    const updatedUser = {
      ...target,
      ...updates,

      name:
        updates.name?.trim() ??
        target.name,

      email:
        email ??
        target.email,

      mobile:
        mobile ??
        target.mobile,

      role: nextRole,

      unitId:
        nextRole === "ADMIN"
          ? "HO"
          : updates.unitId ||
            target.unitId ||
            "U1",
    };

    persistUsers(
      users.map((item) =>
        item.id === id
          ? updatedUser
          : item
      )
    );

    // Keep current frontend session in sync.
    if (user?.id === id) {
      const safeUser = {
        ...user,
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        unitId: updatedUser.unitId,
        forcePasswordChange:
          updatedUser.forcePasswordChange,
      };

      setUser(safeUser);

      localStorage.setItem(
        "reeltrack_user",
        JSON.stringify(safeUser)
      );
    }

    return {
      success: true,
      data: updatedUser,
      message: "User updated successfully.",
    };
  };

  // ============================================================
  // ACTIVATE / DEACTIVATE USER
  // ============================================================
  const setUserActive = (id, active) => {
    if (!isAdmin()) {
      return {
        success: false,
        message:
          "Only an Admin can change account status.",
      };
    }

    if (user?.id === id && !active) {
      return {
        success: false,
        message:
          "You cannot deactivate your own account.",
      };
    }

    const target = users.find(
      (item) => item.id === id
    );

    if (!target) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (
      target.role === "ADMIN" &&
      !active
    ) {
      const activeAdmins =
        users.filter(
          (item) =>
            item.role === "ADMIN" &&
            item.active
        );

      if (activeAdmins.length <= 1) {
        return {
          success: false,
          message:
            "At least one active Admin account must remain.",
        };
      }
    }

    persistUsers(
      users.map((item) =>
        item.id === id
          ? { ...item, active }
          : item
      )
    );

    return {
      success: true,
      message: active
        ? "User activated."
        : "User deactivated.",
    };
  };

  // ============================================================
  // DELETE USER
  // ============================================================
  const deleteUser = (id) => {
    if (!isAdmin()) {
      return {
        success: false,
        message:
          "Only an Admin can delete users.",
      };
    }

    if (user?.id === id) {
      return {
        success: false,
        message:
          "You cannot delete your own account.",
      };
    }

    const target = users.find(
      (item) => item.id === id
    );

    if (!target) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (target.role === "ADMIN") {
      const adminCount =
        users.filter(
          (item) => item.role === "ADMIN"
        ).length;

      if (adminCount <= 1) {
        return {
          success: false,
          message:
            "At least one Admin account must remain.",
        };
      }
    }

    persistUsers(
      users.filter(
        (item) => item.id !== id
      )
    );

    return {
      success: true,
      message:
        "User deleted successfully.",
    };
  };

  // ============================================================
  // CREATE SESSION
  // ============================================================
  const createSession = (
    loggedInUser,
    realToken
  ) => {
    const safeUser = {
      id: loggedInUser.id,
      userId: loggedInUser.userId,
      username: loggedInUser.username,
      name: loggedInUser.name,
      email: loggedInUser.email,
      mobile: loggedInUser.mobile,
      role: loggedInUser.role,
      unitId: loggedInUser.unitId,

      passwordChangeRequired:
        loggedInUser.passwordChangeRequired,

      // Keep compatibility with existing frontend.
      forcePasswordChange:
        loggedInUser.forcePasswordChange ??
        loggedInUser.passwordChangeRequired ??
        false,
    };

    const expiresAt =
      Date.now() + SESSION_DURATION;

    const lastActivity = Date.now();

    setUser(safeUser);
    setToken(realToken);

    localStorage.setItem(
      "reeltrack_user",
      JSON.stringify(safeUser)
    );

    // IMPORTANT:
    // This is the REAL JWT returned by Spring Boot.
    localStorage.setItem(
      "reeltrack_token",
      realToken
    );

    localStorage.setItem(
      "reeltrack_session_expires",
      String(expiresAt)
    );

    localStorage.setItem(
      "reeltrack_last_activity",
      String(lastActivity)
    );
  };

  // ============================================================
  // REAL BACKEND LOGIN
  // ============================================================
  const login = async (
    loginId,
    password
  ) => {
    setLoading(true);

    try {
      if (!loginId?.trim() || !password) {
        return {
          success: false,
          message:
            "Username and password are required.",
        };
      }

      // ========================================================
      // CALL SPRING BOOT
      // POST /api/auth/login
      // ========================================================
      const response =
        await client.post(
          "/auth/login",
          {
            username: loginId.trim(),
            password,
          }
        );

      const data = response.data;

      // ========================================================
      // BACKEND RESPONSE
      //
      // {
      //   token,
      //   userId,
      //   username,
      //   name,
      //   role,
      //   unitId,
      //   passwordChangeRequired
      // }
      // ========================================================

      if (!data?.token) {
        return {
          success: false,
          message:
            "Login failed. Server did not return a JWT token.",
        };
      }

      const loggedInUser = {
        id: data.userId,
        userId: data.userId,
        username: data.username,
        name: data.name,
        role: data.role,
        unitId: data.unitId,
        passwordChangeRequired:
          data.passwordChangeRequired,

        forcePasswordChange:
          data.passwordChangeRequired,
      };

      // Store REAL JWT.
      createSession(
        loggedInUser,
        data.token
      );

      return {
        success: true,
        data: loggedInUser,
      };
    } catch (error) {
      console.error(
        "Backend login error:",
        error
      );

      const status =
        error.response?.status;

      const backendMessage =
        error.response?.data?.message;

      if (status === 401) {
        return {
          success: false,
          message:
            "Invalid username or password.",
        };
      }

      if (status === 400) {
        return {
          success: false,
          message:
            backendMessage ||
            "Username and password are required.",
        };
      }

      return {
        success: false,
        message:
          backendMessage ||
          "Unable to connect to the backend server.",
      };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================
  // NOTE:
  // This remains your existing frontend implementation.
  // Backend password API can be connected separately.
  const changePassword = (
    currentPassword,
    newPassword
  ) => {
    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const currentUser = users.find(
      (item) => item.id === user.id
    );

    if (!currentUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (
      currentUser.password !==
      currentPassword
    ) {
      return {
        success: false,
        message:
          "Current password is incorrect.",
      };
    }

    const hasMinimumLength =
      newPassword.length >= 8;

    const hasUppercase =
      /[A-Z]/.test(newPassword);

    const hasSpecialCharacter =
      /[!@#$%^&*(),.?":{}|<>]/.test(
        newPassword
      );

    if (!hasMinimumLength) {
      return {
        success: false,
        message:
          "Password must contain at least 8 characters.",
      };
    }

    if (!hasUppercase) {
      return {
        success: false,
        message:
          "Password must contain at least one uppercase letter.",
      };
    }

    if (!hasSpecialCharacter) {
      return {
        success: false,
        message:
          "Password must contain at least one special character.",
      };
    }

    setUsers(
      (currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                password: newPassword,
                forcePasswordChange: false,
              }
            : item
        )
    );

    const updatedUser = {
      ...user,
      forcePasswordChange: false,
      passwordChangeRequired: false,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "reeltrack_user",
      JSON.stringify(updatedUser)
    );

    return {
      success: true,
      message:
        "Password changed successfully.",
    };
  };

  // ============================================================
  // CHECK 4-HOUR SESSION EXPIRY
  // ============================================================
  useEffect(() => {
    if (!user) return;

    const interval =
      setInterval(() => {
        const expiresAt =
          Number(
            localStorage.getItem(
              "reeltrack_session_expires"
            )
          );

        if (
          expiresAt &&
          Date.now() > expiresAt
        ) {
          logout();
        }
      }, 10000);

    return () =>
      clearInterval(interval);
  }, [user, logout]);

  // ============================================================
  // CHECK 30-MINUTE INACTIVITY
  // ============================================================
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      localStorage.setItem(
        "reeltrack_last_activity",
        String(Date.now())
      );
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(
        event,
        updateActivity
      );
    });

    const interval =
      setInterval(() => {
        const lastActivity =
          Number(
            localStorage.getItem(
              "reeltrack_last_activity"
            )
          );

        if (
          lastActivity &&
          Date.now() -
            lastActivity >
            INACTIVITY_DURATION
        ) {
          logout();
        }
      }, 10000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(
          event,
          updateActivity
        );
      });

      clearInterval(interval);
    };
  }, [user, logout]);

  // ============================================================
  // PASSWORD RECOVERY
  // ============================================================
  // Existing frontend-only implementation.
  // Backend OTP/reset integration can be connected separately.
  const passwordRecoveryRef =
    useRef(new Map());

  const findRecoveryUser = (
    loginId
  ) => {
    const raw = String(
      loginId || ""
    ).trim();

    const normalized =
      raw.toLowerCase();

    return users.find(
      (item) =>
        item.email?.toLowerCase() ===
          normalized ||
        item.mobile === raw
    );
  };

  const sendPasswordResetOtp = (
    loginId
  ) => {
    const raw = String(
      loginId || ""
    ).trim();

    if (!raw) {
      return {
        success: false,
        message:
          "Please enter your email or mobile number.",
      };
    }

    const looksLikeEmail =
      raw.includes("@");

    if (
      looksLikeEmail &&
      !/^\S+@\S+\.\S+$/.test(raw)
    ) {
      return {
        success: false,
        message:
          "Please enter a valid email address.",
      };
    }

    if (
      !looksLikeEmail &&
      !/^\d{10}$/.test(raw)
    ) {
      return {
        success: false,
        message:
          "Please enter a valid 10-digit mobile number.",
      };
    }

    const foundUser =
      findRecoveryUser(raw);

    if (!foundUser) {
      return {
        success: false,
        message:
          "No account found with this email or mobile number.",
      };
    }

    if (!foundUser.active) {
      return {
        success: false,
        message:
          "User account is inactive.",
      };
    }

    const otp = String(
      Math.floor(
        100000 +
          Math.random() * 900000
      )
    );

    const requestId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    passwordRecoveryRef.current.set(
      requestId,
      {
        userId: foundUser.id,
        loginId: raw,
        otp,
        expiresAt:
          Date.now() +
          OTP_EXPIRY_MS,
        verified: false,
      }
    );

    return {
      success: true,
      requestId,
      demoOtp: otp,
      message:
        "OTP sent successfully. It is valid for 5 minutes.",
    };
  };

  const verifyPasswordResetOtp = (
    requestId,
    otp
  ) => {
    const request =
      passwordRecoveryRef.current.get(
        requestId
      );

    if (!request) {
      return {
        success: false,
        message:
          "Password reset session is invalid. Please request a new OTP.",
      };
    }

    if (
      Date.now() >
      request.expiresAt
    ) {
      passwordRecoveryRef.current.delete(
        requestId
      );

      return {
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      };
    }

    if (
      String(otp || "").trim() !==
      request.otp
    ) {
      return {
        success: false,
        message:
          "Incorrect OTP. Please try again.",
      };
    }

    request.verified = true;
    request.otp = null;
    request.verifiedAt =
      Date.now();

    passwordRecoveryRef.current.set(
      requestId,
      request
    );

    return {
      success: true,
      message:
        "OTP verified successfully.",
    };
  };

  const resendPasswordResetOtp = (
    requestId
  ) => {
    const request =
      passwordRecoveryRef.current.get(
        requestId
      );

    if (!request) {
      return {
        success: false,
        message:
          "Password reset session is invalid. Please start again.",
      };
    }

    const otp = String(
      Math.floor(
        100000 +
          Math.random() * 900000
      )
    );

    request.otp = otp;
    request.expiresAt =
      Date.now() +
      OTP_EXPIRY_MS;
    request.verified = false;

    passwordRecoveryRef.current.set(
      requestId,
      request
    );

    return {
      success: true,
      demoOtp: otp,
      message:
        "A new OTP has been sent. It is valid for 5 minutes.",
    };
  };

  const resetForgottenPassword = (
    requestId,
    newPassword
  ) => {
    const request =
      passwordRecoveryRef.current.get(
        requestId
      );

    if (
      !request ||
      !request.verified
    ) {
      return {
        success: false,
        message:
          "OTP verification is required before resetting your password.",
      };
    }

    const foundUser =
      users.find(
        (item) =>
          item.id === request.userId
      );

    if (!foundUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    setUsers(
      (currentUsers) =>
        currentUsers.map((item) =>
          item.id === foundUser.id
            ? {
                ...item,
                password: newPassword,
                failedAttempts: 0,
                lockedUntil: null,
                forcePasswordChange: false,
              }
            : item
        )
    );

    passwordRecoveryRef.current.delete(
      requestId
    );

    return {
      success: true,
      message:
        "Password reset successfully",
    };
  };

  // ============================================================
  // PROVIDER
  // ============================================================
  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        token,
        loading,

        login,
        logout,

        changePassword,

        sendPasswordResetOtp,
        verifyPasswordResetOtp,
        resendPasswordResetOtp,
        resetForgottenPassword,

        createUser,
        updateUser,
        setUserActive,
        deleteUser,

        isAdmin:
          user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}