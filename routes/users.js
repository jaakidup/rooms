const router = require('express').Router();
const User = require("../model/User");
const status = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post('/register', async (req, res) => {

    const userExists = await User.findOne({email: req.body.email})
    if (userExists) return res.status(status.BAD_REQUEST).send("Email already exists")

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save()      
        res.status(status.CREATED).send(savedUser) 
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error)
    }

});
 
router.post("/login", async (req, res) => {

    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(status.NOT_FOUND).send("Email and password doesn't match")

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(status.NOT_FOUND).send("Email and password doesn't match")

    const tokenSecret = process.env.TOKEN_SECRET || "ThisIsMySuperSecretTokenSecret";
    const token = jwt.sign({_id: user._id, username: user.username}, tokenSecret)
    
    res.header("Authorization", "Bearer " + token).send(token)

})

router.post('/refreshToken', (req, res) => res.status(status.NOT_IMPLEMENTED).send("TOKEN cannot be refeshed, Method not implemented"));


module.exports = router