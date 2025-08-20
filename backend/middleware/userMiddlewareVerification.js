const jwt = require("jsonwebtoken");

const userMiddlewareVerification = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ 
                success: false, 
                message: err.name === "TokenExpiredError" 
                    ? "Session expired, please login again" 
                    : "Invalid token" 
            });
        }

        req.user = decoded; // store decoded user data
        next();
    });
};

module.exports = userMiddlewareVerification;
