const mongoose  = require('mongoose')

const appointmentSchema = mongoose.Schema({
    studentName : String,
    parentName : String,
    query : String,
    email : String,
    phone : Number,
    startTime : Date,
    endTime : Date,
}, { timestamps: true })

const AppointmentModel = mongoose.model('appointmentModel', appointmentSchema)
module.exports = AppointmentModel