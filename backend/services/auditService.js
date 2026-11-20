const db = require("../config/db");

async function writeAudit({
    eventId = null,
    actorId = null,
    action,
    details = {}
}) {
    const shardKey = eventId ?? actorId ?? 0;
    const shardNumber = Math.abs(Number(shardKey)) % 4;
    const tableName = `audit_logs_${shardNumber}`;

    const query = `
        INSERT INTO ${tableName}
        (event_id, actor_id, action, details)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const result = await db.query(query, [
        eventId,
        actorId,
        action,
        JSON.stringify(details)
    ]);

    return result.rows[0];
}

module.exports = { writeAudit };
