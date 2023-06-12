const express = require("express");
const nodemailer = require("nodemailer")
const router = express.Router();
const StudentModel = require("../models/student.js");

const countPerPage = 10;
router.get("/list/", async (req, res) => {
  try {
    const filters = req.body || {};
    filters.approved = true;
    const page = req.query.p || 0;
    const studentList = await StudentModel.find(filters, {"firstName" : 1, "email" : 1, "phone" : 1, "tutoringDetail.subjects" : 1, "status": 1})
      .skip(page * countPerPage)
      .limit(countPerPage);
    res.json(studentList);
  } catch (error) {
    res.status = 500;
    res.send(error);
  }
});

router.get("/newenrollment/", async (req, res) => {
  try {
    const filters = req.body || {};
    filters.approved = false;
    const page = req.query.p || 0;
    const studentList = await StudentModel.find(filters, {"firstName" : 1, "email" : 1, "phone" : 1, "tutoringDetail.subjects" : 1, "status": 1})
      .skip(page * countPerPage)
      .limit(countPerPage);
    res.json(studentList);
  } catch (error) {
    res.status = 500;
    res.send(error);
  }
});

router.get("/single", async (req, res) => {
  try {
    const id = req.query.id;
    const student = await StudentModel.findById(id);
    res.json(student);
  } catch (error) {
    
  }
})

router.get("/misc", async(req, res) => {
    const active = await StudentModel.find({"status" : "Active"}).count();
    const inactive = await StudentModel.find({"status" : "Inactive"}).count();
    const onlinePayment = await StudentModel.find({'tutoringDetail.paymentMethod' : "ezyPay"}).count();
    const offlinePayment = await StudentModel.find({'tutoringDetail.paymentMethod' : "cash"}).count();
    const dayWiseCount = await StudentModel.aggregate([
      {
        $unwind: "$tutoringDetail.days"
      },
      {
        $group: {
          _id: "$tutoringDetail.days",
          count: { $sum: 1 },
          // documents: { $push: "$$ROOT" }
        }
      }
    ])
    const data = {active, inactive, onlinePayment, offlinePayment, dayWiseCount}
    res.json(data);
})

router.put("/update", async(req, res) => {
  const data = req.body;
  // console.log(Object.keys(data));
  // await StudentModel.find({"_id" : Object(data._id)}).updateOne({"$set" : data})
  return res.send("Record updated successfully");
})

router.post("/save", (req, res) => {
  try {
    const data = req.body;
    const student = new StudentModel(data);
    student.save();
    res.status(200);
    res.send("Data received");
  } catch (error) {
    res.send(error);
  }
});



router.post("/sendemails", (req, res) => {
  const data = req.body;
  const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
      user: "ujjwalcpj123@gmail.com",
      pass : "vrsrhwlslyezonwd"
    }
  })

  var mailOptions = {
    from: 'ujjwalcpj123@gmail.com',
    to: data.emails,
    subject: data.subject,
    text: data.body
  };

  transporter.sendMail(mailOptions, (error, info)=>{
    if(error){
      res.send(error)
    }
    else{
      res.send(info)
    }
  })
})

module.exports = router;
