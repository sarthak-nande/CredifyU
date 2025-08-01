import api from "./api";

async function getStudents() {
  const response = await api.get("/api/get-students", {
    withCredentials: true,
  });

  const data = await response.data;
  if (!data || !data.students) {
    console.log("No students found");
  }

  return data;
}
export default getStudents;