"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import HologramTicket from "../components/HologramTicket";
import HologramAuditorium from "../components/HologramAuditorium";

const demoSeats = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  seat_number: `${String.fromCharCode(65 + Math.floor(i / 10))}${String((i % 10) + 1).padStart(2, "0")}`,
  status: [3, 8, 14, 22, 29, 36, 42].includes(i) ? "booked" : [7, 18, 31].includes(i) ? "held" : "available"
}));

const categories = [
  { icon: "🎵", name: "Music & Concerts", color: "violet", filter: "MUSIC" },
  { icon: "😂", name: "Comedy & Standup", color: "pink", filter: "COMEDY" },
  { icon: "🏏", name: "Sports & Stadiums", color: "amber", filter: "SPORTS" },
  { icon: "💻", name: "Tech & AI Summits", color: "mint", filter: "TECHNOLOGY" },
  { icon: "🎨", name: "Arts & Exhibitions", color: "pink", filter: "ARTS" },
  { icon: "🎓", name: "Workshops & Masterclasses", color: "blue", filter: "WORKSHOPS" },
];

const events = [
  {
    id: 1,
    eventId: 13,
    icon: "🎻",
    category: "MUSIC",
    title: "ARIJIT SINGH • SYMPHONIC STRINGS 2026",
    date: "DEC 14, 2026 • 07:30 PM",
    location: "LockOnce Mega Cyber Arena, New Delhi",
    price: "₹1,499",
    rawPrice: 1499,
    tag: "TRENDING",
    fillPercentage: 94,
    color: "event-violet",
  },
  {
    id: 2,
    eventId: 14,
    icon: "🪐",
    category: "MUSIC",
    title: "COLDPLAY • MUSIC OF THE SPHERES 2026",
    date: "DEC 22, 2026 • 08:00 PM",
    location: "DY Patil Mega Stadium, Mumbai",
    price: "₹2,499",
    rawPrice: 2499,
    tag: "SELLING FAST",
    fillPercentage: 98,
    color: "event-mint",
  },
  {
    id: 3,
    eventId: 24,
    icon: "✨",
    category: "MUSIC",
    title: "DUA LIPA • RADICAL OPTIMISM TOUR",
    date: "JAN 19, 2027 • 08:30 PM",
    location: "JLN Stadium Arena, New Delhi",
    price: "₹1,999",
    rawPrice: 1999,
    tag: "VIP ACCESS",
    fillPercentage: 86,
    color: "event-pink",
  },
  {
    id: 4,
    eventId: 21,
    icon: "⚡",
    category: "MUSIC",
    title: "NEON DREAMS ELECTRONIC MUSIC FESTIVAL",
    date: "FEB 14, 2027 • 06:00 PM",
    location: "Vagator Beach Arena, Goa",
    price: "₹1,799",
    rawPrice: 1799,
    tag: "TRENDING",
    fillPercentage: 79,
    color: "event-violet",
  },
  {
    id: 5,
    eventId: 15,
    icon: "😂",
    category: "COMEDY",
    title: "INDIA'S GOT LATENT • LIVE ARENA TAPING",
    date: "DEC 18, 2026 • 07:00 PM",
    location: "Cyber Hub Amphitheater, Gurugram",
    price: "₹499",
    rawPrice: 499,
    tag: "SELLING FAST",
    fillPercentage: 96,
    color: "event-mint",
  },
  {
    id: 6,
    eventId: 16,
    icon: "🎙️",
    category: "COMEDY",
    title: "ZAKIR KHAN • TATHASTU UNPLUGGED ARENA",
    date: "DEC 28, 2026 • 08:00 PM",
    location: "Siri Fort Grand Auditorium, New Delhi",
    price: "₹699",
    rawPrice: 699,
    tag: "TRENDING",
    fillPercentage: 91,
    color: "event-amber",
  },
  {
    id: 7,
    eventId: 17,
    icon: "🏆",
    category: "SPORTS",
    title: "ICC WORLD CUP FINAL 2027 • IND VS AUS",
    date: "FEB 04, 2027 • 02:00 PM",
    location: "Narendra Modi Stadium, Ahmedabad",
    price: "₹2,999",
    rawPrice: 2999,
    tag: "SELLING FAST",
    fillPercentage: 99,
    color: "event-amber",
  },
  {
    id: 8,
    eventId: 18,
    icon: "🏎️",
    category: "SPORTS",
    title: "FORMULA 1 • BHARAT NIGHT GRAND PRIX 2027",
    date: "JAN 22, 2027 • 08:00 PM",
    location: "Buddh International Circuit, Greater Noida",
    price: "₹3,499",
    rawPrice: 3499,
    tag: "VIP ACCESS",
    fillPercentage: 88,
    color: "event-pink",
  },
  {
    id: 9,
    eventId: 19,
    icon: "🤖",
    category: "TECHNOLOGY",
    title: "CYBER HORIZONS TECH & AI SUMMIT 2027",
    date: "JAN 25, 2027 • 09:30 AM",
    location: "Bharat Mandapam Hall 5, New Delhi",
    price: "₹899",
    rawPrice: 899,
    tag: "TRENDING",
    fillPercentage: 82,
    color: "event-mint",
  },
  {
    id: 10,
    eventId: 20,
    icon: "🎯",
    category: "TECHNOLOGY",
    title: "VALORANT GLOBAL MASTERS • ESPORTS ARENA",
    date: "JAN 30, 2027 • 04:00 PM",
    location: "Indira Gandhi Indoor Arena, New Delhi",
    price: "₹799",
    rawPrice: 799,
    tag: "SELLING FAST",
    fillPercentage: 93,
    color: "event-violet",
  },
  {
    id: 11,
    eventId: 22,
    icon: "🌐",
    category: "TECHNOLOGY",
    title: "QUANTUM WEB3 & AGENTIC AI WORLD 2027",
    date: "FEB 15, 2027 • 10:00 AM",
    location: "BIEC Arena, Bengaluru",
    price: "₹1,199",
    rawPrice: 1199,
    tag: "NEW",
    fillPercentage: 74,
    color: "event-mint",
  },
  {
    id: 12,
    eventId: 23,
    icon: "🔮",
    category: "ARTS",
    title: "LUMINA IMMERSIVE DIGITAL ART EXHIBITION",
    date: "JAN 10, 2027 • 11:00 AM",
    location: "Jawahar Kala Kendra, Jaipur",
    price: "₹399",
    rawPrice: 399,
    tag: "NEW",
    fillPercentage: 65,
    color: "event-pink",
  },
];

const faqs = [
  {
    question: "How does LockOnce work?",
    answer:
      "Explore available events, choose your preferred seats, temporarily hold them and confirm your booking.",
  },
  {
    question: "Can someone else book my selected seat?",
    answer:
      "LockOnce is designed to temporarily hold selected seats during the booking process, helping prevent conflicting bookings.",
  },
  {
    question: "Can I view my previous bookings?",
    answer:
      "Yes. Sign in to your account and visit My Bookings to view your booking history.",
  },
  {
    question: "How do I organise an event?",
    answer:
      "Register or sign in with an organizer account to access the event management features available to your role.",
  },
];

const filters = [
  "ALL",
  "MUSIC",
  "COMEDY",
  "SPORTS",
  "TECHNOLOGY",
  "ARTS",
  "WORKSHOPS",
];

function updateMouseGlow(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  e.currentTarget.style.setProperty(
    "--mouse-x",
    `${e.clientX - rect.left}px`
  );

  e.currentTarget.style.setProperty(
    "--mouse-y",
    `${e.clientY - rect.top}px`
  );
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeTag, setActiveTag] = useState("ALL");
  const [sortBy, setSortBy] = useState("featured");
  const [demoSelected, setDemoSelected] = useState([4, 5, 14]);

  // Dynamic Hero Ticket Customizer State
  const [ticketEventIndex, setTicketEventIndex] = useState(0);
  const [ticketTier, setTicketTier] = useState("DIAMOND QUANTUM PASS");

  const currentHeroEvent = events[ticketEventIndex] || events[0];

  function toggleDemoSeat(seat) {
    if (seat.status !== "available") return;
    setDemoSelected((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : prev.length < 8
          ? [...prev, seat.id]
          : prev
    );
  }

  const navLinks = [
    { label: "3D Hologram", href: "#hologram-preview" },
    { label: "Categories", href: "#categories" },
    { label: "Events", href: "#featured" },
    { label: "Verification", href: "#security-verify" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Login", href: "/login" },
    { label: "My Bookings", href: "/my-bookings" },
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: events.length };
    events.forEach((ev) => {
      counts[ev.category] = (counts[ev.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredEvents = useMemo(() => {
    let list = events.filter((event) => {
      const matchesCategory =
        activeCategory === "ALL" || event.category === activeCategory;

      const matchesTag =
        activeTag === "ALL" || event.tag === activeTag;

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search) ||
        event.category.toLowerCase().includes(search);

      return matchesCategory && matchesTag && matchesSearch;
    });

    if (sortBy === "price-low") {
      list = [...list].sort((a, b) => a.rawPrice - b.rawPrice);
    } else if (sortBy === "price-high") {
      list = [...list].sort((a, b) => b.rawPrice - a.rawPrice);
    }

    return list;
  }, [activeCategory, activeTag, searchTerm, sortBy]);

  function selectCategory(category) {
    setActiveCategory(category);
    document.getElementById("featured")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function clearFilters() {
    setSearchTerm("");
    setActiveCategory("ALL");
    setActiveTag("ALL");
    setSortBy("featured");
  }

  return (
    <main className="home-page">

      {/* NAVBAR */}
      <nav className="navbar">
        <h1 className="brand-logo" onMouseMove={updateMouseGlow}>
          <span className="brand-icon">◈</span>
          <span className="brand-lock">LOCK</span>
          <span className="brand-once">ONCE</span>
          <span className="brand-dot">.</span>
        </h1>

        <div className="nav-links">
          {navLinks.map((link, index) =>
            link.href.startsWith("#") ? (
              <a
                key={link.label}
                href={link.href}
                className="nav-glow-link"
                style={{ "--nav-index": index }}
                onMouseMove={updateMouseGlow}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="nav-glow-link"
                style={{ "--nav-index": index }}
                onMouseMove={updateMouseGlow}
              >
                {link.label}
              </Link>
            )
          )}

          <Link
            href="/register"
            className="nav-button nav-glow-button"
            onMouseMove={updateMouseGlow}
          >
            Get Started ↗
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero premium-hero">
        <div className="hero-content">
          <div className="hero-label">
            <span className="live-dot"></span>
            THE FUTURE OF EVENT BOOKING
          </div>

          <div className="hero-kicker">
            ✦ DISCOVER SOMETHING UNFORGETTABLE
          </div>

          <h2 className="hero-title">
            Don't Just
            <br />
            Attend.
            <br />
            <span className="hero-gradient-text">Experience.</span>
          </h2>

          <p className="hero-description">
            Discover extraordinary concerts, sports, technology
            and cultural events. Find your perfect seat, secure it
            instantly, and make every moment count.
          </p>

          <div className="hero-actions">
            <a href="#featured" className="primary-button hero-primary">
              Explore Events <span>↗</span>
            </a>

            <Link href="/register" className="secondary-button hero-secondary">
              <span>＋</span> Join LockOnce
            </Link>
          </div>

          <div className="hero-trust">
            <span>✦ Smart seat selection</span>
            <span>✦ Secure booking</span>
            <span>✦ Unforgettable experiences</span>
          </div>

          <div className="hero-stats">
            <div className="hero-stat-item">
              <strong>01</strong>
              <small>Choose your event</small>
            </div>

            <span className="stat-arrow">→</span>

            <div className="hero-stat-item">
              <strong>02</strong>
              <small>Select your seat</small>
            </div>

            <span className="stat-arrow">→</span>

            <div className="hero-stat-item">
              <strong>03</strong>
              <small>Lock your experience</small>
            </div>
          </div>
        </div>

        <div className="hero-hologram-showcase">
          {/* Dynamic Ticket Selector Toolbar */}
          <div className="hero-ticket-switcher">
            <span className="switcher-label">◈ PREVIEW PASS:</span>
            <div className="switcher-buttons">
              <button
                type="button"
                className={`switcher-pill ${ticketEventIndex === 0 ? "active" : ""}`}
                onClick={() => setTicketEventIndex(0)}
              >
                Arijit Strings
              </button>
              <button
                type="button"
                className={`switcher-pill ${ticketEventIndex === 1 ? "active" : ""}`}
                onClick={() => setTicketEventIndex(1)}
              >
                Coldplay
              </button>
              <button
                type="button"
                className={`switcher-pill ${ticketEventIndex === 6 ? "active" : ""}`}
                onClick={() => setTicketEventIndex(6)}
              >
                World Cup Final
              </button>
              <button
                type="button"
                className={`switcher-pill ${ticketEventIndex === 7 ? "active" : ""}`}
                onClick={() => setTicketEventIndex(7)}
              >
                Formula 1
              </button>
            </div>
          </div>

          <HologramTicket
            eventTitle={currentHeroEvent.title}
            date={currentHeroEvent.date}
            venue={currentHeroEvent.location}
            seatCode="VIP-A • CHAIR 04, 05"
            tier={ticketTier}
            price={currentHeroEvent.price}
            attendeeName="JAGRIT DHIMAN"
            verificationCode={`LOCK-QC-${currentHeroEvent.id}9F7A2`}
            verified={true}
          />

          <div className="ticket-tier-selector">
            <button
              type="button"
              className={`tier-pill ${ticketTier.includes("DIAMOND") ? "active" : ""}`}
              onClick={() => setTicketTier("DIAMOND QUANTUM PASS")}
            >
              💎 Diamond VIP
            </button>
            <button
              type="button"
              className={`tier-pill ${ticketTier.includes("EMERALD") ? "active" : ""}`}
              onClick={() => setTicketTier("VIP EMERALD CLUB PASS")}
            >
              🟢 Emerald Stalls
            </button>
            <button
              type="button"
              className={`tier-pill ${ticketTier.includes("OBSIDIAN") ? "active" : ""}`}
              onClick={() => setTicketTier("CYBER OBSIDIAN BALCONY")}
            >
              🟣 Cyber Balcony
            </button>
          </div>
        </div>
      </section>

      {/* 3D HOLOGRAM AUDITORIUM INTERACTIVE SHOWCASE */}
      <section className="hologram-showcase-section" id="hologram-preview">
        <div className="center-heading">
          <p className="section-eyebrow">◈ 360° MULTI-TIER CYBER VENUE</p>
          <h2>Experience the <span>3D Mega Arena.</span></h2>
          <p>
            Orbit, inspect, and choose your perspective across the VIP Floor, Club Stalls, and Upper Balcony.
            Switch camera angles, trigger the overhead stage lasers, and test the smart AI seat selector.
          </p>
        </div>

        <div className="hologram-showcase-frame">
          <HologramAuditorium
            seats={demoSeats}
            selectedSeats={demoSelected}
            onToggleSeat={toggleDemoSeat}
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="category-section" id="categories">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">FIND YOUR INTEREST</p>
            <h2>Explore by <span>Category.</span></h2>
          </div>
          <span className="category-count-badge">
            {events.length} LIVE EXPERIENCES AVAILABLE
          </span>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const count = categoryCounts[category.filter] || 0;
            return (
              <button
                type="button"
                className={`category-card ${category.color} ${activeCategory === category.filter ? "active-category" : ""
                  }`}
                key={category.name}
                onClick={() => selectCategory(category.filter)}
              >
                <div className="category-card-top-row">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-item-count">{count} {count === 1 ? "Event" : "Events"}</span>
                </div>
                <h3>{category.name}</h3>
                <div className="category-card-bottom-row">
                  <span className="category-status-indicator">● LIVE ARENA</span>
                  <span className="category-arrow">↗</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="featured-section" id="featured">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">HANDPICKED EXPERIENCES</p>
            <h2>Events worth <span>showing up for.</span></h2>
          </div>

          <Link href="/dashboard" className="text-link">
            Explore your dashboard ↗
          </Link>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="event-search-area">
          <div className="event-search-box">
            <span className="search-icon">⌕</span>

            <input
              type="search"
              placeholder="Search by artist, concert, sport, city or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search events"
            />

            {searchTerm && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Primary Category Filter Row */}
          <div className="event-filter-row">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`event-filter ${activeCategory === filter ? "active-filter" : ""
                  }`}
                onClick={() => setActiveCategory(filter)}
              >
                {filter === "ALL" ? `✦ All (${events.length})` : `${filter} (${categoryCounts[filter] || 0})`}
              </button>
            ))}
          </div>

          {/* Secondary Tag Filter & Sorting Bar */}
          <div className="event-subfilter-bar">
            <div className="event-tag-pills">
              <span className="subfilter-label">TAGS:</span>
              {["ALL", "TRENDING", "SELLING FAST", "VIP ACCESS", "NEW"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-pill ${activeTag === tag ? "active" : ""}`}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag === "ALL" ? "All Tags" : tag === "TRENDING" ? "🔥 Trending" : tag === "SELLING FAST" ? "⚡ Selling Fast" : tag === "VIP ACCESS" ? "💎 VIP Access" : "✨ New"}
                </button>
              ))}
            </div>

            <div className="event-sort-control">
              <span className="sort-label">SORT BY:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="event-sort-select"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="event-results-info">
          <span>
            Showing <strong>{filteredEvents.length}</strong> of {events.length} experiences
          </span>

          {(searchTerm || activeCategory !== "ALL" || activeTag !== "ALL" || sortBy !== "featured") && (
            <button
              type="button"
              className="clear-filters"
              onClick={clearFilters}
            >
              Clear filters ↗
            </button>
          )}
        </div>

        <div className="event-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <article
                className="event-card holographic-card-interactive"
                key={event.title}
                onMouseMove={updateMouseGlow}
              >
                <div className={`event-art ${event.color}`}>
                  <div className="event-art-top">
                    <span className="event-art-icon">{event.icon}</span>
                    <span className="event-tag-chip">
                      {event.tag === "TRENDING" ? "🔥 TRENDING" : event.tag === "SELLING FAST" ? "⚡ SELLING FAST" : event.tag === "VIP ACCESS" ? "💎 VIP PASS" : "✨ NEW"}
                    </span>
                  </div>
                  <span className="event-category">{event.category}</span>
                  <div className="event-occupancy-hud">
                    <div className="occupancy-info">
                      <small>ARENA CAPACITY</small>
                      <strong>{event.fillPercentage}% LOCKED</strong>
                    </div>
                    <div className="occupancy-bar">
                      <div
                        className="occupancy-fill"
                        style={{ width: `${event.fillPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="event-details">
                  <div className="event-date">◷ {event.date}</div>
                  <h3>{event.title}</h3>
                  <p className="event-location">⌖ {event.location}</p>

                  <div className="event-telemetry-badge">
                    <span className="telemetry-dot"></span>
                    <span>3D Hologram Stage • SeatLock™ Verified</span>
                  </div>

                  <div className="event-bottom">
                    <div>
                      <small>Starting from</small>
                      <strong>{event.price}</strong>
                    </div>

                    <Link href={`/events/${event.eventId}`} className="event-book-button">
                      Select Seats ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-events">
              <span>🔎</span>
              <h3>No events matched your filters</h3>
              <p>Try clearing your tag or search filter to see more options.</p>
              <button type="button" onClick={clearFilters}>
                Show all experiences
              </button>
            </div>
          )}
        </div>

        <p className="demo-note">
          ◈ Real-time concurrency protection enabled. Zero double-booking guarantee via LockOnce PostgreSQL Row Locks.
        </p>
      </section>

      {/* SECURITY & TICKET VERIFICATION SECTION */}
      <section className="security-verify-section" id="security-verify">
        <div className="center-heading">
          <p className="section-eyebrow">◈ POST-BOOKING VERIFICATION</p>
          <h2>Cryptographic <span>Ticket Verification.</span></h2>
          <p>
            Every seat locked in LockOnce generates an immutable SHA-256 digital fingerprint and dynamic QR hologram pass.
            Verify ticket authenticity in under 50ms at venue turnstiles.
          </p>
        </div>

        <div className="verify-features-grid">
          <div className="verify-feature-card">
            <div className="v-card-icon">🔒</div>
            <h3>Quantum Seat Concurrency</h3>
            <p>
              Row-level PostgreSQL serialization ensures no two users can hold or book the same chair simultaneously.
            </p>
            <div className="v-card-metric">100% RACE-FREE</div>
          </div>

          <div className="verify-feature-card">
            <div className="v-card-icon">⚡</div>
            <h3>5-Min Auto-Expiring Hold</h3>
            <p>
              Held chairs expire automatically if not confirmed within 300 seconds, releasing seats back to the live arena immediately.
            </p>
            <div className="v-card-metric">300s TTL ENGINE</div>
          </div>

          <div className="verify-feature-card">
            <div className="v-card-icon">🛡️</div>
            <h3>On-Chain Hologram Pass</h3>
            <p>
              Dual-sided 3D gyro pass with encrypted barcode telemetry, attendee verification hash, and gate check-in scanner.
            </p>
            <div className="v-card-metric">SHA-256 SIGNED</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="center-heading">
          <p className="section-eyebrow">SIMPLE. SMART. SECURE.</p>
          <h2>Your experience in <span>three steps.</span></h2>
          <p>
            Booking your next experience shouldn't be complicated.
            We've made it simple.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-icon">🔎</div>
            <h3>Discover</h3>
            <p>
              Find exciting events and explore experiences
              that match your interests.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-icon">💺</div>
            <h3>Select Your Seat</h3>
            <p>
              Explore the seat layout and choose the spot
              where you want to experience the event.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-icon">🔐</div>
            <h3>Lock It Once</h3>
            <p>
              Complete the booking process and keep your
              event details accessible in your account.
            </p>
          </div>
        </div>
      </section>

      {/* WHY LOCKONCE */}
      <section className="why-section">
        <div className="why-content">
          <p className="section-eyebrow">THE LOCKONCE DIFFERENCE</p>

          <h2>
            More than a ticket.
            <br />
            <span>It's your experience.</span>
          </h2>

          <p className="why-description">
            A smarter way to discover events, select seats
            and manage your bookings, all in one place.
          </p>

          <Link href="/register" className="primary-button">
            Start Your Journey ↗
          </Link>
        </div>

        <div className="benefit-grid">
          <div className="benefit-card">
            <span>⚡</span>
            <h3>Real-time Selection</h3>
            <p>See seat availability while making your selection.</p>
          </div>

          <div className="benefit-card">
            <span>🔒</span>
            <h3>Smart Seat Holds</h3>
            <p>Temporarily hold selected seats during booking.</p>
          </div>

          <div className="benefit-card">
            <span>🎫</span>
            <h3>Booking Management</h3>
            <p>Access your booking information from your account.</p>
          </div>

          <div className="benefit-card">
            <span>📊</span>
            <h3>Organizer Tools</h3>
            <p>Manage events and view attendee information.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="faq">
        <div className="center-heading">
          <p className="section-eyebrow">GOT QUESTIONS?</p>
          <h2>Frequently asked <span>questions.</span></h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${openFaq === index ? "active" : ""}`}
              key={faq.question}
            >
              <button
                className="faq-question"
                onClick={() =>
                  setOpenFaq(openFaq === index ? -1 : index)
                }
                aria-expanded={openFaq === index}
              >
                {faq.question}
                <span>{openFaq === index ? "−" : "+"}</span>
              </button>

              {openFaq === index && (
                <p className="faq-answer">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="cta-glow"></div>

        <p className="section-eyebrow">
          YOUR NEXT CHAPTER STARTS HERE
        </p>

        <h2>
          The best moments
          <br />
          <span>deserve the best seats.</span>
        </h2>

        <p>
          Discover something exciting. Choose your seat.
          Make the moment yours.
        </p>

        <Link href="/register" className="primary-button">
          Get Started with LockOnce ↗
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="premium-footer">
        <div className="footer-brand">
          <h2>◈ LOCK<span>ONCE.</span></h2>
          <p>Book Once. Experience Forever.</p>
        </div>

        <div className="footer-links">
          <a href="#categories">Categories</a>
          <a href="#featured">Events</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#faq">FAQs</a>
          <Link href="/login">Login</Link>
          <Link href="/my-bookings">My Bookings</Link>
        </div>

        <div className="footer-bottom">
          <span>© 2026 LockOnce. All rights reserved.</span>
          <span>Made for unforgettable experiences. ✦</span>
        </div>
      </footer>

    </main>
  );
}