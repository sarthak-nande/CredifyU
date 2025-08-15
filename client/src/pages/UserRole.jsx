import React, { useState, useMemo, useEffect } from 'react';
import SelectRoleScreen from '@/component/SelectRole';
import { GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
    { id: "student", name: "Student", description: "Access and share your credentials", icon: GraduationCap },
    { id: "college", name: "College", description: "Issue and manage student records", icon: Building2 },
    { id: "authority", name: "Third Party Authority", description: "Verify identities and documents", icon: ShieldCheck },
];

export default function UserRole() {
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (storedRole && storedRole !== "college") {
            setRole(storedRole);
            navigate(`/user/dashboard`);
        }else{
            setRole(storedRole);
        }
    }, []);

    return (
        <div>
            <SelectRoleScreen
                role={role}
                onChangeRole={setRole}
                onNext={() => {
                    if (!role) return;
                    localStorage.setItem("role", role);

                    if (role === "student" || role === "authority") {
                        navigate("/user/dashboard");
                    }
                    if (role === "college") {
                        navigate("/college/login");
                    }
                }}
            />
        </div>
    );
}
