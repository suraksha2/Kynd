"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailUsers: false,
    smsAlerts: true,
    weeklyReport: true,
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
    }
  }, [user]);

  async function handleSaveProfile() {
    if (!user) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: profile.name,
          email: profile.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!user) return;
    setPasswordError("");
    setPasswordSuccess("");

    if (password.new !== password.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (password.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Password changed successfully");
        setPassword({ current: "", new: "", confirm: "" });
        setTimeout(() => setPasswordSuccess(""), 3000);
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (err) {
      setPasswordError("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Profile Settings</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={profile.role}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Notifications</h2>
        <div className="space-y-4">
          {[
            { key: "emailOrders", label: "Email on new orders", desc: "Receive an email whenever a new order is placed." },
            { key: "emailUsers", label: "Email on new user registrations", desc: "Get notified when a new user signs up." },
            { key: "smsAlerts", label: "SMS alerts for critical events", desc: "Receive SMS for system alerts." },
            { key: "weeklyReport", label: "Weekly summary report", desc: "Get a weekly analytics digest every Monday." },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={notifications[key as keyof typeof notifications]}
                onClick={() =>
                  setNotifications((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof notifications],
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  notifications[key as keyof typeof notifications]
                    ? "bg-indigo-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifications[key as keyof typeof notifications] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Change Password</h2>
        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm text-red-700">{passwordError}</span>
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-700">{passwordSuccess}</span>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={password.current}
              onChange={(e) => setPassword({ ...password, current: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          Sign Out
        </button>
        <button
          onClick={handleSaveProfile}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          <Save size={15} />
          {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
