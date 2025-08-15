import React, { useEffect, useState, useMemo } from 'react';
import HomeScreen from '@/component/HomeScreen';
import { GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
    { id: "student", name: "Student", description: "Access and share your credentials", icon: GraduationCap },
    { id: "college", name: "College", description: "Issue and manage student records", icon: Building2 },
    { id: "authority", name: "Third Party Authority", description: "Verify identities and documents", icon: ShieldCheck },
];

export default function UserDashboard() {
    const navigate = useNavigate();
    const [role, setRole] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        if (!storedRole) {
            navigate("/user/select-role"); // redirect if no role selected
        } else {
            setRole(storedRole);
        }
    }, [navigate]);

    const selectedRole = useMemo(() => ROLES.find((r) => r.id === role), [role]);

    if (!role) return null;

    return (
        <HomeScreen
            role={selectedRole?.id ?? "student"}
            roleName={selectedRole?.name ?? "Student"}
            RoleIcon={selectedRole?.icon ?? GraduationCap}
           
        />
    );
}
