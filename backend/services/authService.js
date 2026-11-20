const db = require("../config/db");
const bcrypt = require("bcrypt");

async function registerUser(name, email, password, role = "student") {
    const existingUser = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new Error("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role`,
        [name, email, passwordHash, role]
    );

    return result.rows[0];
}

async function loginUser(email, password) {
    const result = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!validPassword) {
        throw new Error("Invalid email or password");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}

module.exports = { registerUser, loginUser };