"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Mail, Phone, MapPin, BookOpen, GraduationCap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import DeleteButton from "./DeleteButton"

export default function SavedStudentData() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("student"));
      console.log("Saved student data:", saved);
      if (saved && typeof saved === "object" && saved.name) {
        setStudent(saved);
      } else {
        console.warn("No valid student data found");
      }
    } catch (error) {
      console.error("Error parsing student data", error);
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

  const handleViewStudent = () => {
    navigate('card');
  }

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
  if (!student) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">No Saved Student Data</h2>
        <p className="text-muted-foreground">You haven't saved any student data yet.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/student/college-name'}>
          Click Here
        </Button>
      </div>
    );
  }

  // Data found, render student card
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Verified Data</h1>
          <p className="text-muted-foreground">Manage And View Your Credential Information</p>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="max-w-md mx-auto space-y-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-accent/50">
            <CardHeader className="pb-4" onClick={() => handleViewStudent()}>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`/placeholder.svg?height=48&width=48&text=${getInitials(student.name)}`} />
                  <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{student.name}</CardTitle>
                  <CardDescription>ID: {student._id?.$oid || 'N/A'}</CardDescription>
                </div>
                <Badge className={getStatusColor("Active")}>Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4" onClick={() => handleViewStudent()}>
              <div className="space-y-3">
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
              </div>
              <Separator />
              <div className="space-y-3">
                {student.year && (
                  <div className="flex items-center space-x-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{student.year}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delete Button Below Card */}
          <div className="max-w-md mx-auto">
            <DeleteButton
              redirectTo="/student/college-name"
              title="Delete Student Data?"
              description="This will permanently delete all your saved student information. This action cannot be undone."
              buttonText="Delete My Data"
            />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="p-4" onClick={() => handleViewStudent(student._id?.$oid)}>
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${getInitials(student.name)}`} />
                <AvatarFallback className="text-sm">{getInitials(student.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{student.name}</h3>
              </div>
              <Badge className={`${getStatusColor("Active")} text-xs`}>Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Delete Button Below Card for Mobile */}
        <DeleteButton
          redirectTo="/student/college-name"
          title="Delete Student Data?"
          description="This will permanently delete all your saved student information. This action cannot be undone."
          buttonText="Delete My Data"
        />
      </div>
    </div>
  );
}
