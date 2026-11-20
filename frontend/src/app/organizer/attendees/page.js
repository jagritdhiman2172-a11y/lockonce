"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AttendeesContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get("eventId") || "";

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(initialEventId);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [checkInLoadingId, setCheckInLoadingId] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  async function loadEvents() {
    try {
      const response = await fetch(
        "http://localhost:3000/events/my-events",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to load events.");
        return;
      }

      const list = Array.isArray(data) ? data : data.events || [];
      setEvents(list);

      // Auto-select initial event if provided, else first event
      if (initialEventId) {
        setSelectedEvent(initialEventId);
        loadAttendees(initialEventId);
      } else if (list.length > 0) {
        setSelectedEvent(String(list[0].id));
        loadAttendees(String(list[0].id));
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendees(eventId) {
    if (!eventId) {
      setAttendees([]);
      return;
    }
    setSelectedEvent(String(eventId));
    setAttendeesLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/bookings/event/${eventId}/attendees`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        setAttendees([]);
        return;
      }

      setAttendees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  }

  async function handleCheckIn(bookingId) {
    setCheckInLoadingId(bookingId);
    try {
      const response = await fetch(
        "http://localhost:3000/bookings/check-in",
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
        alert(data.message || "Check-in failed");
        return;
      }

      alert("✓ Attendee Checked In Successfully!");
      await loadAttendees(selectedEvent);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to server.");
    } finally {
      setCheckInLoadingId(null);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredAttendees = useMemo(() => {
    if (!filterQuery.trim()) return attendees;
    const q = filterQuery.toLowerCase();
    return attendees.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        String(p.booking_id).includes(q) ||
        p.seats?.some((s) => s.toLowerCase().includes(q))
    );
  }, [attendees, filterQuery]);

  const stats = useMemo(() => {
    const total = attendees.length;
    const checkedIn = attendees.filter((a) => a.checked_in).length;
    const pending = total - checkedIn;
    return { total, checkedIn, pending };
  }, [attendees]);

  const currentEventObj = events.find((e) => String(e.id) === String(selectedEvent));

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
          <Link href="/organizer" className="organizer-nav-link">
            ← Back to Arenas
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
        {/* HEADER */}
        <div className="organizer-header">
          <span className="organizer-kicker">◈ GATE VERIFICATION & SCANNER</span>
          <h1>
            Attendee <span>Turnstile Management.</span>
          </h1>
          <p>
            Inspect registered guests, monitor gate arrivals in real time,
            and validate cryptographic holographic passes.
          </p>
          <div className="organizer-header-divider"></div>
        </div>

        {/* EVENT SELECTOR BAR */}
        <div className="attendee-selector-card">
          <div className="selector-left">
            <span className="sel-icon">🏟️</span>
            <div>
              <h3>Select Target Arena</h3>
              <p>Choose which event roster to inspect and verify</p>
            </div>
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => loadAttendees(e.target.value)}
            className="attendee-event-select"
          >
            <option value="">-- Choose an Event Arena --</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                #{ev.id} • {ev.title} ({ev.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* ATTENDEE METRIC CARDS */}
        {selectedEvent && (
          <div className="organizer-stats-grid">
            <div className="org-stat-card">
              <span className="stat-label">TOTAL BOOKINGS</span>
              <h2>{stats.total}</h2>
              <small>Confirmed Passes</small>
            </div>
            <div className="org-stat-card">
              <span className="stat-label">CHECKED IN</span>
              <h2 className="stat-published">{stats.checkedIn}</h2>
              <small>Admitted Through Turnstile</small>
            </div>
            <div className="org-stat-card">
              <span className="stat-label">PENDING ARRIVAL</span>
              <h2 className="stat-draft">{stats.pending}</h2>
              <small>Awaiting Venue Entry</small>
            </div>
            <div className="org-stat-card">
              <span className="stat-label">ARENA CAPACITY</span>
              <h2 className="stat-chairs">70 CHAIRS</h2>
              <small>Multi-Tier Hologram Hall</small>
            </div>
          </div>
        )}

        {/* ATTENDEE LIST */}
        {selectedEvent && (
          <div className="attendee-list-card">
            <div className="attendee-card-header">
              <div>
                <h2>
                  {currentEventObj?.title || "Event Roster"}
                </h2>
                <p>⌖ {currentEventObj?.venue} • ◷ {currentEventObj && new Date(currentEventObj.event_date).toLocaleString()}</p>
              </div>

              {/* Live search input */}
              <div className="org-search-box">
                <span className="search-icon">⌕</span>
                <input
                  type="search"
                  placeholder="Filter attendee by name, email, seat or booking ID..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
            </div>

            {attendeesLoading ? (
              <div className="organizer-loading-box">
                <div className="loading-spinner"></div>
                <p>Verifying ledger attendees...</p>
              </div>
            ) : filteredAttendees.length === 0 ? (
              <div className="organizer-empty-box">
                <span className="empty-symbol">▣</span>
                <h3>No Attendees Found</h3>
                <p>No confirmed reservations have been registered for this event yet.</p>
              </div>
            ) : (
              <div className="attendee-table-wrap">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>BOOKING ID</th>
                      <th>ATTENDEE</th>
                      <th>EMAIL</th>
                      <th>ASSIGNED CHAIRS</th>
                      <th>ENTRY STATUS</th>
                      <th>GATE ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.map((person) => (
                      <tr key={person.booking_id}>
                        <td>
                          <span className="booking-hash-pill">#{person.booking_id}</span>
                        </td>
                        <td>
                          <strong>{person.name}</strong>
                        </td>
                        <td>{person.email}</td>
                        <td>
                          <span className="seats-pill">
                            {person.seats?.join(", ") || "—"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`checkin-status-badge ${
                              person.checked_in ? "admitted" : "pending"
                            }`}
                          >
                            {person.checked_in ? "✓ ADMITTED" : "⏳ PENDING"}
                          </span>
                        </td>
                        <td>
                          {person.checked_in ? (
                            <span className="gate-cleared-text">✓ Turnstile Cleared</span>
                          ) : (
                            <button
                              type="button"
                              className="checkin-gate-btn"
                              onClick={() => handleCheckIn(person.booking_id)}
                              disabled={checkInLoadingId === person.booking_id}
                            >
                              {checkInLoadingId === person.booking_id
                                ? "Admitting..."
                                : "Admit Guest ⚡"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="organizer-footer">
        <p>SEATLOCK™ • LOCKONCE CONCURRENCY ENGINE © 2026 — ALL RIGHTS RESERVED.</p>
      </footer>
    </main>
  );
}

export default function AttendeesPage() {
  return (
    <Suspense fallback={<div className="organizer-loading-box">Loading...</div>}>
      <AttendeesContent />
    </Suspense>
  );
}
