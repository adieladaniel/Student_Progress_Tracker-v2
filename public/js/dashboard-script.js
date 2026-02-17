// ============================
// API BASE (LOCAL + PROD SAFE)
// ============================

const API_BASE =
  location.hostname === "127.0.0.1" || location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api";

let currentStudent = null;
let progressChart = null;

// ============================
// INIT
// ============================

document.addEventListener("DOMContentLoaded", () => {
  setupBranchClassListeners();
  setupNoteForm();
  setupCurriculumForm();
  setCurrentDate();

  document.getElementById("passwordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("dashboardPassword").value;

    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rollno: currentStudent.rollno,
        className: currentStudent.className,
        branch: currentStudent.branch,
        password
      })
    });

    if (!res.ok) {
      document.getElementById("passwordHint").textContent =
        "Incorrect password";
      return;
    }

    closePasswordModal();

    loadStudentDashboard(
      currentStudent.rollno,
      currentStudent.className,
      currentStudent.branch,
      currentStudent.name
    );
  });
});






// ============================
// DATE
// ============================

function setCurrentDate() {
  const el = document.getElementById("currentDate");
  if (el) el.textContent = new Date().toDateString();
}

// ============================
// LOAD STUDENTS
// ============================

function setupBranchClassListeners() {
  const branchSelect = document.getElementById("branchSelect");
  const classSelect = document.getElementById("classSelect");

  // Load classes when branch changes
  branchSelect.addEventListener("change", async () => {
    const branch = branchSelect.value;

    classSelect.innerHTML = `<option value="">-- Select Class --</option>`;
    classSelect.disabled = true;

    if (!branch) return;

    try {
      const res = await fetch(
        `${API_BASE}/students/classes/${branch}`
      );

      if (!res.ok) throw new Error("Failed to load classes");

      const classes = await res.json();

      classes.forEach(cls => {
        const option = document.createElement("option");
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
      });

      classSelect.disabled = false;
    } catch (err) {
      console.error("Error loading classes:", err);
    }
  });

  // Load students when class changes
  classSelect.addEventListener("change", async () => {
    const branch = branchSelect.value;
    const selectedClass = classSelect.value;

    if (!branch || !selectedClass) return;

    try {
      const res = await fetch(
        `${API_BASE}/students?branch=${branch}&className=${selectedClass}`
      );

      if (!res.ok) throw new Error("Failed to load students");

      const students = await res.json();

      renderStudents(students);
    } catch (err) {
      console.error("Error loading students:", err);
    }
  });
}



function renderStudents(students) {
  const grid = document.getElementById("studentsGrid");
  const list = document.getElementById("studentsList");

  list.innerHTML = "";

  students.forEach((s) => {
    const card = document.createElement("div");
    card.className = "student-card";

    card.innerHTML = `
      <div class="student-card-icon">
        <i class="fas fa-user"></i>
      </div>
      <h4>${s.name}</h4>
      <div class="student-card-meta">Roll: ${s.rollno}</div>
    `;

  //   card.onclick = () =>
  // loadStudentDashboard(s.rollno, s.class, s.branch, s.name);
  card.onclick = () =>
  openPasswordModal(s.rollno, s.class, s.branch, s.name);



    list.appendChild(card);
  });

  grid.style.display = "block";
}



async function loadStudentDashboard(rollno, className, branch, name) {
  // currentStudent = { rollno, className, branch };

  document.getElementById("selectionSection").style.display = "none";
  document.getElementById("dashboardSection").style.display = "block";

  document.getElementById("studentRoll").textContent = rollno;
  document.getElementById("studentClass").textContent = className;
  document.getElementById("studentBranch").textContent = branch;
  document.getElementById("studentName").textContent = name;

  await loadAttendance(rollno);
  await loadProgress(rollno);

}

// ============================
// ATTENDANCE
// ============================

async function loadAttendance(rollno) {
  try {
    const { className, branch } = currentStudent;

    const res = await fetch(
      `${API_BASE}/attendance?rollno=${rollno}&className=${className}&branch=${branch}`
    );

    if (!res.ok) {
      throw new Error("Attendance fetch failed");
    }

    const rows = await res.json();

    // Count present / absent
    const present = rows.filter(r => r.status === "Present").length;
    const absent = rows.filter(r => r.status === "Absent").length;
    const total = rows.length;
    const percentage =
      total === 0 ? 0 : Math.round((present / total) * 100);

    document.getElementById("presentCount").textContent = present;
    document.getElementById("absentCount").textContent = absent;
    document.getElementById("totalDays").textContent = total;
    document.getElementById("attendancePercentage").textContent =
      percentage + "%";

  } catch (err) {
    console.error("Attendance load error:", err);
  }
}




// ============================
// CURRICULUM PROGRESS
// ============================

async function loadProgress(rollno) {
  const { className } = currentStudent;

  try {
    // Get subjects
    const subjectRes = await fetch(
      `${API_BASE}/curriculum/subjects?className=${className}`
    );
    const subjects = await subjectRes.json();

    let total = 0;
    let completed = 0;

    for (let subj of subjects) {
      const chapterRes = await fetch(
        `${API_BASE}/curriculum/chapters?rollno=${rollno}&className=${className}&subject=${subj.subject}`
      );

      const chapters = await chapterRes.json();

      total += chapters.length;
      completed += chapters.filter(c => c.completed).length;
    }

    updateProgressChart(completed, total);

  } catch (err) {
    console.error("Progress load error:", err);
  }
}

function updateProgressChart(completed, total) {
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("completedTopics").textContent = completed;
  document.getElementById("incompleteTopics").textContent = remaining;
  document.getElementById("totalTopics").textContent = total;
  document.getElementById("progressPercentage").textContent = percent + "%";

  if (progressChart) progressChart.destroy();

  const ctx = document.getElementById("progressChart");

  progressChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [completed, remaining],
        backgroundColor: ["#6BCF7F", "#FFD93D"],
        borderWidth: 0,
      }]
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: "70%",
      plugins: { legend: { display: false } }
    }
  });
}



// ============================
// CURRICULUM MODAL
// ============================

async function openCurriculumModal() {
  const { rollno, className } = currentStudent;

  const container = document.getElementById("curriculumWeeks");
  container.innerHTML = "";

  try {
    const subjectRes = await fetch(
      `${API_BASE}/curriculum/subjects?className=${className}`
    );

    const subjects = await subjectRes.json();

    for (let subj of subjects) {

      const chapterRes = await fetch(
        `${API_BASE}/curriculum/chapters?rollno=${rollno}&className=${className}&subject=${subj.subject}`
      );

      const chapters = await chapterRes.json();

      const section = document.createElement("div");
      section.className = "week-section";

      section.innerHTML = `
        <div class="week-header">${subj.subject}</div>
        <div class="week-topics">
          ${chapters.map(ch => `
            <div class="topic-item">
              <input type="checkbox"
                class="topic-checkbox"
                data-id="${ch.id}"
                data-subject="${subj.subject}"
                ${ch.completed ? "checked" : ""}
              />
              <span class="topic-label">
                ${ch.chapter_no}. ${ch.chapter_name}
              </span>
            </div>
          `).join("")}
        </div>
      `;

      container.appendChild(section);
    }

    document.getElementById("curriculumModal").classList.add("open");

  } catch (err) {
    console.error("Modal load error:", err);
  }
}


function closeCurriculumModal() {
  document.getElementById("curriculumModal").classList.remove("open");
}

function setupCurriculumForm() {
  document.getElementById("curriculumForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const { rollno, className } = currentStudent;

      const checkboxes = document.querySelectorAll(".topic-checkbox");

      for (let cb of checkboxes) {

        await fetch(`${API_BASE}/curriculum/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rollno,
            className,
            subject: cb.dataset.subject,
            chapterId: cb.dataset.id,
            completed: cb.checked
          })
        });
      }

      closeCurriculumModal();
      await loadProgress(rollno);

      showToast("Progress updated successfully", "success");
    });
}


// ============================
// NOTES
// ============================

async function loadNotes(rollno) {
  const res = await fetch(`${API_BASE}/student/${rollno}/notes`);
  const notes = await res.json();

  const container = document.getElementById("notesList");
  container.innerHTML = "";

  if (notes.length === 0) {
    container.innerHTML = `<div class="no-notes">No notes available.</div>`;
    return;
  }

  notes.forEach((note) => {
    container.innerHTML += `
      <div class="note-item">
        <div class="note-header">
          <div class="note-date">${note.date}</div>
        </div>
        <div class="note-text">${note.text}</div>
      </div>
    `;
  });
}

function setupNoteForm() {
  document
    .getElementById("noteForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData();
      formData.append("text", document.getElementById("noteText").value);

      const files = document.getElementById("noteImages").files;
      for (let file of files) {
        formData.append("media", file);
      }

      await fetch(
        `${API_BASE}/student/${currentStudent.rollno}/notes`,
        {
          method: "POST",
          body: formData,
        }
      );

      closeNoteModal();
      loadNotes(currentStudent.rollno);
      showToast("Note added successfully", "success");
    });
}

// ============================
// BACK
// ============================

function goBack() {
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("selectionSection").style.display = "block";
}

// ============================
// TOAST
// ============================

function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 3000);
}



function openNoteModal() {
  document.getElementById("noteForm").reset();
  document.getElementById("noteModal").classList.add("open");
}


function closeNoteModal() {
  const modal = document.getElementById("noteModal");
  if (modal) modal.classList.remove("open");
}


function openPasswordModal(rollno, className, branch, name) {

  currentStudent = { rollno, className, branch, name };

  document.getElementById("passwordStudentName").textContent = name;
  document.getElementById("passwordStudentMeta").textContent =
    `Roll No: ${rollno} | ${className} | ${branch}`;

  document.getElementById("dashboardPassword").value = "";
  document.getElementById("passwordHint").textContent = "";

  document.getElementById("passwordModal").classList.add("open");
}
function togglePasswordVisibility() {
  const input = document.getElementById("dashboardPassword");
  input.type = input.type === "password" ? "text" : "password";
}
function closePasswordModal() {
  const modal = document.getElementById("passwordModal");
  if (modal) modal.classList.remove("open");
}
