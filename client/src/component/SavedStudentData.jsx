"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Mail, Phone, MapPin, BookOpen, GraduationCap, ArrowLeft, Clock, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import DeleteButton from "./DeleteButton"
import Header from "./Header"

export default function SavedStudentData() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Function to migrate old format to new array format
  const migrateOldData = () => {
    try {
      const oldStudent = JSON.parse(localStorage.getItem("student") || "null");
      const token = localStorage.getItem("token");
      
      if (oldStudent && typeof oldStudent === "object" && oldStudent.name) {
        const existingStudents = getStudentsFromStorage();
        const studentExists = existingStudents.some(student => 
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
          
          existingStudents.push(studentWithMetadata);
          localStorage.setItem("students", JSON.stringify(existingStudents));
          localStorage.setItem("currentStudent", JSON.stringify(studentWithMetadata));
        }
        
        // Remove old format after migration
        localStorage.removeItem("student");
        
        return getStudentsFromStorage();
      }
      
      return [];
    } catch (error) {
      console.error("Error migrating old data", error);
      return [];
    }
  };

  useEffect(() => {
    try {
      // First try to get students from array format
      let studentsData = getStudentsFromStorage();
      
      // If no students found in array, try to migrate from old format
      if (studentsData.length === 0) {
        studentsData = migrateOldData();
      }
      
      console.log("Loaded students data:", studentsData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading students data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Inactive":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Graduated":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleViewStudent = (student) => {
    // Set the selected student as current
    localStorage.setItem("currentStudent", JSON.stringify(student));
    navigate('card');
  }

  const handleBack = () => {
    navigate('/user/dashboard');
  }

  const handleDeleteAllStudents = () => {
    localStorage.removeItem("students");
    localStorage.removeItem("currentStudent");
    localStorage.removeItem("token");
    setStudents([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Loading screen
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we fetch your data.</p>
      </div>
    );
  }

  // No data screen
  if (!students || students.length === 0) {
    return (
      <>
      <Header title="CredifyU" subtitle="Store and verify student identities" />
      <div className="container mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4 text-gray-600 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No Saved Student Data</h2>
          <p className="text-muted-foreground">You haven't saved any student data yet.</p>
          <Button className="mt-4" onClick={() => navigate('/student/college-name')}>
            Scan Student QR Code
          </Button>
        </div>
      </div>
      </>
    );
  }

  // Data found, render students list
  return (
    <>
    <Header title="CredifyU" subtitle="Store and verify student identities" />
    <div className="container mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="text-gray-600 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Verified Data</h1>
          <p className="text-muted-foreground">Manage And View Your Credential Information</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {students.length} Student{students.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="max-w-4xl mx-auto space-y-4">
          {students.map((student, index) => (
            <Card key={student.id || student.email || index} className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent/50">
              <CardHeader className="pb-4" onClick={() => handleViewStudent(student)}>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${getInitials(student.name)}`} />
                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>
                      {student._id?.$oid ? `ID: ${student._id.$oid}` : student.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor("Active")}>Active</Badge>
                    {student.savedAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Saved: {formatDate(student.savedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4" onClick={() => handleViewStudent(student)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  {student.branch && (
                    <div className="flex items-center space-x-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{student.branch}</span>
                    </div>
                  )}
                  {student.year && (
                    <div className="flex items-center space-x-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{student.year}</span>
                    </div>
                  )}
                  {student.mobile && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.mobile}</span>
                    </div>
                  )}
                </div>
                {student.lastScannedAt && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Last scanned: {new Date(student.lastScannedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Delete All Button */}
          <div className="max-w-4xl mx-auto mt-6">
            <DeleteButton
              redirectTo="/student/college-name"
              title="Delete All Student Data?"
              description="This will permanently delete all your saved student information. This action cannot be undone."
              buttonText="Delete All Data"
              onConfirm={handleDeleteAllStudents}
            />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {students.map((student, index) => (
          <Card key={student.id || student.email || index} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-4" onClick={() => handleViewStudent(student)}>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${getInitials(student.name)}`} />
                  <AvatarFallback className="text-sm">{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{student.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                  {student.savedAt && (
                    <p className="text-xs text-muted-foreground">Saved: {formatDate(student.savedAt)}</p>
                  )}
                </div>
                <Badge className={`${getStatusColor("Active")} text-xs`}>Active</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Delete All Button for Mobile */}
        <DeleteButton
          redirectTo="/student/college-name"
          title="Delete All Student Data?"
          description="This will permanently delete all your saved student information. This action cannot be undone."
          buttonText="Delete All Data"
          onConfirm={handleDeleteAllStudents}
        />
      </div>
    </div>
    </>
  );
}