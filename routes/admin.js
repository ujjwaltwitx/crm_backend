const express = require("express");
const router = express.Router();
const AdminModel = require("../models/admin.js");
const StudentModel = require("../models/student.js");

router.get("/", (req, res) => {
  res.send("You'r in admin");
});
router.post("/login", (req, res) => {
  const data = req.body;
  AdminModel(data);
});

router.post("/save", (req, res) => {
  try {
    const data = req.body;
    const student = new StudentModel(data);
    student.save();
    res.status(200).json({
      message: "Data received",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
