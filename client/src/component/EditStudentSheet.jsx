import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addStudentStart, addStudentSuccess } from "@/redux/studentSlice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SendIcon, DeleteIcon, EditIcon } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";


function EditStudentSheet({ studentId, isOpen, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    year: "",
    branch: "",
  });

  const fetchStudentById = async (id) => {
    console.log("Fetching student with ID:", id);
    setLoading(true);
    try {
      const response = await api.get(`/api/get-student/${id}`, {
        withCredentials: true,
      });
      const data = response.data.student;
      setStudent(data);
      setFormData({
        name: data.name,
        email: data.email,
        year: data.year,
        branch: data.branch,
        studentId: data._id,
        mobile: data.mobile,
      });
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to fetch student details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentById(studentId);
    }
  }, [isOpen, studentId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      await api.post(`/api/update-student`, formData, {
        withCredentials: true,
      });
      toast.success("Student updated successfully!");
      // You might want to re-fetch all students here or update the redux state
      onClose(); // Close the sheet after successful save
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student.");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Student</SheetTitle>
          <SheetDescription>
            Make changes to the student's profile. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 m-2 py-4">
          {loading ? (
            <p>Loading student data...</p>
          ) : student ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Year
                </Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch" className="text-right">
                  Branch
                </Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mobile" className="text-right">
                    Mobile
                    </Label>
                    <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="col-span-3"
                    />
                </div>
            </>
          ) : (
            <p>Student not found.</p>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSave} disabled={loading}>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditStudentSheet;