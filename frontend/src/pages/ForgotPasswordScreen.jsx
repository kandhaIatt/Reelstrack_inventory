import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Disc, User, Lock, Eye, EyeOff, ShieldAlert, CheckCircle, KeyRound, RotateCcw } from "lucide-react";

const passwordError = (password) => {
  if (password.length < 8) return "Password must contain at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password must contain at least one special character.";
  return "";
};

export default function ForgotPasswordScreen() {
  const { sendPasswordResetOtp, verifyPasswordResetOtp, resendPasswordResetOtp, resetForgottenPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loginId, setLoginId] = useState("");
  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const clearMessages = () => { setError(""); setNotice(""); };

  const handleSendOtp = (e) => {
    e.preventDefault(); clearMessages();
    const result = sendPasswordResetOtp(loginId);
    if (!result.success) return setError(result.message);
    setRequestId(result.requestId); setDemoOtp(result.demoOtp || ""); setNotice(result.message); setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault(); clearMessages();
    if (!/^\d{6}$/.test(otp.trim())) return setError("Please enter the 6-digit OTP.");
    const result = verifyPasswordResetOtp(requestId, otp);
    if (!result.success) return setError(result.message);
    setDemoOtp(""); setNotice(result.message); setStep(3);
  };

  const handleResend = () => {
    clearMessages(); setOtp("");
    const result = resendPasswordResetOtp(requestId);
    if (!result.success) { setError(result.message); setStep(1); setRequestId(""); return; }
    setDemoOtp(result.demoOtp || ""); setNotice(result.message);
  };

  const handleReset = (e) => {
    e.preventDefault(); clearMessages();
    const validation = passwordError(newPassword);
    if (validation) return setError(validation);
    if (newPassword !== confirmPassword) return setError("New password and confirm password do not match.");
    const result = resetForgottenPassword(requestId, newPassword);
    if (!result.success) { setError(result.message); setStep(1); setRequestId(""); return; }
    setNotice(result.message); setNewPassword(""); setConfirmPassword(""); setStep(4);
  };

  const titles = {1:"Forgot Password",2:"Verify OTP",3:"Create New Password",4:"Password Reset"};
  const subtitles = {1:"Enter your registered email or mobile number",2:"Enter the OTP sent to your registered contact",3:"Choose a new password for your ReelTrack account",4:"Your password has been updated successfully"};

  const FieldShell = ({ icon, children }) => <div className="searchbar"><span className="ico">{icon}</span>{children}</div>;

  return <div style={{minHeight:"100vh",background:"var(--primary-900)",display:"grid",placeItems:"center",padding:"20px"}}>
    <div className="card" style={{width:"100%",maxWidth:"420px",padding:"28px 24px",background:"#fff",borderRadius:"18px",boxShadow:"var(--shadow-lg)"}}>
      <div style={{textAlign:"center",marginBottom:"20px"}}>
        <div className="brand-mark" style={{width:"48px",height:"48px",margin:"0 auto 12px",borderRadius:"14px"}}><Disc size={26}/></div>
        <h1 style={{fontSize:"22px",fontWeight:700,margin:0,color:"var(--ink)"}}>{titles[step]}</h1>
        <p className="muted" style={{fontSize:"13px",margin:"4px 0 0"}}>{subtitles[step]}</p>
      </div>

      {step < 4 && <div style={{display:"flex",gap:"6px",marginBottom:"20px"}}>{[1,2,3].map(n=><div key={n} style={{height:"4px",flex:1,borderRadius:"4px",background:n<=step?"var(--primary)":"#e5e7eb"}} />)}</div>}

      {error && <div className="pill-note warn" style={{marginBottom:"16px",background:"var(--danger-soft)",color:"var(--danger)"}}><ShieldAlert size={16}/><span>{error}</span></div>}
      {notice && <div className="pill-note" style={{marginBottom:"16px"}}><CheckCircle size={16}/><span>{notice}</span></div>}

      {step === 1 && <form onSubmit={handleSendOtp}>
        <div className="field"><label>Email or Mobile Number</label><FieldShell icon={<User size={16}/>}><input className="input" type="text" autoFocus placeholder="Enter email or mobile number" value={loginId} onChange={e=>setLoginId(e.target.value)}/></FieldShell></div>
        <button type="submit" className="btn btn-primary btn-block" style={{marginTop:"20px"}}>Send OTP</button>
      </form>}

      {step === 2 && <form onSubmit={handleVerifyOtp}>
        <div className="field"><label>OTP</label><FieldShell icon={<KeyRound size={16}/>}><input className="input" type="text" inputMode="numeric" maxLength={6} autoFocus placeholder="Enter 6-digit OTP" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}/></FieldShell></div>
        {demoOtp && <div className="pill-note" style={{marginTop:"12px",fontSize:"12px"}}><span><strong>Frontend demo OTP:</strong> {demoOtp}<br/>Actual OTP delivery will be connected with the backend later.</span></div>}
        <button type="submit" className="btn btn-primary btn-block" style={{marginTop:"20px"}}>Verify OTP</button>
        <button type="button" onClick={handleResend} style={{width:"100%",marginTop:"14px",border:0,background:"transparent",color:"var(--primary)",fontWeight:600,cursor:"pointer",display:"flex",justifyContent:"center",alignItems:"center",gap:"6px"}}><RotateCcw size={14}/> Resend OTP</button>
      </form>}

      {step === 3 && <form onSubmit={handleReset}>
        <div className="field"><label>New Password</label><FieldShell icon={<Lock size={16}/>}><input className="input" type={showNewPassword?"text":"password"} autoFocus placeholder="Enter new password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><button type="button" className="password-eye" onClick={()=>setShowNewPassword(v=>!v)}>{showNewPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></FieldShell></div>
        <div className="field"><label>Confirm New Password</label><FieldShell icon={<Lock size={16}/>}><input className="input" type={showConfirmPassword?"text":"password"} placeholder="Confirm new password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/><button type="button" className="password-eye" onClick={()=>setShowConfirmPassword(v=>!v)}>{showConfirmPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></FieldShell></div>
        <p className="muted" style={{fontSize:"12px",margin:"8px 0 0"}}>Minimum 8 characters, including one uppercase letter and one special character.</p>
        <button type="submit" className="btn btn-primary btn-block" style={{marginTop:"20px"}}>Reset Password</button>
      </form>}

      {step === 4 && <button type="button" className="btn btn-primary btn-block" onClick={()=>navigate("/login",{replace:true})}>Go to Login</button>}

      {step < 4 && <div style={{textAlign:"center",marginTop:"20px",fontSize:"13px"}}><Link to="/login" style={{color:"var(--primary)",fontWeight:600,textDecoration:"none"}}>← Back to Sign In</Link></div>}
    </div>
  </div>;
}
