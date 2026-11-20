"use client";

import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");
      window.location.href = "/login";
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
          <span className="auth-eyebrow">YOUR JOURNEY STARTS HERE</span>
          <h1>Create your <span>account.</span></h1>
          <p>
            Join LockOnce and make every event an unforgettable experience.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-input-group">
            <label>Select Account Type</label>
            <div className="hologram-role-selector">
              <button
                type="button"
                className={`role-choice ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                <span>🎓</span> Attendee / Student
              </button>
              <button
                type="button"
                className={`role-choice ${role === "organizer" ? "active" : ""}`}
                onClick={() => setRole("organizer")}
              >
                <span>🎪</span> Event Organizer
              </button>
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="register-password">Password</label>

            <div className="password-wrapper">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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
            {loading ? "Creating Account..." : "Create Account"}
            <span>↗</span>
          </button>
        </form>

        <div className="auth-divider">
          <span></span>
          <small>ALREADY A MEMBER?</small>
          <span></span>
        </div>

        <p className="auth-login-link">
          Already have an account? <Link href="/login">Login here ↗</Link>
        </p>

        <div className="auth-footer">
          <span>🔒 Secure registration</span>
          <span>✦ Your experience begins here</span>
        </div>
      </div>
    </main>
  );
}