const { default: mongoose } = require("mongoose");

const subjectSchema = mongoose.Schema({
    name : String,
    teacher : String,
    timeSlot : [{type : Map, of : Date}]
})

const SubjectModel = mongoose.model("subject", subjectSchema)

// export default SubjectModel;