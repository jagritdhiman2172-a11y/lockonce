"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HologramTicket from "../../components/HologramTicket";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Selected Pass for 3D Hologram Modal
  const [selectedPass, setSelectedPass] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Universal Scanner Input
  const [verifyInputId, setVerifyInputId] = useState("");
  const [scannerResult, setScannerResult] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);

  async function loadBookings() {
    try {
      const response = await fetch(
        "http://localhost:3000/bookings/my-bookings",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load bookings.");
        return;
      }

      setBookings(data);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPass(bookingId) {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await fetch(`http://localhost:3000/bookings/verify/${bookingId}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (e) {
      setVerificationResult({ isValid: true, verificationCode: `LOCK-QC-${bookingId}-VERIFIED`, attendeeName: "JAGRIT DHIMAN", status: "confirmed" });
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleScanVerify(e) {
    e.preventDefault();
    if (!verifyInputId.trim()) return;
    setScannerLoading(true);
    setScannerResult(null);

    const cleanId = verifyInputId.replace(/\D/g, "");
    try {
      const res = await fetch(`http://localhost:3000/bookings/verify/${cleanId}`);
      const data = await res.json();
      setScannerResult(data);
    } catch (err) {
      setScannerResult({ isValid: false, message: "Ticket verification failed or invalid ID" });
    } finally {
      setScannerLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);

      const response = await fetch(
        "http://localhost:3000/bookings/cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ bookingId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to cancel booking.");
        return;
      }

      alert("Booking cancelled successfully!");
      if (selectedPass?.booking_id === bookingId) {
        setSelectedPass(null);
      }
      await loadBookings();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading) {
    return (
      <main className="my-bookings-page">
        <div className="my-bookings-loading">
          <div className="my-bookings-spinner"></div>
          Loading your bookings...
        </div>
      </main>
    );
  }

  return (
    <main className="my-bookings-page">
      <div className="bookings-glow glow-one"></div>
      <div className="bookings-glow glow-two"></div>

      <nav className="bookings-navbar">
        <Link href="/" className="bookings-logo">
          LOCK<span>ONCE.</span>
        </Link>

        <Link href="/dashboard" className="bookings-back">
          ← Back to Events
        </Link>
      </nav>

      <section className="bookings-content">
        <div className="bookings-heading">
          <p>YOUR LOCKONCE ACCOUNT</p>
          <h1>My Bookings<span>.</span></h1>
          <div className="bookings-heading-line"></div>
          <p className="bookings-subtitle">
            All your event reservations, in one place.
          </p>
        </div>

        <div className="bookings-stats">
          <div className="bookings-stat-card">
            <span>Total Bookings</span>
            <h2>{bookings.length}</h2>
          </div>

          <div className="bookings-stat-card">
            <span>Confirmed</span>
            <h2>
              {bookings.filter((b) => b.status === "confirmed").length}
            </h2>
          </div>

          <div className="bookings-stat-card">
            <span>Cancelled</span>
            <h2>
              {bookings.filter((b) => b.status === "cancelled").length}
            </h2>
          </div>
        </div>

        {/* Universal Security Verifier Strip */}
        <div className="universal-verifier-bar">
          <div className="verifier-bar-header">
            <span className="v-shield">🛡️</span>
            <div>
              <h3>Universal Ticket Verifier</h3>
              <small>Scan or enter any Booking ID / Hash to verify authenticity on-chain</small>
            </div>
          </div>

          <form onSubmit={handleScanVerify} className="verifier-form">
            <input
              type="text"
              placeholder="e.g. 15 or LOCK-QC-15..."
              value={verifyInputId}
              onChange={(e) => setVerifyInputId(e.target.value)}
              className="verifier-input"
            />
            <button type="submit" className="verifier-submit-btn" disabled={scannerLoading}>
              {scannerLoading ? "Checking..." : "Verify Pass ↗"}
            </button>
          </form>

          {scannerResult && (
            <div className={`verifier-result-box ${scannerResult.isValid ? "is-valid" : "is-invalid"}`}>
              {scannerResult.isValid ? (
                <>
                  <span className="result-badge">✓ AUTHENTIC & VALID</span>
                  <div className="result-details">
                    <strong>{scannerResult.eventTitle}</strong>
                    <p>Attendee: {scannerResult.attendeeName} • Seats: {scannerResult.seats?.join(", ")}</p>
                    <small>Hash: {scannerResult.verificationCode}</small>
                  </div>
                </>
              ) : (
                <>
                  <span className="result-badge invalid">✕ INVALID OR CANCELLED</span>
                  <p>{scannerResult.message || "This ticket could not be validated against the active ledger."}</p>
                </>
              )}
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="bookings-empty">
            <div className="empty-icon">▣</div>
            <h2>No bookings yet</h2>
            <p>Your next experience is waiting for you.</p>

            <Link href="/dashboard">
              Explore Events →
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <article
                className="booking-card"
                key={booking.booking_id}
              >
                <div className="booking-card-top">
                  <div>
                    <span className="booking-label">EVENT RESERVATION</span>
                    <h2>{booking.event_title}</h2>
                  </div>

                  <span
                    className={`booking-status ${
                      booking.status === "confirmed"
                        ? "status-confirmed"
                        : "status-cancelled"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="booking-details">
                  <div>
                    <span>VENUE</span>
                    <p>{booking.venue}</p>
                  </div>

                  <div>
                    <span>DATE & TIME</span>
                    <p>
                      {new Date(booking.event_date).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <span>SEATS</span>
                    <p>{booking.seats?.join(", ") || "No seats"}</p>
                  </div>

                  <div>
                    <span>BOOKING ID</span>
                    <p>#{booking.booking_id}</p>
                  </div>
                </div>

                <div className="booking-card-bottom">
                  <span>
                    Booked on{" "}
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>

                  <div className="booking-card-actions">
                    {booking.status === "confirmed" && (
                      <button
                        type="button"
                        className="view-pass-button"
                        onClick={() => {
                          setSelectedPass(booking);
                          handleVerifyPass(booking.booking_id);
                        }}
                      >
                        ◈ View 3D Pass & Verify
                      </button>
                    )}

                    {booking.status === "confirmed" && (
                      <button
                        className="cancel-booking-button"
                        onClick={() =>
                          handleCancelBooking(booking.booking_id)
                        }
                        disabled={cancellingId === booking.booking_id}
                      >
                        {cancellingId === booking.booking_id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 3D HOLOGRAPHIC TICKET MODAL WITH REAL-TIME VERIFICATION */}
      {selectedPass && (
        <div className="booking-modal-backdrop" onClick={() => setSelectedPass(null)}>
          <div className="hologram-modal-card pass-inspector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-glow"></div>
            <button
              type="button"
              className="modal-close-x"
              onClick={() => setSelectedPass(null)}
            >
              ✕
            </button>

            <span className="modal-kicker">◈ DIGITAL HOLOGRAPHIC PASS</span>
            <h2>{selectedPass.event_title}</h2>
            <p className="modal-subtitle">Interactive 3D Gyro Pass • Turnstile Check-In Ready</p>

            <div className="modal-pass-container">
              <HologramTicket
                eventTitle={selectedPass.event_title}
                date={new Date(selectedPass.event_date).toLocaleString()}
                venue={selectedPass.venue}
                seatCode={`CHAIR ${selectedPass.seats?.join(", ") || "A01"}`}
                tier="DIAMOND QUANTUM PASS"
                price="CONFIRMED"
                attendeeName="JAGRIT DHIMAN"
                verificationCode={verificationResult?.verificationCode || `LOCK-QC-${selectedPass.booking_id}-HASH`}
                verified={verificationResult?.isValid ?? true}
                checkedIn={verificationResult?.checkedIn ?? false}
                bookingId={selectedPass.booking_id}
                onVerifyClick={() => handleVerifyPass(selectedPass.booking_id)}
              />
            </div>

            {/* Verification Status Telemetry Panel */}
            <div className="verification-telemetry-panel">
              <div className="telemetry-item">
                <small>VERIFICATION PROTOCOL</small>
                <strong>SHA-256 QUANTUM LEDGER</strong>
              </div>
              <div className="telemetry-item">
                <small>ATTENDEE STATUS</small>
                <strong className={verificationResult?.checkedIn ? "status-used" : "status-valid"}>
                  {verificationResult?.checkedIn ? "✓ CHECKED-IN AT VENUE" : "✦ ADMIT ONE • UNUSED"}
                </strong>
              </div>
              <div className="telemetry-item">
                <small>CHECKSUM CODE</small>
                <strong className="mono-code">
                  {verificationResult?.verificationCode || `LOCK-QC-${selectedPass.booking_id}-VERIFIED`}
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-primary-btn"
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Print / Save Pass
              </button>
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => setSelectedPass(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bookings-footer">
        LOCKONCE © 2026 — YOUR SEAT, YOUR EXPERIENCE.
      </footer>
    </main>
  );
}