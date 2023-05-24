const express = require("express")
const router = express.Router();
const AdminModel = require("../models/admin.js")


router.get("/", (req, res)=>{
    res.send("You'r in admin")
})
router.post("/login", (req, res)=>{
    const data = req.body;
    AdminModel(data)
})

module.exports = router;