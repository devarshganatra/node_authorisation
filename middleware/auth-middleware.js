const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated via token
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. No token provided. Please login to continue"
        });
    }

    try {
        const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedTokenInfo);

        req.userInfo = decodedTokenInfo;
        next();
    } catch (e) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Invalid token or token expired."
        });
    }
};

module.exports = authMiddleware;