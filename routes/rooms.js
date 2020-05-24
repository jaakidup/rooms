const router = require("express").Router();
const status = require("http-status-codes");
const verifyToken = require("./verifyToken");
const Room = require("../model/Room");
const User = require("../model/User");



// Create new Room
router.post("/", verifyToken, async (req, res) => {
    const room = new Room({
        name: req.body.name,
        host: req.user._id,
        capacity: req.body.capacity
    })

    try {
        let savedRoom = await room.save()
        res.status(status.OK).send(savedRoom)
    } catch (error) {
        res.status(status.BAD_REQUEST).send("Room not created")
    }
})


// Get all rooms
router.get("/", async (req, res) => {
    const rooms = await Room.find()
    if (rooms.length == 0) return res.status(status.NOT_FOUND).send("No Rooms found")
    res.status(status.OK).json(rooms)
})

router.get("/user/:username", async (req, res) => {
    const user = await User.findOne({username: req.params.username})
    if (!user) return res.status(status.NOT_FOUND).send("User Not Found")

    const rooms = await Room.find({participants: user._id})
    if (rooms.length < 1) return res.status(status.NOT_FOUND).send("User Not Found in any rooms")
    res.status(status.OK).json(rooms)
})



// Change Room Host
router.post('/:roomid',verifyToken , async (req, res) => {

    let room = await Room.findById(req.params.roomid)

    console.log(room.host, req.user._id)
    if(room.host != req.user._id) {
        return res.status(status.FORBIDDEN).send("You're not allowed to change the host")
    }

    let newHost = await User.findById(req.body.host)
    if(!newHost) {
        return res.status(status.NOT_FOUND).send("New host was not found")
    }

    room.host = newHost
    try {
        let savedRoom = await room.save()
        res.status(status.OK).json(savedRoom)
    } catch (error) {
        res.status(status.BAD_REQUEST).send("Update host failed")
    }
});

// Get Room info
router.get("/:roomid", async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomid)
        res.status(status.OK).json(room)
    } catch (error) {
        res.status(status.NOT_FOUND).send("Room not found")
    }
})

// Join room
router.post("/:roomid/join", verifyToken, async (req, res) => {
        const room = await Room.findById(req.params.roomid)
        if (!room) return res.status(status.NOT_FOUND).send("Room not found")

        if (room.participants.includes(req.user._id)) return res.status(status.BAD_REQUEST).send("Already in room") 
        if (room.participants.length < room.capacity) {
            room.participants.push(req.user._id)            
        }

        try {
            let updatedRoom = await room.save()
            res.status(status.OK).send("Joined room")
        } catch (error) {
            res.status(status.BAD_REQUEST).send("Couldn't update room")
        }

    
})

// Leave room
router.post("/:roomid/leave", verifyToken, async (req, res) => {
    console.log("leave : " + req.params.roomid)
    const room = await Room.findById(req.params.roomid)
    if (!room) return res.status(status.NOT_FOUND).send("Room not found")


    let index = room.participants.indexOf(req.user._id)
    if (index > -1) {
        room.participants.splice(index, 1);
    } else {
       return res.status(status.BAD_REQUEST).send("User not found in room")
    }

    try {
        let updatedRoom = await room.save()
        res.status(status.OK).send("User Left room")
    } catch (error) {
        res.status(status.BAD_REQUEST).send("Couldn't update room")
    } 
})



module.exports = router