import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, ShieldAlert, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError("Password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(currentPassword, newPassword);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError("Unable to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-head">
        <h1 className="page-title">Change Password</h1>

        <p className="page-sub">Update your account password securely</p>
      </div>

      <div className="change-password-card">
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

        {success && (
          <div
            className="pill-note"
            style={{
              marginBottom: "16px",
            }}
          >
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="currentPassword">Current Password</label>

            <div className="searchbar change-password-input">
              <span className="ico">
                <Lock size={16} />
              </span>

              <input
                id="currentPassword"
                className="input"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="newPassword">New Password</label>

            <div className="searchbar change-password-input">
              <span className="ico">
                <Lock size={16} />
              </span>

              <input
                id="newPassword"
                className="input"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={
                  showNewPassword ? "Hide new password" : "Show new password"
                }
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm New Password</label>

            <div className="searchbar change-password-input">
              <span className="ico">
                <Lock size={16} />
              </span>

              <input
                id="confirmPassword"
                className="input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary change-password-submit"
            disabled={loading}
          >
            {loading ? "Updating Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
