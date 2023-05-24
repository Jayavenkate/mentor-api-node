import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";
import express from "express";
dotenv.config();
const app = express();
// http://localhost:4004
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.use(express.json());

app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 🎊✨🤩");
});

//create mentor

app.post("/create/mentor", async function (req, res) {
  const { id, name, email } = req.body;
  const userFromDb = await client
    .db("b42wd2")
    .collection("mentor")
    .findOne({ email: email });

  if (!userFromDb) {
    const result = await client.db("b42wd2").collection("mentor").insertOne({
      id: id,
      name: name,
      email: email,
      students: [],
    });
    console.log(result);
    res.send({ message: "Insert successfully" });
  } else {
    res.send({ message: "User Already Exist" });
  }
});
//create student
app.post("/create/student", async function (req, res) {
  const { id, name, email } = req.body;
  const userFromDb = await client
    .db("b42wd2")
    .collection("student")
    .findOne({ email: email });

  if (!userFromDb) {
    const result = await client.db("b42wd2").collection("student").insertOne({
      id: id,
      name: name,
      email: email,
    });
    console.log(result);
    res.send({ message: "Insert successfully" });
  } else {
    res.send({ message: "User Already Exist" });
  }
});
//Write API to Assign a student to Mentor

app.post("/assign/mentor", async function (req, res) {
  const { mentor, student } = req.body;
  const checkmentor = await client
    .db("b42wd2")
    .collection("mentor")
    .findOne({ name: mentor });
  const checkstudent = await client
    .db("b42wd2")
    .collection("student")
    .findOne({ name: student });
  if (!checkmentor && !checkstudent) {
    res.send({ message: "student & mentor not found" });
  } else if (checkmentor && checkstudent) {
    const Students = checkmentor.students;
    const assignStudents = [...Students, student];
    const assignStudent = await client
      .db("b42wd2")
      .collection("mentor")
      .updateOne({ name: mentor }, { $set: { students: assignStudents } });
    res.send({ message: "Mentor assigned successfully" });
  } else {
    res.send({ message: "Student is already assigned to a mentor" });
  }
});

//Write API to Assign or Change Mentor for particular Student
app.put("/change/mentor", async function (req, res) {
  const { mentor, student } = req.body;
  const checkmentor = await client
    .db("b42wd2")
    .collection("mentor")
    .findOne({ name: mentor });
  const checkstudent = await client
    .db("b42wd2")
    .collection("student")
    .findOne({ name: student });
  const checkPreviousMentor = await client
    .db("b42wd2")
    .collection("mentor")
    .findOne({ name: checkstudent.mentor });
  //remove student name
  const removeStudent = checkPreviousMentor.students.filter(
    (stud) => stud !== student
  );
  updateList = [...removeStudent];
  const updatePreviousmentorstudent = await client
    .db("b42wd2")
    .collection("mentor")
    .updateOne(
      { name: checkPreviousMentor.name },
      { $set: { students: updateList } }
    );
  //update student name in new mwntor
  const Students = checkmentor.students;
  const assignStudents = [...Students, student];
  const assignStudent = await client
    .db("b42wd2")
    .collection("mentor")
    .updateOne({ name: mentor }, { $set: { students: assignStudents } });
  res.send({ message: "Mentor changed successfully" });
});
//Show All student in particular mentor
app.get("/allstudents/:id", async function (req, res) {
  const { id } = req.params;
  try {
    const get_mentor = await client
      .db("b42w2")
      .collection("mentor")
      .findOne({ _id: ObjectId(id) });
    const get_students = get_mentor.students;
    res.send(get_students);
  } catch (err) {
    res.send({ message: "internal server error" });
  }
});
//Write an API to show the previously assigned mentor for a particular student.
app.get("/student/previousmentor/:id", async function (req, res) {
  const { id } = req.params;
  try {
    const get_student = await client
      .db("b42wd2")
      .collection("student")
      .findOne({ _id: ObjectId(id) });
    const get_previousMentor = { previousMentor: get_student.previousMentor };
    res.send(get_previousMentor);
  } catch (err) {
    res.send({ message: "internal server error" });
  }
});
app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
