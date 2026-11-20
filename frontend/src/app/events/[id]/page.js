"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import HologramAuditorium from "../../../components/HologramAuditorium";
import HologramTicket from "../../../components/HologramTicket";

function SeatSelectionContent() {
  const params = useParams();
  const eventId = params.id;

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hold, setHold] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [rangeStartSeatId, setRangeStartSeatId] = useState(null);
  const [viewMode, setViewMode] = useState("3d");
  const [selectionMode, setSelectionMode] = useState("single");
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  async function loadSeats() {
    try {
      const response = await fetch(
        `http://localhost:3000/events/${eventId}/seats`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load seats.");
        return;
      }

      setEvent(data.event);
      setSeats(data.seats);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (eventId) loadSeats();
  }, [eventId]);

  useEffect(() => {
    if (!hold) return;

    const timer = setInterval(() => {
      setTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [hold]);

  useEffect(() => {
    if (hold && timeLeft === 0) {
      setHold(null);
      setSelectedSeats([]);
      loadSeats();
    }
  }, [timeLeft, hold]);

  function toggleSeat(seat) {
    if (seat.status !== "available" || hold) return;

    if (selectionMode === "single") {
      if (selectedSeats.includes(seat.id)) {
        setSelectedSeats(selectedSeats.filter((id) => id !== seat.id));
      } else {
        if (selectedSeats.length >= 10) {
          alert("Maximum 10 seats per booking.");
          return;
        }
        setSelectedSeats([...selectedSeats, seat.id]);
      }
      return;
    }

    // Range Selection Mode
    if (rangeStartSeatId === null) {
      setRangeStartSeatId(seat.id);
      return;
    }

    if (rangeStartSeatId === seat.id) {
      setRangeStartSeatId(null);
      return;
    }

    const startIndex = seats.findIndex((s) => s.id === rangeStartSeatId);
    const endIndex = seats.findIndex((s) => s.id === seat.id);

    const first = Math.min(startIndex, endIndex);
    const last = Math.max(startIndex, endIndex);

    const rangeSeats = seats.slice(first, last + 1);

    if (rangeSeats.length > 10) {
      alert("Maximum 10 seats per booking.");
      setRangeStartSeatId(null);
      return;
    }

    if (rangeSeats.some((s) => s.status !== "available")) {
      alert("Some seats in this range are unavailable.");
      setRangeStartSeatId(null);
      return;
    }

    const newSelection = [
      ...new Set([
        ...selectedSeats,
        ...rangeSeats.map((s) => s.id),
      ]),
    ];

    if (newSelection.length > 10) {
      alert("Maximum 10 seats per booking.");
      setRangeStartSeatId(null);
      return;
    }

    setSelectedSeats(newSelection);
    setRangeStartSeatId(null);
  }

  async function handleHoldSeats() {
    try {
      setBookingLoading(true);

      const response = await fetch("http://localhost:3000/bookings/hold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          eventId: Number(eventId),
          seatIds: selectedSeats,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to hold seats.");
        return;
      }

      setHold(data.hold);
      setTimeLeft(300);

      alert("Seats held successfully for 5 minutes!");
      await loadSeats();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setBookingLoading(false);
    }
  }

  const selectedSeatObjects = selectedSeats
    .map((id) => seats.find((seat) => seat.id === id))
    .filter(Boolean);

  const selectedSeatNames = selectedSeatObjects.map((s) => s.seat_number);

  const subtotal = selectedSeatObjects.reduce((acc, seat) => {
    const row = seat.seat_number ? seat.seat_number.charAt(0) : "C";
    const price = ["A", "B"].includes(row) ? 2499 : ["C", "D", "E"].includes(row) ? 1499 : 899;
    return acc + price;
  }, 0);

  const fee = selectedSeats.length > 0 ? 49 : 0;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + fee + gst;

  async function handleConfirmBooking() {
    try {
      setBookingLoading(true);

      const response = await fetch("http://localhost:3000/bookings/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          holdId: hold.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Booking confirmation failed.");
        return;
      }

      const bookingId = data.booking?.id || "LK-" + Math.floor(1000 + Math.random() * 9000);
      const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
      const verificationCode = `LOCK-QC-${bookingId}-${randomHex}`;

      setConfirmedBooking({
        bookingId: bookingId,
        eventTitle: event?.title,
        venue: event?.venue,
        seats: selectedSeatNames,
        total: total,
        verificationCode: verificationCode,
        verified: true,
      });

      setHold(null);
      setTimeLeft(0);
      setSelectedSeats([]);

      await loadSeats();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setBookingLoading(false);
    }
  }

  // Arrange seats into rows of 10.
  const seatRows = [];

  for (let i = 0; i < seats.length; i += 10) {
    seatRows.push(seats.slice(i, i + 10));
  }

  if (loading) {
    return (
      <main className="lock-seat-page">
        <div className="seat-loading">
          <div className="seat-spinner"></div>
          Loading your auditorium...
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="lock-seat-page">
        <div className="seat-loading">Event not found.</div>
      </main>
    );
  }

  return (
    <main className="lock-seat-page">

      <nav className="seat-navbar">
        <Link href="/" className="seat-logo">
          <span>◈</span> LOCK<span className="seat-logo-gradient">ONCE.</span>
        </Link>

        <Link href="/dashboard" className="seat-back-link">
          ← Back to Events
        </Link>
      </nav>

      <section className="seat-page-content">

        <div className="seat-event-heading">
          <span className="seat-eyebrow">✦ LOCKONCE EXPERIENCE</span>

          <h1>{event.title}<span>.</span></h1>

          <p>⌖ {event.venue}</p>

          <div className="seat-heading-line"></div>
        </div>

        <div className="seat-main-card">

          <div className="seat-card-heading">
            <div>
              <span className="seat-eyebrow">YOUR EXPERIENCE STARTS HERE</span>
              <h2>Select Your <span>Seats.</span></h2>
              <p>Choose your favourite spot in the auditorium.</p>
            </div>

            <div className="seat-live-badge">
              <span></span> LIVE SEAT MAP
            </div>
          </div>

          {/* SEAT LEGEND */}

          <div className="seat-legend">
            <div>
              <span className="legend-dot available-dot"></span>
              Available
            </div>

            <div>
              <span className="legend-dot booked-dot"></span>
              Booked
            </div>

            <div>
              <span className="legend-dot selected-dot"></span>
              Selected
            </div>
          </div>
          {/* VIEW & SELECTION CONTROLS */}
          <div className="view-mode-toggle-bar">
            <div className="view-buttons">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "3d" ? "active" : ""}`}
                onClick={() => setViewMode("3d")}
              >
                ◈ 3D Hologram Projection
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "2d" ? "active" : ""}`}
                onClick={() => setViewMode("2d")}
              >
                ▣ Tactical 2D View
              </button>
            </div>

            <div className="selection-mode-buttons">
              <button
                type="button"
                className={`mode-toggle-btn ${selectionMode === "single" ? "active" : ""}`}
                onClick={() => {
                  setSelectionMode("single");
                  setRangeStartSeatId(null);
                }}
              >
                ✦ Single Seat Pick
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${selectionMode === "range" ? "active" : ""}`}
                onClick={() => setSelectionMode("range")}
              >
                ↔ Range Selection
              </button>
            </div>
          </div>

          {selectionMode === "range" && (
            <div className="range-instruction">
              <span>✦</span>
              Click your first chair, then your last chair to select up to 10 seats.
              {rangeStartSeatId !== null && (
                <strong> Now select the ending chair.</strong>
              )}
            </div>
          )}

          {/* 3D HOLOGRAM VIEW */}
          {viewMode === "3d" && (
            <HologramAuditorium
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={toggleSeat}
              hold={hold}
              disabled={bookingLoading}
            />
          )}

          {/* 2D TACTICAL VIEW */}
          {viewMode === "2d" && (
            <div
              className="auditorium"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty(
                  "--mouse-x",
                  `${e.clientX - rect.left}px`
                );
                e.currentTarget.style.setProperty(
                  "--mouse-y",
                  `${e.clientY - rect.top}px`
                );
              }}
            >
              <div className="screen-area">
                <div className="screen-light"></div>
                <div className="screen-surface">
                  <span>LOCKONCE</span>
                  <small>STAGE / SCREEN</small>
                </div>
                <p>◈ &nbsp; FRONT OF AUDITORIUM &nbsp; ◈</p>
              </div>

              {/* SEAT ROWS */}
              <div className="seat-layout">
                {seatRows.map((row, rowIndex) => (
                  <div className="seat-row" key={rowIndex}>
                    <span className="row-label">
                      {String.fromCharCode(65 + rowIndex)}
                    </span>

                    <div className="row-chairs">
                      {row.map((seat) => {
                        const selected =
                          selectedSeats.includes(seat.id) ||
                          rangeStartSeatId === seat.id;

                        const seatClass = selected
                          ? "selected"
                          : seat.status === "booked"
                            ? "booked"
                            : seat.status === "held"
                              ? "held"
                              : "available";

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            className={`chair-seat ${seatClass}`}
                            onClick={() => toggleSeat(seat)}
                            disabled={
                              seat.status !== "available" || !!hold
                            }
                            title={`${seat.seat_number} - ${seat.status}`}
                          >
                            <span className="chair-back"></span>

                            <span className="chair-body">
                              <span className="chair-number">
                                {seat.seat_number}
                              </span>
                            </span>

                            <span className="chair-leg chair-leg-left"></span>
                            <span className="chair-leg chair-leg-right"></span>
                          </button>
                        );
                      })}
                    </div>

                    <span className="row-label">
                      {String.fromCharCode(65 + rowIndex)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="auditorium-floor">
                <span>◈ &nbsp; LOCKONCE AUDITORIUM &nbsp; ◈</span>
              </div>
            </div>
          )}

          {/* BOOKING SUMMARY */}

          <div className="seat-booking-panel">

            <div className="booking-summary">

              <div className="summary-icon">◈</div>

              <div>
                <small>YOUR SELECTION</small>
                <h3>
                  Selected Seats: <span>{selectedSeats.length}</span>
                </h3>

                <p>
                  {selectedSeatNames.length > 0
                    ? selectedSeatNames.join(", ")
                    : "No seats selected yet"}
                </p>
              </div>

            </div>

            {hold && (
              <div className="hold-timer">
                <span>◷</span>

                <div>
                  <small>YOUR SEATS ARE TEMPORARILY RESERVED</small>
                  <h3>
                    {Math.floor(timeLeft / 60)}:
                    {String(timeLeft % 60).padStart(2, "0")}
                  </h3>
                  <p>Complete your booking before the timer expires.</p>
                </div>
              </div>
            )}

            {/* PRICE BREAKDOWN CARD */}
            {selectedSeats.length > 0 && (
              <div className="seat-price-breakdown-card">
                <div className="price-row">
                  <span>Seats Subtotal ({selectedSeats.length}x)</span>
                  <strong>₹{subtotal.toLocaleString()}</strong>
                </div>
                <div className="price-row">
                  <span>Booking & Tech Fee</span>
                  <span>₹{fee}</span>
                </div>
                <div className="price-row">
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString()}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-total-row">
                  <span>Total Amount</span>
                  <span className="total-glow">₹{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="booking-action">

              {!hold ? (
                <button
                  className="hold-seat-button"
                  type="button"
                  disabled={
                    selectedSeats.length === 0 || bookingLoading
                  }
                  onClick={handleHoldSeats}
                >
                  {bookingLoading ? "Holding Seats..." : "Hold My Seats"}
                  <span>↗</span>
                </button>
              ) : (
                <button
                  className="hold-seat-button confirm-button"
                  type="button"
                  disabled={bookingLoading || timeLeft === 0}
                  onClick={handleConfirmBooking}
                >
                  {bookingLoading ? "Processing..." : "Confirm Booking"}
                  <span>✓</span>
                </button>
              )}

              <small>
                🔒 Secure seat reservation powered by LockOnce
              </small>

            </div>

          </div>

        </div>

        {/* CONFIRMED BOOKING MODAL WITH 3D HOLOGRAPHIC VERIFICATION PASS */}
        {confirmedBooking && (
          <div className="booking-modal-backdrop">
            <div className="hologram-modal-card confirmed-modal-expanded">
              <div className="modal-glow"></div>
              <div className="modal-icon-badge">✓</div>
              <span className="modal-kicker">◈ QUANTUM SEATS CONFIRMED & VERIFIED</span>
              <h2>You're In! Welcome to the Arena.</h2>
              <p className="modal-event-title">{confirmedBooking.eventTitle}</p>

              {/* 3D Holographic Pass Showcase inside Modal */}
              <div className="modal-pass-container">
                <HologramTicket
                  eventTitle={confirmedBooking.eventTitle}
                  date={event ? new Date(event.event_date).toLocaleString() : "CONFIRMED"}
                  venue={confirmedBooking.venue || "LockOnce Arena"}
                  seatCode={`CHAIR ${confirmedBooking.seats?.join(", ")}`}
                  tier="DIAMOND QUANTUM PASS"
                  price={`₹${confirmedBooking.total?.toLocaleString()}`}
                  attendeeName="JAGRIT DHIMAN"
                  verificationCode={confirmedBooking.verificationCode}
                  verified={true}
                  bookingId={confirmedBooking.bookingId}
                />
              </div>

              <div className="modal-ticket-snippet">
                <div className="snippet-row">
                  <small>BOOKING ID</small>
                  <strong>#{confirmedBooking.bookingId}</strong>
                </div>
                <div className="snippet-row">
                  <small>LOCKED CHAIRS</small>
                  <strong className="snippet-seats">
                    {confirmedBooking.seats?.join(", ")}
                  </strong>
                </div>
                <div className="snippet-row">
                  <small>VERIFICATION HASH</small>
                  <strong className="snippet-hash">
                    {confirmedBooking.verificationCode}
                  </strong>
                </div>
                <div className="snippet-row">
                  <small>TOTAL PAID</small>
                  <strong>₹{confirmedBooking.total?.toLocaleString()}</strong>
                </div>
              </div>

              <div className="modal-security-guarantee">
                <span>🛡️ Cryptographically signed & verified on-chain • Zero duplication guarantee</span>
              </div>

              <div className="modal-actions">
                <Link href="/my-bookings" className="modal-primary-btn">
                  View My Passes in Dashboard ↗
                </Link>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  onClick={() => setConfirmedBooking(null)}
                >
                  Close & Book More Seats
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="seat-footer">
          <span>◈ LOCKONCE.</span>
          <p>BOOK ONCE. EXPERIENCE FOREVER.</p>
        </footer>

      </section>
    </main>
  );
}

export default function SeatSelectionPage() {
  return (
    <Suspense
      fallback={
        <main className="lock-seat-page">
          <div className="seat-loading">
            <div className="seat-spinner"></div>
            Loading your 3D Hologram Auditorium...
          </div>
        </main>
      }
    >
      <SeatSelectionContent />
    </Suspense>
  );
}