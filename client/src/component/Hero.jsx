import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function Hero({ roleName }) {
  // Function to get actual count of students from localStorage array
  const getStudentCount = () => {
    try {
      const students = localStorage.getItem("students");
      if (students) {
        const parsedStudents = JSON.parse(students);
        return Array.isArray(parsedStudents) ? parsedStudents.length : 0;
      }
      
      // Fallback to check old single student format for backward compatibility
      const oldStudent = localStorage.getItem("student");
      return oldStudent ? 1 : 0;
    } catch (error) {
      console.error("Error getting student count:", error);
      return 0;
    }
  };

  const credentialCount = getStudentCount();

  return (
    <Card className="overflow-hidden border-0 bg-black text-white">
      <CardHeader className="p-5 md:p-6">
        <CardTitle className="text-lg font-semibold">Welcome, {roleName}</CardTitle>
        <CardDescription className="text-zinc-200">
          Secure access to your digital identity
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-5 pt-0 md:p-6 md:pt-0">
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
          <span className="text-sm text-zinc-200">
            {credentialCount === 1 ? 'Verified credential' : 'Verified credentials'}
          </span>
          <span className="font-semibold tracking-tight">{credentialCount}</span>
        </div>
      </CardContent>
    </Card>
  )
}