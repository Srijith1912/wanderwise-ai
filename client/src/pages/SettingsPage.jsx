import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import * as authService from "../services/authService";
import Layout from "../components/Layout";
import { evaluatePassword, passwordIsValid } from "../utils/passwordRules";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: "", text: "" });

  // Email change
  const [emailPwd, setEmailPwd] = useState("");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState({ type: "", text: "" });

  const ruleResults = useMemo(() => evaluatePassword(newPwd), [newPwd]);
  const allRulesPassed = passwordIsValid(newPwd);
  const passwordsMatch = newPwd.length > 0 && newPwd === confirmPwd;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: "", text: "" });
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: "error", text: "Fill all password fields" });
      return;
    }
    if (!allRulesPassed) {
      setPwdMsg({ type: "error", text: "New password doesn't meet the requirements" });
      return;
    }
    if (!passwordsMatch) {
      setPwdMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    setPwdLoading(true);
    try {
      await authService.changePassword(currentPwd, newPwd);
      setPwdMsg({ type: "success", text: "Password updated. You'll stay logged in." });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setPwdMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailMsg({ type: "", text: "" });
    if (!emailPwd || !newEmail) {
      setEmailMsg({ type: "error", text: "Both password and new email are required" });
      return;
    }
    if (newEmail === user?.email) {
      setEmailMsg({ type: "error", text: "That's already your email" });
      return;
    }
    setEmailLoading(true);
    try {
      await authService.changeEmail(emailPwd, newEmail);
      setEmailMsg({ type: "success", text: "Email updated." });
      setEmailPwd("");
    } catch (err) {
      setEmailMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update email",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center text-ink-500">Loading…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-wider uppercase text-forest-700 mb-2">Account</p>
          <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Settings</h1>
          <p className="text-ink-500 mb-8">Manage your login credentials and account preferences.</p>

          {/* Account snapshot */}
          <div className="card p-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-1">Signed in as</p>
              <p className="font-semibold text-ink-900">{user.name}</p>
              <p className="text-sm text-ink-500">{user.email}</p>
            </div>
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="btn-secondary text-sm px-4 py-2"
            >
              Edit profile →
            </button>
          </div>

          {/* Password */}
          <div className="card p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-1">Change password</h2>
            <p className="text-sm text-ink-500 mb-5">Choose a strong password you don't use anywhere else.</p>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Current password</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">New password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="input-field"
                  autoComplete="new-password"
                />
                {newPwd.length > 0 && (
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
                    {ruleResults.map((rule) => (
                      <li
                        key={rule.id}
                        className={`flex items-center gap-2 text-xs ${rule.passed ? "text-forest-700" : "text-ink-500"}`}
                      >
                        <span
                          className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${rule.passed ? "bg-forest-500 text-white" : "bg-cream-300 text-ink-500"}`}
                        >
                          {rule.passed ? "✓" : "•"}
                        </span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="input-field"
                  autoComplete="new-password"
                />
                {confirmPwd.length > 0 && (
                  <p className={`mt-2 text-xs ${passwordsMatch ? "text-forest-700" : "text-coral-600"}`}>
                    {passwordsMatch ? "Passwords match." : "Passwords do not match."}
                  </p>
                )}
              </div>

              {pwdMsg.text && (
                <p className={`text-sm ${pwdMsg.type === "error" ? "text-coral-600" : "text-forest-700"}`}>
                  {pwdMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={pwdLoading}
                className="btn-primary px-5 py-2.5"
              >
                {pwdLoading ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>

          {/* Email */}
          <div className="card p-6 mb-6">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-1">Change email</h2>
            <p className="text-sm text-ink-500 mb-5">We'll use this email for account recovery and notifications.</p>

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">New email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Confirm with current password</label>
                <input
                  type="password"
                  value={emailPwd}
                  onChange={(e) => setEmailPwd(e.target.value)}
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>

              {emailMsg.text && (
                <p className={`text-sm ${emailMsg.type === "error" ? "text-coral-600" : "text-forest-700"}`}>
                  {emailMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="btn-primary px-5 py-2.5"
              >
                {emailLoading ? "Updating…" : "Update email"}
              </button>
            </form>
          </div>

          {/* Danger / session */}
          <div className="card p-6 border-coral-100 bg-coral-50/40">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-1">Session</h2>
            <p className="text-sm text-ink-500 mb-4">Sign out of this device.</p>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="bg-coral-600 hover:bg-coral-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Log out
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
