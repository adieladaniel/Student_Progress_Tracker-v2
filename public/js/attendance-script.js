/* =========================
   API BASE
========================= */
const API_BASE =
  location.hostname === "127.0.0.1" || location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

/* =========================
   PAGE CONTEXT
========================= */
const CLASS_NAME = document.body.dataset.class;
const today = new Date().toISOString().split("T")[0];

/* =========================
   DOM ELEMENTS
========================= */
const branchSelect = document.getElementById("branchSelect");
const attendanceSection = document.getElementById("attendanceSection");
const studentList = document.getElementById("studentList");
const studentCount = document.getElementById("studentCount");
const selectedBranchText = document.getElementById("selectedBranch");
const attendanceForm = document.getElementById("attendanceForm");

/* Modal */
const absentModal = document.getElementById("absentModal");
const modalBranch = document.getElementById("modalBranch");
const modalDate = document.getElementById("modalDate");
const absentList = document.getElementById("absentList");
const noAbsenteesNote = document.getElementById("noAbsenteesNote");
const modalClose = document.getElementById("modalClose");
const modalConfirm = document.getElementById("modalConfirm");

/* =========================
   STATE
========================= */
let currentStudents = [];
let selectedBranch = "";

/* =========================
   FETCH STUDENTS
========================= */
async function loadStudents(branch) {
  const res = await fetch(
    `${API_BASE}/students?branch=${branch}&className=${CLASS_NAME}`
  );
  return res.json();
}

/* =========================
   RENDER STUDENTS
========================= */
function renderStudents(students) {
  studentList.innerHTML = "";

  if (!students.length) {
    studentList.innerHTML =
      `<div class="no-students">No students found for this branch.</div>`;
    studentCount.textContent = "0";
    return;
  }

  studentCount.textContent = students.length;

  students.forEach((student, index) => {
    const li = document.createElement("li");
    li.className = "student-row";

    li.innerHTML = `
      <span class="student-name">
        ${index + 1}. ${student.name}
      </span>

      <label class="absent-toggle">
        <input 
          type="checkbox" 
          data-rollno="${student.rollno}" 
          data-name="${student.name}"
        />
        Absent
      </label>
    `;

    studentList.appendChild(li);
  });
}


/* =========================
   BRANCH CHANGE HANDLER
========================= */
branchSelect.addEventListener("change", async () => {
  selectedBranch = branchSelect.value;
  if (!selectedBranch) return;

  selectedBranchText.textContent = selectedBranch;
  attendanceSection.style.display = "block";

  currentStudents = await loadStudents(selectedBranch);
  renderStudents(currentStudents);
});

/* =========================
   RESET
========================= */
function clearSelection() {
  studentList.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.checked = false;
  });
}
window.clearSelection = clearSelection;

/* =========================
   FORM SUBMIT → SHOW MODAL
========================= */
attendanceForm.addEventListener("submit", e => {
  e.preventDefault();

  absentList.innerHTML = "";
  noAbsenteesNote.textContent = "";

  const absentees = [];

  studentList.querySelectorAll("input[type='checkbox']").forEach(cb => {
    if (cb.checked) {
      absentees.push(cb.dataset.name);
    }
  });

  if (!absentees.length) {
    noAbsenteesNote.textContent = "No absentees today 🎉";
  } else {
    absentees.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      absentList.appendChild(li);
    });
  }

  modalBranch.textContent = selectedBranch;
  modalDate.textContent = today;

  absentModal.style.display = "flex";
});

/* =========================
   MODAL ACTIONS
========================= */
modalClose.addEventListener("click", () => {
  absentModal.style.display = "none";
});

modalConfirm.addEventListener("click", async () => {
  for (const student of currentStudents) {
    const checkbox = studentList.querySelector(
      `input[data-rollno="${student.rollno}"]`
    );

    const status = checkbox.checked ? "Absent" : "Present";

    await fetch(`${API_BASE}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: today,
        rollno: student.rollno,
        name: student.name,
        className: CLASS_NAME,
        branch: selectedBranch,
        status
      })
    });
  }

  absentModal.style.display = "none";
  alert("Attendance saved successfully!");
});
