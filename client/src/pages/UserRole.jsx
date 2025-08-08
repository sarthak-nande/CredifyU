import React from 'react'
import SelectRoleScreen from '@/component/SelectRole'
import { useState, useMemo } from 'react'
import { GraduationCap, Building2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'


const ROLES = [
    { id: "student", name: "Student", description: "Access and share your credentials", icon: GraduationCap },
    { id: "college", name: "College", description: "Issue and manage student records", icon: Building2 },
    { id: "authority", name: "Third Party Authority", description: "Verify identities and documents", icon: ShieldCheck },
]

export default function UserRole() {
    const [step, setStep] = useState("select")
    const [role, setRole] = useState("")
    const navigate = useNavigate();


    const selectedRole = useMemo(() => ROLES.find((r) => r.id === role), [role])
    return (
        <div>
            <SelectRoleScreen
                role={role}
                onChangeRole={setRole}
                onNext={() => {
                    if (role) {
                        localStorage.setItem("role", role)
                        setStep("home")
                        if (role === "student") {
                            navigate("/student/dashboard")
                        }
                        if (role === "college") {
                            navigate("/register")
                        }
                        if (role === "authority") {
                            navigate("/authority/dashboard/students")
                        }
                    }
                }}
            />
        </div>
    )
}
