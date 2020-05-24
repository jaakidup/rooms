const jwt = require("jsonwebtoken");
const status = require("http-status-codes");

function verifyToken(req, res, next) {
    const header = req.header("Authorization")
    if (!header) return res.status(status.UNAUTHORIZED).send("Access Denied");
 
    const token = header.split(" ")[1]

    try {        
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(status.UNAUTHORIZED).send("Invalid Token");
    }
}

module.exports = verifyToken



