const express = require("express");
const nodemailer = require("nodemailer");
const moment = require("moment");
const router = express.Router();
const StudentModel = require("../models/student.js");
const AppointmentModel = require("../models/appointment.js");

const countPerPage = 15;

//  APIs from here are meant for CRUD on students
router.post("/list/", async (req, res) => {
  try {
    const filters = req.body || {};
    const page = req.query.p || 0;
    const studentList = await StudentModel.find(filters, {
      firstName: 1,
      lastName: 1,
      "tutoringDetail.subjects": 1,
      "addressDetail.parentsEmail": 1,
      parentDetail: 1,
      status: 1,
      approved: 1,
      comments: 1,
    })
      .skip(page * countPerPage)
      .limit(countPerPage);
    res.json(studentList);
  } catch (error) {
    res.status = 500;
    res.send(error);
  }
});

// router.get("/newenrollment/", async (req, res) => {
//   try {
//     const filters = req.body || {};
//     filters.approved = false;
//     const page = req.query.p || 0;
//     const studentList = await StudentModel.find(filters, {
//       firstName: 1,
//       email: 1,
//       phone: 1,
//       "tutoringDetail.subjects": 1,
//       status: 1,
//     })
//       .skip(page * countPerPage)
//       .limit(countPerPage);
//     res.json(studentList);
//   } catch (error) {
//     res.status = 500;
//     res.send(error);
//   }
// });

router.get("/single", async (req, res) => {
  try {
    const id = req.query.id;
    const student = await StudentModel.findById(id);
    res.json(student);
  } catch (error) { }
});


router.get("/search", async (req, res) => {
  try {
    var filter = {}
    const firstName = req.query.firstName
    const lastName = req.query.lastName;
    if (firstName != null) {
      filter.firstName = { $regex: firstName, $options : 'i' }
    }
    if (lastName != null) {
      filter.lastName = { $regex: lastName , $options : 'i' }
    }
    // console.log(filter)
    const student = await StudentModel.find(filter, { firstName: 1, lastName: 1, "addressDetail.parentsEmail": 1 })
    res.json(student);
  }
  catch (error) {
    res.send("no data found").statusCode = 500;
  }
});

router.get("/misc", async (req, res) => {
  const active = await StudentModel.find({
    status: "Active",
    approved: true,
  }).count();
  const inactive = await StudentModel.find({
    status: "Inactive",
    approved: true,
  }).count();
  const pending = await StudentModel.find({
    status: "Pending",
    approved: false,
  }).count();
  const onlinePayment = await StudentModel.find({
    approved: true,
    "tutoringDetail.paymentMethod": "online",
  }).count();
  const offlinePayment = await StudentModel.find({
    approved: true,
    "tutoringDetail.paymentMethod": "offline",
  }).count();
  const dayWiseCount = await StudentModel.aggregate([
    {
      $match: {
        approved: true,
      },
    },
    {
      $unwind: "$tutoringDetail.days",
    },
    {
      $group: {
        _id: "$tutoringDetail.days",
        count: { $sum: 1 },
      },
    },
  ]);
  const data = {
    active,
    inactive,
    pending,
    onlinePayment,
    offlinePayment,
    dayWiseCount,
  };
  res.json(data);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // console.log(updates)
  try {
    // Find the student by ID and update the fields
    const student = await StudentModel.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    var keyList = Object.keys(updates);
    // console.log(keyList);
    for (var key in keyList) {
      var data = keyList[key];
      student[data] = updates[data];
    }
    await student.save();
    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// for development purpose only
router.get("/all", async (req, res) => {
  try {
    const studentList = await StudentModel.find({});
    res.json(studentList);
  } catch (error) {
    res.status(500).json({ error: "Server Error!" });
  }
});

// router.put("/:id/approval", async (req, res) => {
//   const { id } = req.params;
//   const { approved } = req.body;

//   try {
//     const student = await StudentModel.findById(id);
//     if (!student) {
//       return res.status(400).json({
//         error: "Student Not Found",
//       });
//     }

//     student.approved = approved;
//     student.status = approved ? "Active" : "Inactive";
//     await student.save();

//     res.json({
//       message: "Approval status updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.post("/save", (req, res) => {
  try {
    const data = req.body;
    data.approved = false;
    const student = new StudentModel(data);
    student.save();
    res.status(200).json({
      message: "Data received",
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// APIS from here are meant for providing basic email functionality

router.post("/sendemails", (req, res) => {
  const data = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ujjwalcpj123@gmail.com",
      pass: "vrsrhwlslyezonwd",
    },
  });

  var mailOptions = {
    from: "ujjwalcpj123@gmail.com",
    to: data.emails,
    subject: data.subject,
    text: data.body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send(error);
    } else {
      res.send(info);
    }
  });
});

router.post("/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const student = await StudentModel.findById(id);
    if (!student) {
      return res.status(400).json({
        error: "Student Not Found!",
      });
    }

    const newComment = text;

    student.comments.push(newComment);
    await student.save();

    res.json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Deleting Specific Comment of Particular student
router.delete("/:id/comments/:commentId", async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const student = await StudentModel.findById(id);

    if (!student) {
      return res.status(400).json({
        error: "Student Not Found!",
      });
    }

    //Finding the comment from index
    const commentIndex = student.comments.findIndex(
      (comment) => comment._id.toString() === commentId
    );

    if (commentIndex === -1) {
      return res.status(400).json({
        error: "Comment Not Found!",
      });
    }

    // removing content from the database
    student.comments.splice(commentIndex, 1);
    await student.save();

    res.json({
      message: "Comment removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Deleting all comments of a particular student
router.delete("/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const student = await StudentModel.findById(id);

    if (!student) {
      return res.status(400).json({
        error: "Student Not Found!",
      });
    }

    const newComment = [];
    student.comments = newComment;
    await student.save();
    res.json({
      message: "All Comments removed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// APIs from here provide CRUD operations to Appointments

router.post("/saveappointment", async (req, res) => {
  const data = req.body;
  const { startTime, endTime } = data;

  console.log(data);

  if (!startTime || !endTime) {
    return res
      .status(400)
      .json({ error: "Start time and end time are required" });
  }

  if (startTime >= endTime) {
    return res.status(400).json({ error: "Invalid time range" });
  }

  // Converting the time to UTC
  const startTimeUTC = moment(startTime).utc().toISOString();
  const endTimeUTC = moment(endTime).utc().toISOString();

  try {
    const existingAppointment = await AppointmentModel.findOne({
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
    });

    if (existingAppointment) {
      return res
        .status(409)
        .json({ error: "Appointment time slot is already booked" });
    }

    const newAppointment = new AppointmentModel({
      ...data,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
    });
    await newAppointment.save();

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getappointment", async (req, res) => {
  const filter = req.query.filter;

  try {
    let appointments;

    if (filter === "all") {
      appointments = await AppointmentModel.find({}).sort({ createdAt: 1 });
    } else if (filter === "upcoming") {
      appointments = await AppointmentModel.find({
        startTime: { $gte: new Date() },
      }).sort({ createdAt: 1 });
    } else if (filter === "week") {
      const endDate = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
      appointments = await AppointmentModel.find({
        startTime: { $gte: new Date(), $lte: endDate },
      }).sort({ createdAt: 1 });
    } else if (filter === "today") {
      const endDate = new Date(+new Date() + 1 * 24 * 60 * 60 * 1000);
      appointments = await AppointmentModel.find({
        startTime: { $gte: new Date(), $lte: endDate },
      }).sort({ createdAt: 1 });
    } else {
      appointments = await AppointmentModel.find({}).sort({ createdAt: 1 });
    }
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/appointment/:id", async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Delete the appointment by its ID
    await AppointmentModel.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server Error!" });
  }
});

module.exports = router;
