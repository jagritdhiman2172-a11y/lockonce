const db = require("./config/db");
const bcrypt = require("bcrypt");

async function seed() {
  console.log("Starting LockOnce Database Seeding...");

  try {
    // 1. Create Demo Organizer & Student Users
    const passwordHash = await bcrypt.hash("password123", 12);

    const organizerRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET role = 'organizer'
       RETURNING id, name, email, role`,
      ["Aura Entertainment", "organizer@lockonce.io", passwordHash, "organizer"]
    );
    const organizerId = organizerRes.rows[0].id;
    console.log("✓ Organizer Ready:", organizerRes.rows[0].email);

    const studentRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET role = 'student'
       RETURNING id, name, email, role`,
      ["Jagrit Dhiman", "jagrit@lockonce.io", passwordHash, "student"]
    );
    console.log("✓ Student User Ready:", studentRes.rows[0].email);

    // 2. Comprehensive Mega Events
    const events = [
      {
        title: "ARIJIT SINGH • SYMPHONIC STRINGS 2026",
        description: "Monumental 100-piece orchestral live concert with full 3D spatial acoustics and holographic visual effects.",
        venue: "LockOnce Mega Cyber Arena, New Delhi",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
      },
      {
        title: "COLDPLAY • MUSIC OF THE SPHERES 2026",
        description: "The global phenomenon arrives with cosmic kinetic wristbands and 360-degree stadium projection.",
        venue: "DY Patil Mega Stadium, Mumbai",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22)
      },
      {
        title: "INDIA'S GOT LATENT • LIVE ARENA TAPING",
        description: "Join Samay Raina and special guest panelists for the unfiltered comedy sensation recorded live.",
        venue: "Cyber Hub Amphitheater, Gurugram",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18)
      },
      {
        title: "ZAKIR KHAN • TATHASTU UNPLUGGED ARENA",
        description: "The iconic storyteller returns for an emotional, laughter-filled arena special in the capital.",
        venue: "Siri Fort Grand Auditorium, New Delhi",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28)
      },
      {
        title: "ICC WORLD CUP FINAL 2027 • INDIA VS AUSTRALIA",
        description: "Witness history as the two cricketing titans clash in the high-stakes World Cup Grand Finale.",
        venue: "Narendra Modi Stadium, Ahmedabad",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45)
      },
      {
        title: "FORMULA 1 • BHARAT NIGHT GRAND PRIX 2027",
        description: "Speed, high-downforce telemetry, and roaring hybrid engines lighting up the illuminated track.",
        venue: "Buddh International Circuit, Greater Noida",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32)
      },
      {
        title: "CYBER HORIZONS TECH SUMMIT 2027",
        description: "Deep dive into Quantum Computing, Holographic Displays, AI Agents, and Next-Gen Systems.",
        venue: "Bharat Mandapam Hall 5, New Delhi",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 35)
      },
      {
        title: "VALORANT GLOBAL MASTERS • ESPORTS ARENA",
        description: "Top esports squads from across the globe battle live on the stage for championship glory.",
        venue: "Indira Gandhi Indoor Arena, New Delhi",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40)
      },
      {
        title: "NEON DREAMS ELECTRONIC MUSIC FESTIVAL",
        description: "Three nights of transcendent basslines, immersive laser domes, and international headliners.",
        venue: "Vagator Beach Arena, Goa",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 55)
      },
      {
        title: "QUANTUM WEB3 & AGENTIC AI WORLD 2027",
        description: "Discover autonomous agents, zero-knowledge proofs, and decentralized seat locking architecture.",
        venue: "Bangalore International Exhibition Centre, Bengaluru",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25)
      },
      {
        title: "LUMINA IMMERSIVE DIGITAL ART EXHIBITION",
        description: "Walk inside 360-degree generative digital canvases, interactive light sculptures, and sonic environments.",
        venue: "Jawahar Kala Kendra, Jaipur",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20)
      },
      {
        title: "DUA LIPA • RADICAL OPTIMISM TOUR",
        description: "Electrifying dance-pop spectacle with kinetic stage architecture and state-of-the-art holographic visuals.",
        venue: "JLN Stadium Arena, New Delhi",
        eventDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)
      }
    ];

    for (const ev of events) {
      const eventRes = await db.query(
        `INSERT INTO events (organizer_id, title, description, venue, event_date, status)
         VALUES ($1, $2, $3, $4, $5, 'published')
         RETURNING *`,
        [organizerId, ev.title, ev.description, ev.venue, ev.eventDate]
      );

      const event = eventRes.rows[0];
      console.log(`✓ Event Created [ID: ${event.id}]: ${event.title}`);

      // Generate 70 Mega Arena seats (Rows A through G, 10 seats per row)
      const seatValues = [];
      const rowLetters = ["A", "B", "C", "D", "E", "F", "G"];

      for (let r = 0; r < rowLetters.length; r++) {
        for (let num = 1; num <= 10; num++) {
          const seatNum = `${rowLetters[r]}${String(num).padStart(2, "0")}`;
          // Preset a few seats as booked for realism
          const isBooked = (r === 0 && (num === 2 || num === 3)) || (r === 2 && num === 5);
          const status = isBooked ? "booked" : "available";
          seatValues.push(`(${event.id}, '${seatNum}', '${status}')`);
        }
      }

      await db.query(
        `INSERT INTO seats (event_id, seat_number, status)
         VALUES ${seatValues.join(", ")}
         ON CONFLICT (event_id, seat_number) DO NOTHING`
      );
      console.log(`  → Created 70 Mega Arena Seats for Event #${event.id}`);
    }

    // 3. Seed Demo Confirmed Bookings for Jagrit
    const firstEventRes = await db.query(
      `SELECT id, title FROM events ORDER BY id ASC LIMIT 2`
    );

    if (firstEventRes.rows.length > 0) {
      const studentId = studentRes.rows[0].id;
      for (const ev of firstEventRes.rows) {
        // Find 2 booked seats
        const bookedSeats = await db.query(
          `SELECT id, seat_number FROM seats WHERE event_id = $1 AND status = 'booked' LIMIT 2`,
          [ev.id]
        );

        if (bookedSeats.rows.length > 0) {
          const bookingRes = await db.query(
            `INSERT INTO bookings (user_id, event_id, status, checked_in)
             VALUES ($1, $2, 'confirmed', false)
             RETURNING id`,
            [studentId, ev.id]
          );
          const bId = bookingRes.rows[0].id;

          for (const s of bookedSeats.rows) {
            await db.query(
              `INSERT INTO booking_seats (booking_id, seat_id, status)
               VALUES ($1, $2, 'confirmed')
               ON CONFLICT DO NOTHING`,
              [bId, s.id]
            );
          }
          console.log(`✓ Created Sample Confirmed Booking [ID: ${bId}] for ${ev.title}`);
        }
      }
    }

    console.log("\n🎉 Seeding completed successfully! Login with:");
    console.log("Organizer: organizer@lockonce.io / password123");
    console.log("Student:   jagrit@lockonce.io    / password123\n");
    process.exit(0);

  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seed();
