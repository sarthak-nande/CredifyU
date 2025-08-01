import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/utils/api";
import { toast } from "sonner";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon } from "lucide-react";
import getStudents from "@/utils/getStudents";
import { addStudentStart, addStudentSuccess } from "@/redux/studentSlice";

function AddStudent() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.user.user.user);
  const collegeId = user._id;
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentData = {
      name,
      email,
      mobile,
      year,
      branch,
      collegeId
    };

    try {
      
      if (!name || !email || !mobile || !year || !branch || !collegeId) {
        toast.error("All fields are required");
        return;
      }
      const response = await api.post('/api/create-student', studentData, {withCredentials: true});

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const studResponse = await api.get('/api/get-students', {
                withCredentials: true
      });

      const data = await studResponse.data;

      dispatch(addStudentStart());
      dispatch(addStudentSuccess(data.students));

      setOpen(false);
      setName("");
      setEmail("");
      setMobile("");
      setYear("");
      setBranch("");
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to add student");
    }
  }

  return (
    <div className="mb-2">
      <Dialog open={open  } onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button className="bg-black text-white" >Add Student<PlusIcon/></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Student</DialogTitle>
            <DialogDescription>
              Fill in the details of the new student.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" placeholder="Enter student's name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email-1">Email</Label>
              <Input id="email-1" name="email" placeholder="Enter student's email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="mobile-1">Mobile Number</Label>
              <Input id="mobile-1" name="mobile" placeholder="Enter student's mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="year-1">Year of Study</Label>
              <Input id="year-1" name="year" placeholder="Enter student's year of study" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="branch-1">Branch</Label>
              <Input id="branch-1" name="branch" placeholder="Enter student's branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogTrigger asChild>
              <Button type="submit" onClick={handleSubmit}>Add Student</Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
    </div>
  )
}

export default AddStudent;
