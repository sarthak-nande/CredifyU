"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import api from "@/utils/api"
import { useDispatch } from "react-redux"
import { setCollegeId } from "@/redux/collegeSlice"
import { Navigate, useNavigate } from "react-router-dom"
import { ForwardIcon } from "lucide-react"


export default function CollegeSelect() {
    const [colleges, setColleges] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCollege, setSelectedCollege] = useState("")
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchColleges = async () => {
            try {

                const response = await api.get('/api/college-names', {
                    withCredentials: true
                })
                if (response.status !== 200) {
                    throw new Error('Failed to fetch colleges')
                }
                const data = response.data.colleges
                setColleges(data)
                setLoading(false)
            } catch (error) {
                console.error("Failed to fetch colleges:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchColleges()
    }, [])

    const handleCollegeSelect = (value) => {
        setSelectedCollege(value)
        const selectedCollegeName = colleges.find((college) => college.id.toString() === value)?.name;
        const collegeId = colleges.find((college) => college.id.toString() === value)?.id;
        dispatch(setCollegeId(collegeId));
        console.log("Selected college:", selectedCollegeName)

    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4 p-4">
                <div className="w-full max-w-sm">
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 p-4">
            <h1 className="text-2xl font-bold mb-4">Select Your College</h1>
            <div className="w-full max-w-sm space-y-4">
                <Select value={selectedCollege} onValueChange={handleCollegeSelect}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                        {colleges.map((college) => (
                            <SelectItem key={college.id} value={college.id.toString()}>
                                {college.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedCollege && (
                    <p className="text-sm text-muted-foreground">
                        Selected: {colleges.find((c) => c.id.toString() === selectedCollege)?.name}
                    </p>
                )}

                <Button
                    className="w-full"
                    disabled={!selectedCollege}
                    onClick={() => { navigate("/student/scanner") }}
                >
                    Next<ForwardIcon className="ml-2" />
                </Button>
            </div>
        </div>
    )
}
