const { writeAudit } = require("../services/auditService");

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    next();
}

function requireRole(...roles) {
    return async (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        if (!roles.includes(req.session.user.role)) {
            try {
                await writeAudit({
                    actorId: req.session.user.id,
                    action: "ACCESS_DENIED",
                    details: {
                        path: req.originalUrl,
                        method: req.method,
                        attemptedRoles: roles
                    }
                });
            } catch (error) {
                console.error("Audit logging failed:", error.message);
            }

            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
}

module.exports = { requireAuth, requireRole };