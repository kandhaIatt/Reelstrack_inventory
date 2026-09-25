import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Disc,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle,
  KeyRound,
  RotateCcw,
} from "lucide-react";

const passwordError = (password) => {
  if (password.length < 8)
    return "Password must contain at least 8 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Password must contain at least one special character.";
  return "";
};

const FieldShell = ({ icon, children }) => (
  <div className="searchbar">
    <span className="ico">{icon}</span>
    {children}
  </div>
);

export default function ForgotPasswordScreen() {
  const {
    sendPasswordResetOtp,
    sendMobilePasswordResetOtp,
    verifyPasswordResetOtp,
    resendPasswordResetOtp,
    resetForgottenPassword,
  } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [resetMethod, setResetMethod] = useState("email");

  const [requestId, setRequestId] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [resendSeconds, setResendSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (resetMethod === "email") {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        return setError("Please enter a valid email address.");
      }
    } else {
      if (!/^\d{10}$/.test(mobileNumber.trim())) {
        return setError("Please enter a valid 10-digit mobile number.");
      }
    }

    setBusy(true);

    try {
      let result;

      if (resetMethod === "email") {
        result = await sendPasswordResetOtp(email.trim());
      } else {
        result = await sendMobilePasswordResetOtp(
          mobileNumber.trim(),
          null
        );
      }

      if (!result.success) {
        return setError(result.message);
      }

      if (!result.requestId) {
        setNotice(result.message);
        return;
      }

      setRequestId(result.requestId);
      setNotice(result.message);
      setStep(2);
      setResendSeconds(60);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(otp.trim())) {
      return setError("Please enter the 6-digit OTP.");
    }

    setBusy(true);

    try {
      const result = await verifyPasswordResetOtp(requestId, otp);

      if (!result.success) {
        return setError(result.message);
      }

      setResetToken(result.resetToken || "");
      setNotice(result.message);
      setStep(3);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || busy) return;

    clearMessages();
    setOtp("");
    setBusy(true);

    try {
      let result;

      if (resetMethod === "email") {
        result = await resendPasswordResetOtp(requestId);
      } else {
        result = await sendMobilePasswordResetOtp(
          mobileNumber.trim(),
          requestId
        );
      }

      if (!result.success) {
        setError(result.message);
        return;
      }

      /*
       * Mobile resend creates a new requestId.
       * Email resend keeps the existing requestId.
       */
      if (resetMethod === "mobile" && result.requestId) {
        setRequestId(result.requestId);
      }

      setNotice(result.message);
      setResendSeconds(60);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    clearMessages();

    const validation = passwordError(newPassword);

    if (validation) {
      return setError(validation);
    }

    if (newPassword !== confirmPassword) {
      return setError(
        "New password and confirm password do not match."
      );
    }

    setBusy(true);

    try {
      const result = await resetForgottenPassword(
        requestId,
        resetToken,
        newPassword
      );

      if (!result.success) {
        setError(result.message);
        setStep(1);
        setRequestId("");
        setResetToken("");
        return;
      }

      setNotice(result.message);
      setNewPassword("");
      setConfirmPassword("");
      setStep(4);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(
      () => setResendSeconds((v) => Math.max(0, v - 1)),
      1000
    );

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const titles = {
    1: "Forgot Password",
    2: "Verify OTP",
    3: "Create New Password",
    4: "Password Reset",
  };

  const subtitles = {
    1:
      resetMethod === "email"
        ? "Enter your registered email address"
        : "Enter your registered mobile number",
    2:
      resetMethod === "email"
        ? "Enter the OTP sent to your email"
        : "Enter the OTP sent to your mobile number",
    3: "Choose a new password for your ReelTrack account",
    4: "Your password has been updated successfully",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--primary-900)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "28px 24px",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            className="brand-mark"
            style={{
              width: "48px",
              height: "48px",
              margin: "0 auto 12px",
              borderRadius: "14px",
            }}
          >
            <Disc size={26} />
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
              color: "var(--ink)",
            }}
          >
            {titles[step]}
          </h1>

          <p
            className="muted"
            style={{ fontSize: "13px", margin: "4px 0 0" }}
          >
            {subtitles[step]}
          </p>
        </div>

        {step < 4 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              marginBottom: "20px",
            }}
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: "4px",
                  flex: 1,
                  borderRadius: "4px",
                  background:
                    n <= step
                      ? "var(--primary)"
                      : "#e5e7eb",
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="pill-note warn"
            style={{
              marginBottom: "16px",
              background: "var(--danger-soft)",
              color: "var(--danger)",
            }}
          >
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div
            className="pill-note"
            style={{ marginBottom: "16px" }}
          >
            <CheckCircle size={16} />
            <span>{notice}</span>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            {/* Email / Mobile selector */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "18px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setResetMethod("email");
                  clearMessages();
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border:
                    resetMethod === "email"
                      ? "1px solid var(--primary)"
                      : "1px solid #e5e7eb",
                  background:
                    resetMethod === "email"
                      ? "var(--primary)"
                      : "#fff",
                  color:
                    resetMethod === "email"
                      ? "#fff"
                      : "var(--ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Email
              </button>

              <button
                type="button"
                onClick={() => {
                  setResetMethod("mobile");
                  clearMessages();
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border:
                    resetMethod === "mobile"
                      ? "1px solid var(--primary)"
                      : "1px solid #e5e7eb",
                  background:
                    resetMethod === "mobile"
                      ? "var(--primary)"
                      : "#fff",
                  color:
                    resetMethod === "mobile"
                      ? "#fff"
                      : "var(--ink)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Mobile
              </button>
            </div>

            {resetMethod === "email" ? (
              <div className="field">
                <label>Email</label>

                <FieldShell icon={<User size={16} />}>
                  <input
                    className="input"
                    type="email"
                    autoFocus
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />
                </FieldShell>
              </div>
            ) : (
              <div className="field">
                <label>Mobile Number</label>

                <FieldShell icon={<User size={16} />}>
                  <input
                    className="input"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    autoFocus
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />
                </FieldShell>

                <p
                  className="muted"
                  style={{
                    fontSize: "12px",
                    margin: "6px 0 0",
                  }}
                >
                  Enter 10 digits without +91.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: "20px" }}
              disabled={busy}
            >
              {busy ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="field">
              <label>OTP</label>

              <FieldShell icon={<KeyRound size={16} />}>
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                />
              </FieldShell>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: "20px" }}
              disabled={busy}
            >
              {busy ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={busy || resendSeconds > 0}
              style={{
                width: "100%",
                marginTop: "14px",
                border: 0,
                background: "transparent",
                color: "var(--primary)",
                fontWeight: 600,
                cursor:
                  busy || resendSeconds > 0
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px",
                opacity:
                  busy || resendSeconds > 0 ? 0.6 : 1,
              }}
            >
              <RotateCcw size={14} />{" "}
              {resendSeconds > 0
                ? `Resend OTP in ${resendSeconds}s`
                : "Resend OTP"}
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleReset}>
            <div className="field">
              <label>New Password</label>

              <FieldShell icon={<Lock size={16} />}>
                <input
                  className="input"
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  autoFocus
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowNewPassword((v) => !v)
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </FieldShell>
            </div>

            <div className="field">
              <label>Confirm New Password</label>

              <FieldShell icon={<Lock size={16} />}>
                <input
                  className="input"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowConfirmPassword((v) => !v)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </FieldShell>
            </div>

            <p
              className="muted"
              style={{
                fontSize: "12px",
                margin: "8px 0 0",
              }}
            >
              Minimum 8 characters, including one
              uppercase letter and one special character.
            </p>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: "20px" }}
              disabled={busy}
            >
              {busy ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() =>
              navigate("/login", { replace: true })
            }
          >
            Go to Login
          </button>
        )}

        {step < 4 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
            }}
          >
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}