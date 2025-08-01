import express from "express";
import { CreateStudent, DeleteStudents, GetAllStudents, GetStudentById, UpdateStudent } from "../controller/StudentController.js";

const router = express.Router();

router.post('/create-student', CreateStudent);

router.get('/get-students', GetAllStudents);

router.get('/get-student/:id', GetStudentById);

router.delete('/delete-students', DeleteStudents);

router.post('/update-student', UpdateStudent);

export default router;
