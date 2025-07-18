const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Prantoisagoodb$oy';

const fetchuser = (req, res, next) => { 
    // Get the user from the JWT token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Access denied. No token provided." });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        res.status(401).send({ error: "Invalid token. Authentication failed." });
    }
};

module.exports = fetchuser;
