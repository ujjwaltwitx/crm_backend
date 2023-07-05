const express = require('express')
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const cors = require("cors")


app.use(cors({
    origin : ["https://crm-education.vercel.app", "http://localhost:3000"]
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect("mongodb+srv://blogging_backend:ujjwal2887@cluster0.nzvlqlv.mongodb.net/crm_db")

app.use("/admin", require("./routes/admin.js"))
app.use("/student", require("./routes/student.js"))

app.get("/", (req, res)=>{
    res.send("How are you all");
})
app.listen(4000);