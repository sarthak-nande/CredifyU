// src/components/TableDemo.jsx
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
import { Input } from "@/components/ui/input"; // Import Input component
import { SendIcon, DeleteIcon, EditIcon } from "lucide-react"; // Import EditIcon
import { toast } from "sonner";
import EditStudentSheet from "./EditStudentSheet"; // Import the EditStudentSheet component

export function StudentTable() {
  const dispatch = useDispatch();
  const studentData = useSelector((state) => state.student.students);
  const students = studentData || [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  const fetchStudents = async () => {
    // ... (rest of the fetchStudents function remains the same)
    try {
      const response = await api.get("/api/get-students", {
        withCredentials: true,
      });
      const data = await response.data;
      if (!data || !data.students) {
        console.log("No students found");
      }

      dispatch(addStudentStart());
      dispatch(addStudentSuccess(data.students));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [dispatch]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    // ... (rest of the handleDelete function remains the same)
    try {
      const res = await api.delete("/api/delete-students", {
        data: { studentIds: selectedIds },
        withCredentials: true,
      });
      if (res.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const response = await api.get("/api/get-students", {
        withCredentials: true,
      });
      const data = await response.data;

      if (!data || !data.students) {
        console.log("No students found");
      }

      dispatch(addStudentStart());
      dispatch(addStudentSuccess(data.students));
      toast.success("Students deleted successfully");
      setSelectedIds([]); // Clear selection after deletion
    } catch (error) {
      console.error("Error deleting students:", error);
      toast.error("Failed to delete students");
    }
  };

  const handleSendQR = () => {
    alert("Send QR to: " + selectedIds.join(", "));
    // Implement QR logic here
  };

  const handleEdit = (studentId) => {
    setEditingStudentId(studentId);
    setIsSheetOpen(true);
  };
  
  // Close sheet and reset state
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingStudentId(null);
    fetchStudents(); // Re-fetch students to show updated data
  };

  const filteredStudents = students.filter(
    (student) =>
      student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <Input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-[1000px]"
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            disabled={selectedIds.length === 0}
            onClick={handleDelete}
          >
            <DeleteIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="default"
            disabled={selectedIds.length === 0}
            onClick={handleSendQR}
          >
            <SendIcon className="mr-2 h-4 w-4" />
            Send QR
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your students.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    paginatedStudents.length > 0 &&
                    paginatedStudents.every((student) =>
                      selectedIds.includes(student?._id)
                    )
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds([
                        ...selectedIds,
                        ...paginatedStudents
                          .map((s) => s?._id)
                          .filter((id) => !selectedIds.includes(id)),
                      ]);
                    } else {
                      setSelectedIds(
                        selectedIds.filter(
                          (id) =>
                            !paginatedStudents
                              .map((s) => s?._id)
                              .includes(id)
                        )
                      );
                    }
                  }}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <TableRow key={student?._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(student?._id)}
                      onCheckedChange={() => handleCheckboxChange(student?._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm">{student?._id}</TableCell>
                  <TableCell>{student?.name}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{student?.email}</TableCell>
                  <TableCell>{student?.year}</TableCell>
                  <TableCell>{student?.branch}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(student?._id)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className={
                            currentPage === 1 ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className="hidden sm:inline-flex"
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      
      {/* The Sheet component for editing */}
      <EditStudentSheet 
        studentId={editingStudentId} 
        isOpen={isSheetOpen} 
        onClose={handleSheetClose}
      />
    </div>
  );
}

export default StudentTable;