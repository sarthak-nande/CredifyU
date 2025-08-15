import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, ForwardIcon, ArrowLeft } from 'lucide-react'
import api from "@/utils/api"
import { QRCodeCanvas } from "qrcode.react"
import DeleteButton from './DeleteButton'
import { useNavigate } from 'react-router-dom'

export default function StudentCard() {
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myToken, setMyToken] = useState("");
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    // Function to get students array from localStorage
    const getStudentsFromStorage = () => {
        try {
            const students = localStorage.getItem("students");
            return students ? JSON.parse(students) : [];
        } catch (error) {
            console.error("Error parsing students data", error);
            return [];
        }
    };

    // Function to get current student from array
    const getCurrentStudentFromArray = () => {
        try {
            const students = getStudentsFromStorage();
            const currentStudent = localStorage.getItem("currentStudent");
            
            if (currentStudent) {
                const parsedCurrent = JSON.parse(currentStudent);
                // Find student in array by email or ID
                return students.find(student => 
                    student.email === parsedCurrent.email ||
                    (student._id && parsedCurrent._id && student._id === parsedCurrent._id) ||
                    (student.id && parsedCurrent.id && student.id === parsedCurrent.id)
                );
            }
            
            // If no current student set, return the most recent one
            return students.length > 0 ? students[students.length - 1] : null;
        } catch (error) {
            console.error("Error getting current student from array", error);
            return null;
        }
    };

    // Function to migrate old format to new array format
    const migrateOldData = () => {
        try {
            const oldStudent = JSON.parse(localStorage.getItem("student") || "null");
            const token = localStorage.getItem("token");
            
            if (oldStudent && typeof oldStudent === "object" && oldStudent.name) {
                // Migrate to array format
                const students = getStudentsFromStorage();
                const studentExists = students.some(student => 
                    student.email === oldStudent.email ||
                    (student._id && oldStudent._id && student._id === oldStudent._id)
                );

                if (!studentExists) {
                    const studentWithMetadata = {
                        ...oldStudent,
                        token: token || "",
                        savedAt: new Date().toISOString(),
                        id: Date.now()
                    };
                    
                    students.push(studentWithMetadata);
                    localStorage.setItem("students", JSON.stringify(students));
                    localStorage.setItem("currentStudent", JSON.stringify(studentWithMetadata));
                }
                
                // Remove old format after migration
                localStorage.removeItem("student");
                
                return getCurrentStudentFromArray();
            }
            
            return null;
        } catch (error) {
            console.error("Error migrating old data", error);
            return null;
        }
    };

    useEffect(() => {
        try {
            setLoading(true);
            
            // First try to get student from array format
            let studentData = getCurrentStudentFromArray();
            
            // If no student found in array, try to migrate from old format
            if (!studentData) {
                studentData = migrateOldData();
            }
            
            if (studentData) {
                setPayload(studentData);
                // Set token from student data or fallback to localStorage
                setMyToken(studentData.token || localStorage.getItem("token") || "");
            } else {
                console.warn("No valid student data found");
            }
        } catch (error) {
            console.error("Error loading student data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleBack = () => {
        navigate('/student/saved-info');
    };

    const handleDeleteStudent = () => {
        try {
            if (payload) {
                const students = getStudentsFromStorage();
                const updatedStudents = students.filter(student => 
                    student.email !== payload.email && 
                    !(student._id && payload._id && student._id === payload._id) &&
                    !(student.id && payload.id && student.id === payload.id)
                );
                
                localStorage.setItem("students", JSON.stringify(updatedStudents));
                localStorage.removeItem("currentStudent");
                
                // If there are other students, set the first one as current
                if (updatedStudents.length > 0) {
                    localStorage.setItem("currentStudent", JSON.stringify(updatedStudents[0]));
                }
                
                navigate('/student/saved-info');
            }
        } catch (error) {
            console.error("Error deleting student", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!payload) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">No Student Data</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">No student information found.</p>
                        <Button onClick={handleBack} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mx-auto space-y-6">
                {/* Back Button */}
                <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="text-gray-600 hover:text-black self-start"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Saved Data
                </Button>

                <Card className="border-green-200 bg-green-50 text-center">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-2 text-green-700">
                            <CheckCircle className="h-6 w-6" />
                            <span className="text-lg font-semibold">✅ Verified JWT</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <GraduationCap className="h-6 w-6" />
                            Student Identity Card
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                            <QRCodeCanvas value={myToken} size={256} />
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">{payload?.name}</h2>
                                <Badge variant="secondary" className="mt-1">
                                    {payload?.branch} - {payload?.year}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">{payload?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-sm">{payload?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Mobile</p>
                                        <p className="font-medium">{payload?.mobile}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Academic Year</p>
                                        <p className="font-medium">{payload?.year}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-2">JWT Information</h3>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issuer:</span>
                                        <span className="font-mono text-xs">{payload?.iss}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Audience:</span>
                                        <span className="font-mono text-xs">{payload?.aud}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issued At:</span>
                                        <span>{payload ? formatDate(payload.iat) : "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional info if saved from array */}
                            {payload?.savedAt && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-blue-700 mb-2">Storage Information</h3>
                                    <div className="text-sm text-blue-600">
                                        <div className="flex justify-between">
                                            <span>Saved At:</span>
                                            <span>{new Date(payload.savedAt).toLocaleString()}</span>
                                        </div>
                                        {payload.lastScannedAt && (
                                            <div className="flex justify-between">
                                                <span>Last Scanned:</span>
                                                <span>{new Date(payload.lastScannedAt).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Delete Button */}
                <div className="flex justify-center">
                    <Button 
                        variant="destructive" 
                        onClick={handleDeleteStudent}
                        className="w-full max-w-sm"
                    >
                        Delete This Student Data
                    </Button>
                </div>
            </div>
        </div>
    )
}