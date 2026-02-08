/* =========================
   API BASE (LOCAL + PROD)
========================= */
const API_BASE =
  location.hostname === "127.0.0.1" || location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

/* =========================
   DOM ELEMENTS
========================= */
const branchSelect = document.getElementById("branchSelect");
const classSelect = document.getElementById("classSelect");
const studentsGrid = document.getElementById("studentsGrid");
const studentsList = document.getElementById("studentsList");

const dashboardSection = document.getElementById("dashboardSection");
const selectionSection = document.getElementById("selectionSection");

/* Student Info */
const studentNameEl = document.getElementById("studentName");
const studentRollEl = document.getElementById("studentRoll");
const studentClassEl = document.getElementById("studentClass");
const studentBranchEl = document.getElementById("studentBranch");

/* Stats */
const presentCountEl = document.getElementById("presentCount");
const absentCountEl = document.getElementById("absentCount");
const totalDaysEl = document.getElementById("totalDays");
const attendancePercentageEl = document.getElementById("attendancePercentage");

/* Attendance History */
const attendanceListEl = document.getElementById("attendanceList");

/* =========================
   STATE
========================= */
let currentStudents = [];
let selectedStudent = null;

/* =========================
   DATE
========================= */
document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

/* =========================
   LOAD CLASSES
========================= */
branchSelect.addEventListener("change", () => {
  classSelect.innerHTML = `
    <option value="">-- Select Class --</option>
    <option value="Daycare">Daycare</option>
    <option value="PP1">PP1</option>
    <option value="PP2">PP2</option>
    <option value="PP3">PP3</option>
  `;
  classSelect.disabled = false;
  studentsGrid.style.display = "none";
});

/* =========================
   LOAD STUDENTS
========================= */
classSelect.addEventListener("change", async () => {
  const branch = branchSelect.value;
  const className = classSelect.value;
  if (!branch || !className) return;

  const res = await fetch(
    `${API_BASE}/students?branch=${branch}&className=${className}`
  );
  currentStudents = await res.json();

  renderStudents();
});

/* =========================
   RENDER STUDENT CARDS
========================= */
function renderStudents() {
  studentsList.innerHTML = "";
  studentsGrid.style.display = "block";

  currentStudents.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";

    card.innerHTML = `
      <div class="student-card-icon">
        <i class="fas fa-user"></i>
      </div>
      <h4>${student.name}</h4>
      <div class="student-card-meta">
        Roll No: ${student.rollno}
      </div>
    `;

    card.addEventListener("click", () => {
      openDashboard(student);
    });

    studentsList.appendChild(card);
  });
}

/* =========================
   OPEN DASHBOARD
========================= */
async function openDashboard(student) {
  selectedStudent = student;

  selectionSection.style.display = "none";
  dashboardSection.style.display = "block";

  studentNameEl.textContent = student.name;
  studentRollEl.textContent = student.rollno;
  studentClassEl.textContent = student.class;
  studentBranchEl.textContent = student.branch;

  await loadAttendanceData();
}

/* =========================
   LOAD ATTENDANCE DATA
========================= */
async function loadAttendanceData() {
  const res = await fetch(
    `${API_BASE}/attendance?rollno=${selectedStudent.rollno}&className=${selectedStudent.class}&branch=${selectedStudent.branch}`
  );

  const records = await res.json();

  let present = 0;
  let absent = 0;

  attendanceListEl.innerHTML = "";

  // records.forEach(r => {
  //   if (r.status === "Present") present++;
  //   else absent++;

  //   const item = document.createElement("div");
  //   item.className = "attendance-item";

  //   item.innerHTML = `
  //     <span class="attendance-date">${r.date}</span>
  //     <span class="attendance-status ${
  //       r.status === "Present" ? "status-present" : "status-absent"
  //     }">${r.status}</span>
  //   `;

  //   attendanceListEl.appendChild(item);
  // });
  records.forEach(r => {
  if (r.status === "Present") present++;
  else absent++;

  const dateObj = new Date(r.date);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const item = document.createElement("div");
  item.className = "attendance-item";

  item.innerHTML = `
    <span class="attendance-date">${formattedDate}</span>
    <span class="attendance-status ${
      r.status === "Present" ? "status-present" : "status-absent"
    }">${r.status}</span>
  `;

  attendanceListEl.appendChild(item);
});


  const total = records.length;
  const percentage = total ? Math.round((present / total) * 100) : 0;

  presentCountEl.textContent = present;
  absentCountEl.textContent = absent;
  totalDaysEl.textContent = total;
  attendancePercentageEl.textContent = `${percentage}%`;
}

/* =========================
   BACK BUTTON
========================= */
function goBack() {
  dashboardSection.style.display = "none";
  selectionSection.style.display = "block";
}

window.goBack = goBack;
