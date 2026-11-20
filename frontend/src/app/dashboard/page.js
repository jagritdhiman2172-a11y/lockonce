"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("http://localhost:3000/events", {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load events.");
          return;
        }

        setEvents(Array.isArray(data) ? data : data.events || []);
      } catch (err) {
        setError("Cannot connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        ev.title?.toLowerCase().includes(search) ||
        ev.venue?.toLowerCase().includes(search) ||
        ev.description?.toLowerCase().includes(search);

      let matchCat = true;
      if (categoryFilter === "MUSIC") {
        matchCat = /singh|music|coldplay|dreams|tour|concert|dua/i.test(ev.title);
      } else if (categoryFilter === "COMEDY") {
        matchCat = /comedy|latent|khan|samay/i.test(ev.title);
      } else if (categoryFilter === "SPORTS") {
        matchCat = /cup|grand prix|cricket|sports|formula|f1/i.test(ev.title);
      } else if (categoryFilter === "TECH") {
        matchCat = /tech|cyber|ai|masters|esports|quantum/i.test(ev.title);
      }

      return matchSearch && matchCat;
    });
  }, [events, searchTerm, categoryFilter]);

  return (
    <main className="lock-dashboard">
      <div className="dashboard-glow dashboard-glow-one"></div>
      <div className="dashboard-glow dashboard-glow-two"></div>

      <nav className="lock-navbar">
        <Link href="/" className="lock-logo">
          <span className="lock-logo-icon">◈</span>
          <span>LOCK</span>
          <span className="lock-logo-gradient">ONCE.</span>
        </Link>

        <div className="navbar-right">
          <Link href="/my-bookings" className="portal-badge" style={{ textDecoration: 'none' }}>
            🎟️ MY TICKETS & PASSES
          </Link>
          <Link href="/" className="home-button">⌂ Home</Link>
        </div>
      </nav>

      <section className="lock-dashboard-content">

        <div className="welcome-section">
          <span className="welcome-eyebrow">
            ✦ 3D HOLOGRAPHIC EVENT DISCOVERY
          </span>

          <h1>
            Welcome to your <span>Dashboard.</span>
          </h1>

          <p>
            Experience next-generation 3D arena seat selection with zero race conditions,
            real-time hold concurrency, and cryptographically verified digital passes.
          </p>

          <div className="welcome-line"></div>
        </div>

        {/* Dashboard Search & Filter Bar */}
        <div className="dashboard-filter-bar">
          <div className="event-search-box">
            <span className="search-icon">⌕</span>
            <input
              type="search"
              placeholder="Filter live events, arenas, headliners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="dashboard-cats">
            {["ALL", "MUSIC", "COMEDY", "SPORTS", "TECH"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`dash-cat-pill ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === "ALL" ? `✦ All (${events.length})` : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="events-heading">
          <div>
            <span className="section-eyebrow">ACTIVE ARENAS</span>
            <h2>Discover Events<span>.</span></h2>
          </div>

          <div className="events-count">
            <span>{filteredEvents.length}</span> OF {events.length} EVENTS
          </div>
        </div>

        {loading && (
          <div className="dashboard-message">
            <div className="loading-spinner"></div>
            <p>Connecting to quantum seat ledger...</p>
          </div>
        )}

        {error && (
          <div className="dashboard-message error-message">
            {error}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="dashboard-message">
            <span className="empty-icon">◈</span>
            <h3>No events matched your search</h3>
            <p>Try clearing your search query or selecting All.</p>
          </div>
        )}

        <div className="lock-event-grid">
          {filteredEvents.map((event) => (
            <article className="lock-event-card" key={event.id}>

              <div className="event-card-top">
                <span className="event-category">✦ 3D HOLOGRAPHIC ARENA</span>
                <span className="event-symbol">◈</span>
              </div>

              <div className="event-card-content">
                <h3>{event.title}</h3>

                <p className="event-description">
                  {event.description}
                </p>

                <div className="event-details">
                  <div className="event-detail">
                    <span className="detail-icon">⌖</span>
                    <div>
                      <small>LOCATION</small>
                      <p>{event.venue}</p>
                    </div>
                  </div>

                  <div className="event-detail">
                    <span className="detail-icon">◷</span>
                    <div>
                      <small>DATE & TIME</small>
                      <p>
                        {new Date(event.event_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="event-holo-telemetry-strip">
                  <span>● 70 Chairs Multi-Tier</span>
                  <span>🔒 Quantum Row Lock</span>
                </div>

                <Link
                  href={`/events/${event.id}`}
                  className="lock-event-button"
                >
                  <span>Enter 3D Arena & Pick Seats</span>
                  <span className="event-button-arrow">↗</span>
                </Link>
              </div>

              <div className="event-card-bottom">
                <span>LOCKONCE PROTOCOL</span>
                <span>VERIFIED ON-CHAIN PASS READY</span>
              </div>

            </article>
          ))}
        </div>

      </section>

      <footer className="lock-dashboard-footer">
        <span>◈ LOCKONCE.</span>
        <p>Your seat. Your experience. Your moment.</p>
      </footer>
    </main>
  );
}