import React, { useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Disc,
  Lock,
  User as UserIcon,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginScreen() {
  const { login, loading } = useAuth();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // PRD: Empty fields should show inline validation
    // and no login call should be made
    if (!loginId.trim()) {
      setError("Please enter your email or mobile number.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    const res = await login(loginId, password);

if (!res.success) {
  setError(res.message);
  return;
}

if (res.data.forcePasswordChange) {
  navigate("/change-password", {
    replace: true,
  });
}
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
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
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
            Sign in to ReelTrack
          </h1>

          <p
            className="muted"
            style={{
              fontSize: "13px",
              margin: "4px 0 0",
            }}
          >
            Reel Inventory & Purchase Orders System
          </p>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email or Mobile Number</label>

            <div className="searchbar">
              <span className="ico">
                <UserIcon size={16} />
              </span>

              <input
                className="input"
                type="text"
                placeholder="Enter email or mobile number"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <label>Password</label>

    <Link
      to="/forgot-password"
      style={{
        fontSize: "13px",
        textDecoration: "none",
        color: "var(--primary)",
        fontWeight: 600,
      }}
    >
      Forgot Password?
    </Link>
  </div>

  <div className="searchbar">
    <span className="ico">
      <Lock size={16} />
    </span>

    <input
      className="input"
      type={showPassword ? "text" : "password"}
      placeholder="Enter password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      type="button"
      className="password-eye"
     onClick={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
</div>

         

  


          <button
           style={{
    marginTop: "20px",
  }}
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : "Sign In"}
          </button>
        </form>

        
      </div>
    </div>
  );
}