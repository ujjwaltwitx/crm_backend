const { default: mongoose, mongo } = require("mongoose");
const addressSchema = mongoose.Schema({
  addressStreet: String,
  suburb: String,
  postCode: Number,
  parentsEmail: String,
});

const parentSchema = mongoose.Schema({
  name: String,
  relation: String,
  phone: String,
});

const healthSchema = mongoose.Schema({
  allergicFood: String,
  medications: String,
  allergicMedication: String,
  healthProblem: String,
});

const timeSlotSchema = mongoose.Schema({
  day: String,
  startAt: String,
  endAt: String,
});

const tutoringSchema = mongoose.Schema({
  subjects: [String],
  days: [String],
  timeSlots: [timeSlotSchema],
  frequency: Number,
  paymentMethod: String,
});

const studentSchema = mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    dob: Date,
    gender: String,
    schoolName: String,
    schoolYear: String,
    comments: [
      {
        text: String,
      },
    ],
    addressDetail: {
      type: addressSchema,
      required: true,
    },
    parentDetail: [parentSchema],
    healthDetail: {
      type: healthSchema,
      required: true,
    },
    tutoringDetail: {
      type: tutoringSchema,
      required: true,
    },
    status: String,
    approved: Boolean,
  },
  { timestamps: true }
);

const StudentModel = mongoose.model("student", studentSchema);

module.exports = StudentModel;
