const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const StudentModel = require("../models/student.js");
const AppointmentModel = require("../models/appointment.js");

const countPerPage = 10;

//  APIs from here are meant for CRUD on students
router.post("/list/", async (req, res) => {
  try {
    const filters = req.body || {};
    const page = req.query.p || 0;
    const studentList = await StudentModel.find(filters, {
      firstName: 1,
      email: 1,
      phone: 1,
      "tutoringDetail.subjects": 1,
      "addressDetail.parentsEmail": 1,
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
  } catch (error) {}
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
  try {
    // Find the student by ID and update the fields
    const student = await StudentModel.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    var keyList = Object.keys(updates);
    console.log(keyList);
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

// APIs from here provide CRUD operations to Appointments

router.post("/saveappointment", async (req, res) => {
  const data = req.body;
  const existingAppointment = await Appointment.findOne({
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping appointment
      { startTime: { $gte: startTime, $lte: endTime } }, // Existing appointment within the requested range
    ],
  });

  if (existingAppointment) {
    return res.status(400).json({ error: "Appointment time is not available" });
  }

  const model = new AppointmentModel(data);
  await model.save();
  res.status(200).send("Appointment scheduled");
});

module.exports = router;
