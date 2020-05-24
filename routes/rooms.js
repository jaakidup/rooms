const router = require("express").Router();
const status = require("http-status-codes");
const verifyToken = require("./verifyToken");

router.get("/", verifyToken, (req, res) => {    
    res.status(status.OK).send("Rooms")
})


module.exports = router