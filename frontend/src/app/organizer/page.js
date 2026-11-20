"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function OrganizerDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [totalSeats, setTotalSeats] = useState(70);
  const [category, setCategory] = useState("MUSIC");
  const [loading, setLoading] = useState(false);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Quick Turnstile Check-In state
  const [checkInBookingId, setCheckInBookingId] = useState("");
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Search & Filter
  const [filterQuery, setFilterQuery] = useState("");

  // Load organizer's events
  async function loadEvents() {
    try {
      const response = await fetch(
        "http://localhost:3000/events/my-events",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not load events.");
        return;
      }

      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (error) {
      console.error(error);
      alert("Unable to load events.");
    } finally {
      setEventsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Create a new event
  async function createEvent(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          venue,
          eventDate,
          totalSeats: Number(totalSeats),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not create event.");
        return;
      }

      alert("🎉 3D Arena & Event Created Successfully!");

      setTitle("");
      setDescription("");
      setVenue("");
      setEventDate("");
      setTotalSeats(70);

      // Refresh event list
      await loadEvents();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Publish an event
  async function publishEvent(eventId) {
    const confirmPublish = window.confirm(
      "Are you sure you want to publish this event to the live 3D Arena catalog?"
    );

    if (!confirmPublish) return;

    try {
      const response = await fetch(
        `http://localhost:3000/events/${eventId}/publish`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not publish event.");
        return;
      }

      alert("✓ Event published live!");
      await loadEvents();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    }
  }

  // Instant Check-In Scanner
  async function handleQuickCheckIn(e) {
    e.preventDefault();
    if (!checkInBookingId.trim()) return;

    setCheckInLoading(true);
    setCheckInStatus(null);

    const cleanId = checkInBookingId.replace(/\D/g, "");

    try {
      const response = await fetch("http://localhost:3000/bookings/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: Number(cleanId) }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCheckInStatus({ success: false, message: data.message || "Check-in failed" });
      } else {
        setCheckInStatus({ success: true, message: `✓ Booking #${cleanId} Checked In Successfully!` });
        setCheckInBookingId("");
      }
    } catch (err) {
      setCheckInStatus({ success: false, message: "Server connection failed" });
    } finally {
      setCheckInLoading(false);
    }
  }

  const filteredEvents = useMemo(() => {
    if (!filterQuery.trim()) return events;
    const q = filterQuery.toLowerCase();
    return events.filter(
      (ev) =>
        ev.title?.toLowerCase().includes(q) ||
        ev.venue?.toLowerCase().includes(q) ||
        ev.status?.toLowerCase().includes(q)
    );
  }, [events, filterQuery]);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === "published").length;
    const draft = events.filter((e) => e.status === "draft").length;
    const chairs = total * 70;
    return { total, published, draft, chairs };
  }, [events]);

  return (
    <main className="organizer-cyber-page">
      <div className="dashboard-glow dashboard-glow-one"></div>
      <div className="dashboard-glow dashboard-glow-two"></div>

      {/* NAVBAR */}
      <nav className="organizer-navbar">
        <Link href="/" className="organizer-logo">
          <span className="organizer-icon">◈</span>
          <span>SEAT</span>
          <span className="organizer-logo-gradient">LOCK.</span>
        </Link>

        <div className="organizer-nav-actions">
          <span className="portal-badge organizer-portal-badge">
            ✦ ORGANIZER MISSION CONTROL
          </span>
          <Link href="/organizer/attendees" className="organizer-nav-link">
            👥 Attendees & Scanner
          </Link>
          <Link href="/dashboard" className="organizer-nav-link">
            🎟️ Student View
          </Link>
          <Link href="/" className="organizer-home-btn">
            ⌂ Home
          </Link>
        </div>
      </nav>

      <section className="organizer-container">
        {/* HERO TITLE */}
        <div className="organizer-header">
          <span className="organizer-kicker">◈ HIGH-CONCURRENCY ARENA ORCHESTRATION</span>
          <h1>
            Manage Your <span>Arenas & Events.</span>
          </h1>
          <p>
            Deploy 3D holographic seating matrices, monitor real-time seat locks,
            and verify cryptographic ticket hashes at venue turnstiles.
          </p>
          <div className="organizer-header-divider"></div>
        </div>

        {/* TELEMETRY METRIC STATS */}
        <div className="organizer-stats-grid">
          <div className="org-stat-card">
            <span className="stat-label">TOTAL ARENAS</span>
            <h2>{stats.total}</h2>
            <small>Events Orchestrated</small>
          </div>
          <div className="org-stat-card">
            <span className="stat-label">PUBLISHED LIVE</span>
            <h2 className="stat-published">{stats.published}</h2>
            <small>Active in 3D Catalog</small>
          </div>
          <div className="org-stat-card">
            <span className="stat-label">DRAFT MATRICES</span>
            <h2 className="stat-draft">{stats.draft}</h2>
            <small>Ready for Deployment</small>
          </div>
          <div className="org-stat-card">
            <span className="stat-label">MANAGED CHAIRS</span>
            <h2 className="stat-chairs">~{stats.chairs.toLocaleString()}</h2>
            <small>Multi-Tier Hologram Seats</small>
          </div>
        </div>

        {/* TWO-COLUMN WORKSPACE: CREATE EVENT + QUICK TURNSTILE */}
        <div className="organizer-two-column-layout">
          {/* CREATE ARENA FORM */}
          <div className="organizer-card create-arena-card">
            <div className="card-top-header">
              <span className="card-icon">🏗️</span>
              <div>
                <h2>Deploy New 3D Arena</h2>
                <p>Configure seating geometry and lock parameters</p>
              </div>
            </div>

            <form onSubmit={createEvent} className="organizer-form">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. ULTRA SUNSET LIVE ARENA TOUR 2027"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="org-select"
                  >
                    <option value="MUSIC">🎵 Music & Concert</option>
                    <option value="COMEDY">😂 Standup & Comedy</option>
                    <option value="SPORTS">🏏 Stadium & Sports</option>
                    <option value="TECHNOLOGY">🤖 Tech & AI Summit</option>
                    <option value="ARTS">🔮 Digital Arts & Visuals</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Total Seats</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Quick Preset Buttons for Seats */}
              <div className="seat-preset-chips">
                <span className="preset-label">PRESETS:</span>
                {[50, 70, 100, 150].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`preset-btn ${Number(totalSeats) === num ? "active" : ""}`}
                    onClick={() => setTotalSeats(num)}
                  >
                    {num} Seats {num === 70 ? "(Mega Arena)" : ""}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. LockOnce Mega Cyber Arena, New Delhi"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Event Date & Showtime</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Event Description & Perks</label>
                <textarea
                  rows="3"
                  placeholder="Describe your event, stage laser setup, sound system, and VIP perks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Seating Tier Visual Preview */}
              <div className="tier-preview-banner">
                <span className="preview-title">◈ SEAT MATRIX GEOMETRY:</span>
                <div className="tier-chips">
                  <span className="tier-chip vip">VIP Floor (Rows A-B)</span>
                  <span className="tier-chip stalls">Club Stalls (Rows C-E)</span>
                  <span className="tier-chip balcony">Cyber Balcony (Rows F-G)</span>
                </div>
              </div>

              <button
                type="submit"
                className="organizer-submit-btn"
                disabled={loading}
              >
                {loading ? "Deploying Arena..." : "Deploy 3D Arena to Database →"}
              </button>
            </form>
          </div>

          {/* SIDEBAR: TURNSTILE CHECK-IN SCANNER + QUICK TELEMETRY */}
          <div className="organizer-sidebar-column">
            {/* Quick Turnstile Scanner */}
            <div className="organizer-card turnstile-scanner-card">
              <div className="card-top-header">
                <span className="card-icon">⚡</span>
                <div>
                  <h2>Turnstile Check-In Scanner</h2>
                  <p>Admit attendees & verify digital QR codes</p>
                </div>
              </div>

              <form onSubmit={handleQuickCheckIn} className="scanner-form">
                <div className="form-group">
                  <label>Booking ID or Scan Code</label>
                  <div className="scanner-input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. 15 or 16"
                      value={checkInBookingId}
                      onChange={(e) => setCheckInBookingId(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="scanner-go-btn"
                      disabled={checkInLoading}
                    >
                      {checkInLoading ? "Verifying..." : "Admit ✓"}
                    </button>
                  </div>
                </div>
              </form>

              {checkInStatus && (
                <div
                  className={`scanner-result ${
                    checkInStatus.success ? "success" : "error"
                  }`}
                >
                  <p>{checkInStatus.message}</p>
                </div>
              )}

              <div className="scanner-quick-links">
                <Link href="/organizer/attendees" className="scanner-attendee-link">
                  Open Full Attendee Verification Table →
                </Link>
              </div>
            </div>

            {/* Protocol Security Summary */}
            <div className="organizer-card protocol-card">
              <h3>◈ Concurrency Security Status</h3>
              <ul className="protocol-checklist">
                <li>✓ PostgreSQL Row-Level Locking (`FOR UPDATE`)</li>
                <li>✓ 300s TTL Temporary Hold Concurrency</li>
                <li>✓ Cryptographic SHA-256 Pass Signatures</li>
                <li>✓ Anti-Double Booking Serialization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* YOUR ARENAS & EVENTS LIST */}
        <div className="organizer-events-section">
          <div className="events-section-header">
            <div>
              <span className="section-eyebrow">ACTIVE CATALOG</span>
              <h2>Your Managed Arenas <span>({filteredEvents.length})</span></h2>
            </div>

            {/* Search Filter Box */}
            <div className="org-search-box">
              <span className="search-icon">⌕</span>
              <input
                type="search"
                placeholder="Filter by title, venue, or status..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>
          </div>

          {eventsLoading ? (
            <div className="organizer-loading-box">
              <div className="loading-spinner"></div>
              <p>Fetching active arenas from PostgreSQL ledger...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="organizer-empty-box">
              <span className="empty-symbol">◈</span>
              <h3>No events found</h3>
              <p>Create your first 3D event using the arena creator above.</p>
            </div>
          ) : (
            <div className="organizer-event-grid">
              {filteredEvents.map((event) => (
                <article className="org-event-card" key={event.id}>
                  <div className="org-event-top">
                    <span
                      className={`org-status-badge ${
                        event.status === "published"
                          ? "status-published"
                          : "status-draft"
                      }`}
                    >
                      {event.status === "published" ? "● PUBLISHED & LIVE" : "● DRAFT MATRIX"}
                    </span>
                    <span className="org-event-id">ARENA #{event.id}</span>
                  </div>

                  <div className="org-event-body">
                    <h3>{event.title}</h3>
                    <p className="org-event-desc">{event.description}</p>

                    <div className="org-event-meta">
                      <div className="meta-item">
                        <small>VENUE</small>
                        <p>⌖ {event.venue}</p>
                      </div>
                      <div className="meta-item">
                        <small>SHOWTIME</small>
                        <p>◷ {new Date(event.event_date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="org-event-actions">
                    <Link
                      href={`/events/${event.id}`}
                      className="org-action-btn view-arena-btn"
                    >
                      <span>Enter 3D Arena</span>
                      <span>↗</span>
                    </Link>

                    <Link
                      href={`/organizer/attendees?eventId=${event.id}`}
                      className="org-action-btn attendees-btn"
                    >
                      <span>Attendees</span>
                      <span>👥</span>
                    </Link>

                    {event.status === "draft" && (
                      <button
                        type="button"
                        className="org-action-btn publish-btn"
                        onClick={() => publishEvent(event.id)}
                      >
                        <span>Publish Live</span>
                        <span>⚡</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="organizer-footer">
        <p>SEATLOCK™ • LOCKONCE CONCURRENCY ENGINE © 2026 — ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}
