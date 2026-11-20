
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      alert("Login successful!");
      if (data.user?.role === "organizer") {
        window.location.href = "/organizer";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <div className="auth-background-glow"></div>

      <Link href="/" className="auth-back-link">
        ← Back to Home
      </Link>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">◈</span>
          <span>LOCK</span>
          <span className="auth-brand-gradient">ONCE.</span>
        </div>

        <p className="auth-tagline">
          BOOK ONCE. EXPERIENCE FOREVER.
        </p>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME TO LOCKONCE</span>

          <h1>Welcome <span>Back.</span></h1>

          <p>
            Login to continue your booking journey and discover
            unforgettable experiences.
          </p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="login-email">Email Address</label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="login-password">Password</label>

            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login to LockOnce"}
            <span>↗</span>
          </button>
        </form>

        <div className="auth-divider">
          <span></span>
          <small>NEW TO LOCKONCE?</small>
          <span></span>
        </div>

        <p className="auth-login-link">
          Don't have an account? <Link href="/register">Register here ↗</Link>
        </p>

        <div className="auth-footer">
          <span>🔒 Secure Login</span>
          <span>✦ Your experience awaits</span>
        </div>
      </div>
    </main>
  );
}
