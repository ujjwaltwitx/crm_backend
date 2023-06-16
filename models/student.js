const { default : mongoose } = require("mongoose");
const addressSchema = mongoose.Schema({
    addressStreet: String,
    suburb: String,
    postCode: Number,
    parentsEmail: String,
})

const parentSchema = mongoose.Schema({
    name : String,
    relation : String,
    phone : Number,
})

const healthSchema = mongoose.Schema({
    allergicFood : String,
    medications : String,
    allergicMedication : String,
    healthProblem : String,
})

const tutoringSchema = mongoose.Schema({
    subjects : [String],
    days : [String],
    frequency : Number,
    paymentMethod : String,
})


const studentSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    dob: Date,
    gender: String,
    schoolName: String,
    schoolYear: Number,
    email: String,
    phone: Number,
    comment: [
        {
            author: String,
            text: String
        }
    ],
    addressDetail : {
        type : addressSchema,
        required: true,
    },
    parentDetail : [parentSchema],
    healthDetail : {
        type: healthSchema,
        required: true,
    },
    tutoringDetail : {
        type : tutoringSchema,
        required : true,
    },
    status : String,
    approved : Boolean
}, { timestamps: true })

const StudentModel = mongoose.model('student', studentSchema)

module.exports = StudentModel