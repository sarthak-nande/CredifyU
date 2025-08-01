import mongoose from "mongoose";
import { SignJWT, importPKCS8 } from "jose";
import Student from "../model/student.js";
import { UserModel } from "../model/user.js";
import keys from "../model/keys.js";
import { decryptText } from "../middleware/crpytoGenarator.js";
import jwt from "jsonwebtoken";

async function CreateStudent(req, res) {
    const { name, email, mobile, year, branch, collegeId } = req.body;

    const isStudentAlreadyPresent = await Student.findOne({email: email});

    if (isStudentAlreadyPresent) {
        return res.status(400).json({ message: "Student with this email already exists" });
    }

    if (!name || !email || !mobile || !year || !branch || !collegeId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const student = new Student({
            name,
            email,
            mobile,
            year,
            branch,
            collegeId
        });

        if (student) {
            const collegeKeys = await keys.findOne({ collegeId: collegeId });

            if (!collegeKeys) {
                return res.status(404).json({ message: "Private key not found for the college" });
            }

            const privateKeyBuffer = await decryptText(collegeKeys.privateKey, collegeKeys.privateKeyIv);

            if (!privateKeyBuffer) {
                return res.status(500).json({ message: "Failed to decrypt private key" });
            }

            const key = await importPKCS8(privateKeyBuffer, 'ES256');


            const token = await new SignJWT(student.toObject())
                .setProtectedHeader({ alg: 'ES256' })
                .setIssuedAt()
                .setIssuer(collegeId.toString())
                .setAudience(collegeId.toString())
                .sign(key);


            student.token = token;

            const savedStudent = await student.save();

            if (!savedStudent) {
                return res.status(500).json({ message: "Error saving student" });
            }

        } else {
            return res.status(400).json({ message: "Error creating student" });
        }

        res.status(200).json({ message: "Student created successfully" });
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function GetAllStudents(req, res) {
    const accessToken = req.cookies.accessToken 

    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    const getCollegeId = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!getCollegeId || !getCollegeId._id) {
        return res.status(400).json({ message: "Unauthorized User" });
    }
    
    const collegeId = getCollegeId._id;

    if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
    }

    try {
        const students = await Student.find({ collegeId: collegeId });

        if (!students || students.length === 0) {
            return res.status(200).json({ message: "No students found for this college" });
        }

        res.status(200).json({ students });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function GetStudentById(req, res) {
    const { id } = req.params;

    console.log("Fetching student with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    try {
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ student });
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function UpdateStudent(req, res) {
    const { studentId } = req.body;

    const { name, email, mobile, year, branch } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid student ID" });
    }

    if (!name || !email || !mobile || !year || !branch) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { name, email, mobile, year, branch },
            { new: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// want to delete multiple students by there ids

async function DeleteStudents(req, res) {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: "No student IDs provided" });
    }

    try {
        const result = await Student.deleteMany({ _id: { $in: studentIds } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found with the provided IDs" });
        }
        
        res.status(200).json({ message: `${result.deletedCount} students deleted successfully` });
    } catch (error) {
        console.error("Error deleting students:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export { CreateStudent, GetAllStudents, GetStudentById, UpdateStudent, DeleteStudents };