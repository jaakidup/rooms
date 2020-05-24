const router = require('express').Router();
const User = require("../model/User");
const status = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken");








router.get("/:username", async (req, res) => {
    const user = await User.findOne({username: req.params.username})
    if (!user) return res.status(status.NOT_FOUND).send("User Not Found")
    res.status(status.OK).json(user)
})

router.get("/", async (req, res) => {
    const users = await User.find()
    if (users.length == 0) return res.status(status.NO_CONTENT).send("No Users Found")
    res.status(status.OK).json(users)
})


router.patch('/',verifyToken , async (req, res) => {

    let user = await User.findOne({_id: req.user._id})
    if(!user) return res.status(status.NOT_FOUND).send("YOU don't exist!!!")

    if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        user.password = hashedPassword
    }
    if (req.body.mobile_token) {
        user.mobile_token = req.body.mobile_token
    }
    
    try {
        let saved = await user.save()
        res.status(status.ACCEPTED).json(saved)
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error)
    }

});

router.delete('/',verifyToken , async (req, res) => {

    let deleted = await User.deleteOne({_id: req.user._id})
    if(deleted.deletedCount == 0) return res.status(status.BAD_REQUEST).send("Not deleted")
    if(deleted.deletedCount == 1) return res.status(status.ACCEPTED).send("User Deleted")
    res.status(status.BAD_REQUEST).send("User not deleted")
    
});




router.post('/register', async (req, res) => {

    const userExists = await User.findOne({email: req.body.email})
    if (userExists) return res.status(status.BAD_REQUEST).send("Email already exists")

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = new User({
        username: req.body.username,
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        mobile_token: req.body.mobile_token
    });

    try {
        const savedUser = await user.save()      
        res.status(status.CREATED).json(savedUser) 
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error)
    }

});
 
router.post("/login", async (req, res) => {

    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(status.NOT_FOUND).send("Email and password doesn't match")

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(status.NOT_FOUND).send("Email and password doesn't match")

    const token = jwt.sign({_id: user._id, username: user.username}, process.env.TOKEN_SECRET)
    
    res.header("Authorization", "Bearer " + token).send(token)

})

router.post('/refreshToken', (req, res) => res.status(status.NOT_IMPLEMENTED).send("TOKEN cannot be refeshed, Method not implemented"));


module.exports = router