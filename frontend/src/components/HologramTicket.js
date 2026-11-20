"use client";

import React, { useState, useRef } from "react";

/**
 * ENHANCED 3D HOLOGRAPHIC VIP TICKET PASS
 * Dual-sided 3D flip card, laser scanning sweep, dynamic holographic foil shaders,
 * animated QR telemetry, and interactive audio-visual pulse.
 */
export default function HologramTicket({
  eventTitle = "LOCKONCE MEGA CYBER ARENA",
  date = "DEC 12, 2026 • 08:00 PM",
  venue = "LockOnce Mega Cyber Arena • New Delhi",
  seatCode = "VIP-A • CHAIR 04, 05",
  tier = "DIAMOND QUANTUM PASS",
  price = "₹2,499",
  attendeeName = "JAGRIT DHIMAN",
  verificationCode = "LOCK-QC-8F32A9B4C7",
  verified = true,
  checkedIn = false,
  bookingId = null,
  onVerifyClick = null
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(verified);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -16;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 20;

    setTilt({ rx, ry, px, py });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 380);
  };

  const handleVerify = async (e) => {
    e.stopPropagation();
    if (onVerifyClick) {
      onVerifyClick();
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerifiedSuccess(true);
      triggerGlitch();
    }, 900);
  };

  return (
    <div className="hologram-projector-stage">
      {/* 3D Pedestal Base Emitter with Concentric Rotating Rings */}
      <div className="pedestal-base">
        <div className="pedestal-ring ring-outer"></div>
        <div className="pedestal-ring ring-middle"></div>
        <div className="pedestal-ring ring-core"></div>
        <div className="pedestal-beam-cone"></div>
      </div>

      {/* 3D Perspective Card Wrapper */}
      <div
        className={`hologram-tilt-viewport ${isGlitching ? "glitch-active" : ""} ${isFlipped ? "flipped" : ""}`}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={triggerGlitch}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry + (isFlipped ? 180 : 0)}deg) scale3d(1.02, 1.02, 1.02)`,
          "--hologram-x": `${tilt.px}%`,
          "--hologram-y": `${tilt.py}%`
        }}
      >
        {/* Holographic Rainbow Foil Sheen */}
        <div className="hologram-foil-sheen"></div>
        <div className="hologram-scan-lines"></div>
        <div className="laser-sweep-bar"></div>

        {/* FRONT FACE */}
        <div className="hologram-card-face face-front">
          <div className="holo-card-header">
            <div className="holo-brand">
              <span className="holo-icon">◈</span>
              <span>LOCK<span className="holo-glow-text">ONCE</span></span>
            </div>
            <span className="holo-badge">{tier}</span>
          </div>

          <div className="holo-watermark">
            <div className="watermark-circle"></div>
            <span className="watermark-symbol">✦</span>
          </div>

          <div className="holo-event-body">
            <div className="holo-live-tag">
              <span className="pulse-dot"></span> LIVE ARENA PASS • TOKEN #LK-9942
            </div>
            <h3 className="holo-title">{eventTitle}</h3>

            <div className="holo-meta-grid">
              <div>
                <small>DATE & TIME</small>
                <p>{date}</p>
              </div>
              <div>
                <small>VENUE</small>
                <p>{venue}</p>
              </div>
              <div>
                <small>SEATING MATRIX</small>
                <p className="holo-seat-highlight">{seatCode}</p>
              </div>
              <div>
                <small>PRICE TIER</small>
                <p className="holo-price-highlight">{price}</p>
              </div>
            </div>

            <div className="holo-perks-row">
              <span>✓ Express VIP Gate</span>
              <span>✓ Backstage Lounge</span>
              <span>✓ Best Sightline</span>
            </div>
          </div>

          {/* Ticket Perforation */}
          <div className="holo-perforation">
            <div className="perforated-notch notch-left"></div>
            <div className="perforated-line"></div>
            <div className="perforated-notch notch-right"></div>
          </div>

          <div className="holo-card-footer">
            <div className="holo-barcode">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div className="holo-telemetry">
              <span className="telemetry-lock">🔒 QUANTUM LOCKED</span>
              <button
                type="button"
                className="flip-ticket-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
              >
                ⟲ View Pass QR
              </button>
            </div>
          </div>
        </div>

        {/* BACK FACE (Encrypted QR Hologram Pass) */}
        <div className="hologram-card-face face-back">
          <div className="back-pass-header">
            <span className="back-lock-icon">🔒</span>
            <h4>VERIFIED DIGITAL PASS</h4>
            <small className="back-hash-text">CODE: {verificationCode}</small>
          </div>

          <div className="qr-hologram-box">
            <div className="qr-laser-scanner"></div>
            {/* Holographic QR visual */}
            <div className="qr-grid-art">
              <div className="qr-corner qr-tl"></div>
              <div className="qr-corner qr-tr"></div>
              <div className="qr-corner qr-bl"></div>
              <div className="qr-pixels">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <div className="back-pass-details">
            <p><strong>ATTENDEE:</strong> {attendeeName.toUpperCase()}</p>
            <p><strong>SECURITY:</strong> SHA-256 QUANTUM HASH</p>
            <p>
              <strong>STATUS:</strong>{" "}
              <span className={checkedIn ? "pass-status-used" : "pass-status-valid"}>
                {checkedIn ? "✓ CHECKED-IN" : "✦ VERIFIED & VALID"}
              </span>
            </p>
            {bookingId && <p><strong>BOOKING REF:</strong> #{bookingId}</p>}
          </div>

          <div className="back-action-buttons">
            <button
              type="button"
              className="verify-ticket-trigger-btn"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? "Verifying On-Chain..." : verifiedSuccess ? "✓ Authenticity Confirmed" : "Run Live Verification"}
            </button>

            <button
              type="button"
              className="flip-ticket-btn back-flip-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              ← Flip to Front
            </button>
          </div>
        </div>
      </div>

      {/* Floating Satellites with Real-Time Telemetry */}
      <div className="holo-satellite satellite-1">
        <span>⌖ 3D MEGA ARENA VERIFIED</span>
      </div>
      <div className="holo-satellite satellite-2">
        <span>✦ 5-MIN LOCK ACTIVATED</span>
      </div>
    </div>
  );
}
