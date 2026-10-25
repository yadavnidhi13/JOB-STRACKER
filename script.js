// ==========================================
// MIDNIGHT BLACK — JOB TRACKER
// Complete JavaScript
// ==========================================


// ---------- DOM ELEMENTS ----------

const jobModal = document.getElementById("jobModal");
const jobForm = document.getElementById("jobForm");

const addJobBtn = document.getElementById("addJobBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const jobTableBody = document.getElementById("jobTableBody");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filterBar = document.getElementById("filterBar");
const sortSelect = document.getElementById("sortSelect");

const modalTitle = document.getElementById("modalTitle");
const saveJobBtn = document.getElementById("saveJobBtn");


// Form fields

const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const appliedDateInput = document.getElementById("appliedDate");
const statusInput = document.getElementById("status");
const followUpInput = document.getElementById("followUp");
const jobLinkInput = document.getElementById("jobLink");
const notesInput = document.getElementById("notes");


// Dashboard statistics

const totalApplicationsEl =
    document.getElementById("totalApplications");

const totalInterviewsEl =
    document.getElementById("totalInterviews");

const totalOffersEl =
    document.getElementById("totalOffers");

const responseRateEl =
    document.getElementById("responseRate");

const responseProgressEl =
    document.getElementById("responseProgress");


// ---------- APP STATE ----------

const STORAGE_KEY = "midnightJobTracker";

let jobs = [];

let editingJobId = null;
let activeStatus = "All";


// ---------- LOAD SAVED APPLICATIONS ----------

try {
    const savedJobs = localStorage.getItem(STORAGE_KEY);

    if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs);

        if (Array.isArray(parsedJobs)) {
            jobs = parsedJobs.filter(
                job =>
                    job &&
                    typeof job.id === "string" &&
                    typeof job.company === "string"
            );
        }
    }
} catch (error) {
    console.error("Could not load saved applications:", error);
}


// ---------- SAVE APPLICATIONS ----------

function saveJobs() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(jobs)
        );

        return true;
    } catch (error) {
        console.error("Could not save applications:", error);

        alert(
            "Your applications could not be saved. " +
            "Check your browser's storage settings."
        );

        return false;
    }
}


// ---------- GENERATE UNIQUE ID ----------

function makeId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2)
    );
}


// ---------- GET TODAY'S DATE ----------

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ---------- FORMAT DATE ----------

function formatDate(dateString) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// ---------- FOLLOW-UP REMINDERS ----------

function getFollowUpInfo(dateString) {
    if (!dateString) {
        return {
            label: "No follow-up",
            className: "follow-up-none"
        };
    }

    const today = getTodayDate();

    if (dateString < today) {
        return {
            label: `Overdue · ${formatDate(dateString)}`,
            className: "follow-up-overdue"
        };
    }

    if (dateString === today) {
        return {
            label: `Due today · ${formatDate(dateString)}`,
            className: "follow-up-today"
        };
    }

    return {
        label: `Upcoming · ${formatDate(dateString)}`,
        className: "follow-up-upcoming"
    };
}


// ---------- OPEN MODAL ----------

function openModal(job = null) {
    if (!jobForm || !jobModal) {
        console.error("Job form or modal could not be found.");
        return;
    }

    jobForm.reset();

    editingJobId = job ? job.id : null;

    if (job) {
        if (companyInput) {
            companyInput.value = job.company || "";
        }

        if (roleInput) {
            roleInput.value = job.role || "";
        }

        if (appliedDateInput) {
            appliedDateInput.value = job.appliedDate || "";
        }

        if (statusInput) {
            statusInput.value = job.status || "Applied";
        }

        if (followUpInput) {
            followUpInput.value = job.followUp || "";
        }

        if (jobLinkInput) {
            jobLinkInput.value = job.jobLink || "";
        }

        if (notesInput) {
            notesInput.value = job.notes || "";
        }

        if (modalTitle) {
            modalTitle.textContent = "Edit Application";
        }

        if (saveJobBtn) {
            saveJobBtn.textContent = "Save Changes";
        }
    } else {
        if (appliedDateInput) {
            appliedDateInput.value = getTodayDate();
        }

        if (statusInput) {
            statusInput.value = "Applied";
        }

        if (modalTitle) {
            modalTitle.textContent = "Add Application";
        }

        if (saveJobBtn) {
            saveJobBtn.textContent = "Save Application";
        }
    }

    jobModal.classList.add("active");

    document.body.style.overflow = "hidden";
}


// ---------- CLOSE MODAL ----------

function closeModal() {
    if (!jobModal) {
        return;
    }

    jobModal.classList.remove("active");

    document.body.style.overflow = "";

    editingJobId = null;

    if (jobForm) {
        jobForm.reset();
    }
}


// ---------- MODAL EVENT LISTENERS ----------

if (addJobBtn) {
    addJobBtn.addEventListener("click", () => {
        openModal();
    });
}

if (emptyAddBtn) {
    emptyAddBtn.addEventListener("click", () => {
        openModal();
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
}


// Close modal when clicking outside the form

if (jobModal) {
    jobModal.addEventListener("click", event => {
        if (event.target === jobModal) {
            closeModal();
        }
    });
}


// Close modal with Escape key

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        jobModal &&
        jobModal.classList.contains("active")
    ) {
        closeModal();
    }
});


// ---------- ADD OR EDIT APPLICATION ----------

if (jobForm) {
    jobForm.addEventListener("submit", event => {
        event.preventDefault();

        const company = companyInput?.value.trim() || "";
        const role = roleInput?.value.trim() || "";
        const appliedDate = appliedDateInput?.value || "";
        const status = statusInput?.value || "Applied";
        const followUp = followUpInput?.value || "";
        const jobLink = jobLinkInput?.value.trim() || "";
        const notes = notesInput?.value.trim() || "";

        // Validate required fields

        if (!company || !role || !appliedDate) {
            alert(
                "Please fill in the company, role, and application date."
            );

            return;
        }

        // Validate job link if provided

        if (jobLink) {
            try {
                const parsedUrl = new URL(jobLink);

                if (
                    parsedUrl.protocol !== "https:" &&
                    parsedUrl.protocol !== "http:"
                ) {
                    throw new Error("Invalid URL protocol");
                }
            } catch {
                alert(
                    "Please enter a valid job link beginning with http:// or https://."
                );

                return;
            }
        }

        const validStatuses = [
            "Applied",
            "Assessment",
            "Interview",
            "Offer",
            "Rejected"
        ];

        if (!validStatuses.includes(status)) {
            alert("Please select a valid application status.");

            return;
        }

        const applicationData = {
            company,
            role,
            appliedDate,
            status,
            followUp,
            jobLink,
            notes
        };

        if (editingJobId) {
            // Update existing application

            const jobIndex = jobs.findIndex(
                job => job.id === editingJobId
            );

            if (jobIndex === -1) {
                alert("This application could not be found.");
                closeModal();
                return;
            }

            const updatedJob = {
                ...jobs[jobIndex],
                ...applicationData
            };

            jobs[jobIndex] = updatedJob;
        } else {
            // Create new application

            const newJob = {
                id: makeId(),
                ...applicationData,
                createdAt: new Date().toISOString()
            };

            jobs.unshift(newJob);
        }

        // Keep changes only if saving succeeds

        if (!saveJobs()) {
            return;
        }

        closeModal();

        renderJobs();
    });
}


// ---------- DELETE APPLICATION ----------

function deleteJob(jobId) {
    const job = jobs.find(item => item.id === jobId);

    if (!job) {
        return;
    }

    const confirmed = confirm(
        `Delete the application for ${job.company}?`
    );

    if (!confirmed) {
        return;
    }

    const previousJobs = [...jobs];

    jobs = jobs.filter(item => item.id !== jobId);

    if (!saveJobs()) {
        jobs = previousJobs;
        renderJobs();
        return;
    }

    renderJobs();
}


// ---------- CREATE TABLE CELL ----------

function createCell(text) {
    const cell = document.createElement("td");

    cell.textContent = text || "—";

    return cell;
}


// ---------- CREATE COMPANY CELL ----------

function createCompanyCell(job) {
    const cell = document.createElement("td");

    const companyName = document.createElement("div");

    companyName.className = "company-name";
    companyName.textContent = job.company || "Unnamed company";

    const roleName = document.createElement("div");

    roleName.className = "company-role";
    roleName.textContent = job.role || "—";

    cell.append(companyName, roleName);

    return cell;
}


// ---------- CREATE STATUS CELL ----------

function createStatusCell(status) {
    const cell = document.createElement("td");

    const badge = document.createElement("span");

    const statusClasses = {
        Applied: "status-applied",
        Assessment: "status-assessment",
        Interview: "status-interview",
        Offer: "status-offer",
        Rejected: "status-rejected"
    };

    badge.className =
        `status-badge ${statusClasses[status] || "status-applied"}`;

    badge.textContent = status || "Applied";

    cell.appendChild(badge);

    return cell;
}


// ---------- CREATE FOLLOW-UP CELL ----------

function createFollowUpCell(dateString) {
    const cell = document.createElement("td");

    const followUpInfo = getFollowUpInfo(dateString);

    const badge = document.createElement("span");

    badge.className =
        `follow-up-badge ${followUpInfo.className}`;

    badge.textContent = followUpInfo.label;

    cell.appendChild(badge);

    return cell;
}


// ---------- CREATE ACTION BUTTONS ----------

function createActionsCell(job) {
    const cell = document.createElement("td");

    const actions = document.createElement("div");

    actions.className = "action-buttons";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "action-btn edit-btn";
    editButton.textContent = "Edit";
    editButton.setAttribute(
        "aria-label",
        `Edit ${job.company} application`
    );

    editButton.addEventListener("click", () => {
        openModal(job);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
        "aria-label",
        `Delete ${job.company} application`
    );

    deleteButton.addEventListener("click", () => {
        deleteJob(job.id);
    });

    actions.append(editButton, deleteButton);

    // Add an optional link to the job listing

    if (job.jobLink) {
        const link = document.createElement("a");

        link.className = "action-btn link-btn";
        link.textContent = "View";
        link.href = job.jobLink;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        actions.appendChild(link);
    }

    cell.appendChild(actions);

    return cell;
}


// ---------- SORT APPLICATIONS ----------

function sortJobs(jobList) {
    const sortMode = sortSelect?.value || "newest";

    return [...jobList].sort((a, b) => {
        if (sortMode === "oldest") {
            return (a.appliedDate || "")
                .localeCompare(b.appliedDate || "");
        }

        if (sortMode === "company") {
            return (a.company || "")
                .localeCompare(b.company || "");
        }

        if (sortMode === "followup") {
            const dateA = a.followUp || "9999-12-31";
            const dateB = b.followUp || "9999-12-31";

            return dateA.localeCompare(dateB);
        }

        // Newest first by default

        return (b.appliedDate || "")
            .localeCompare(a.appliedDate || "");
    });
}


// ---------- UPDATE DASHBOARD STATISTICS ----------

function updateStatistics() {
    const total = jobs.length;

    const interviews = jobs.filter(
        job => job.status === "Interview"
    ).length;

    const offers = jobs.filter(
        job => job.status === "Offer"
    ).length;

    // Response rate = interviews + offers / total applications

    const responses = jobs.filter(
        job =>
            job.status === "Interview" ||
            job.status === "Offer"
    ).length;

    const responseRate = total > 0
        ? Math.round((responses / total) * 100)
        : 0;

    if (totalApplicationsEl) {
        totalApplicationsEl.textContent = total;
    }

    if (totalInterviewsEl) {
        totalInterviewsEl.textContent = interviews;
    }

    if (totalOffersEl) {
        totalOffersEl.textContent = offers;
    }

    if (responseRateEl) {
        responseRateEl.textContent = `${responseRate}%`;
    }

    if (responseProgressEl) {
        responseProgressEl.style.width = `${responseRate}%`;
    }

    // Support older dashboard counter IDs if they still exist

    const legacyTotal = document.getElementById("totalJobs");
    const legacyInterviews = document.getElementById("interviewCount");
    const legacyOffers = document.getElementById("offerCount");

    if (legacyTotal) {
        legacyTotal.textContent = total;
    }

    if (legacyInterviews) {
        legacyInterviews.textContent = interviews;
    }

    if (legacyOffers) {
        legacyOffers.textContent = offers;
    }
}


// ---------- UPDATE STATUS FILTER COUNTS ----------

function updateFilterCounts() {
    const counts = {
        All: jobs.length,
        Applied: 0,
        Assessment: 0,
        Interview: 0,
        Offer: 0,
        Rejected: 0
    };

    jobs.forEach(job => {
        if (Object.prototype.hasOwnProperty.call(counts, job.status)) {
            counts[job.status]++;
        }
    });

    const countElements = {
        All: document.getElementById("countAll"),
        Applied: document.getElementById("countApplied"),
        Assessment: document.getElementById("countAssessment"),
        Interview: document.getElementById("countInterview"),
        Offer: document.getElementById("countOffer"),
        Rejected: document.getElementById("countRejected")
    };

    Object.entries(countElements).forEach(([status, element]) => {
        if (element) {
            element.textContent = counts[status];
        }
    });
}


// ---------- RENDER APPLICATIONS ----------

function renderJobs() {
    if (!jobTableBody) {
        console.error("Could not find jobTableBody in index.html.");
        return;
    }

    const searchTerm = (
        searchInput?.value || ""
    ).trim().toLowerCase();

    // Search and status filtering

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = [
            job.company,
            job.role,
            job.status,
            job.notes
        ].some(value =>
            String(value || "")
                .toLowerCase()
                .includes(searchTerm)
        );

        const matchesStatus =
            activeStatus === "All" ||
            job.status === activeStatus;

        return matchesSearch && matchesStatus;
    });

    // Apply sorting after filtering

    const sortedJobs = sortJobs(filteredJobs);

    // Clear previous rows

    jobTableBody.replaceChildren();

    // Empty-state handling

    if (emptyState) {
        emptyState.style.display =
            sortedJobs.length === 0 ? "" : "none";

        if (sortedJobs.length === 0) {
            const emptyMessage = emptyState.querySelector(
                "[data-empty-message]"
            );

            if (emptyMessage) {
                if (jobs.length === 0) {
                    emptyMessage.textContent =
                        "No applications yet. Add your first application to get started.";
                } else {
                    emptyMessage.textContent =
                        "No applications match your search or selected filter.";
                }
            }
        }
    }

    // Render each application

    sortedJobs.forEach(job => {
        const row = document.createElement("tr");

        const companyCell = createCompanyCell(job);

        const dateCell = createCell(
            formatDate(job.appliedDate)
        );

        const statusCell = createStatusCell(
            job.status
        );

        const followUpCell = createFollowUpCell(
            job.followUp
        );

        const actionsCell = createActionsCell(job);

        row.append(
            companyCell,
            dateCell,
            statusCell,
            followUpCell,
            actionsCell
        );

        jobTableBody.appendChild(row);
    });

    // Refresh statistics and filter counts

    updateStatistics();
    updateFilterCounts();
}


// ---------- SEARCH LISTENER ----------

if (searchInput) {
    searchInput.addEventListener("input", renderJobs);
}


// ---------- SORT LISTENER ----------

if (sortSelect) {
    sortSelect.addEventListener("change", renderJobs);
}


// ---------- STATUS FILTER LISTENER ----------

if (filterBar) {
    filterBar.addEventListener("click", event => {
        const button = event.target.closest(
            "[data-status]"
        );

        if (!button || !filterBar.contains(button)) {
            return;
        }

        activeStatus = button.dataset.status || "All";

        // Update active button styling

        filterBar.querySelectorAll("[data-status]").forEach(
            filterButton => {
                const isActive =
                    filterButton.dataset.status === activeStatus;

                filterButton.classList.toggle(
                    "active",
                    isActive
                );

                filterButton.setAttribute(
                    "aria-pressed",
                    String(isActive)
                );
            }
        );

        renderJobs();
    });
}


// ---------- INITIALIZE APP ----------

renderJobs();
// Nini's JobTracker — Export applications to CSV
document.getElementById("exportBtn")?.addEventListener("click", function () {
    const STORAGE_KEY = "midnightJobTracker";

    let applications = [];

    try {
        applications = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        alert("Unable to read your saved applications.");
        return;
    }

    if (!Array.isArray(applications) || applications.length === 0) {
        alert("No applications to export yet!");
        return;
    }

    const columns = [
        ["Company", "company"],
        ["Role", "role"],
        ["Applied Date", "appliedDate"],
        ["Status", "status"],
        ["Follow-up Date", "followUp"],
        ["Job Link", "jobLink"],
        ["Notes", "notes"]
    ];

    function escapeCSV(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const rows = [
        columns.map(column => escapeCSV(column[0])),
        ...applications.map(application =>
            columns.map(column => escapeCSV(application[column[1]]))
        )
    ];

    const csv = "\uFEFF" + rows.map(row => row.join(",")).join("\r\n");
    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ninis-job-applications.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});
/* Nini's JobTracker — CV & Resume Manager */

(function () {
    const uploadInput = document.getElementById("resumeUpload");
    const resumeList = document.getElementById("resumeList");
    const resumeMessage = document.getElementById("resumeMessage");

    if (!uploadInput || !resumeList || !resumeMessage) return;

    const DB_NAME = "NinisJobTrackerFiles";
    const STORE_NAME = "resumes";
    let db;

    function showMessage(message) {
        resumeMessage.textContent = message;
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);

            request.onupgradeneeded = function () {
                const database = request.result;

                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, {
                        keyPath: "id",
                        autoIncrement: true
                    });
                }
            };

            request.onsuccess = function () {
                db = request.result;
                resolve(db);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    function getAllResumes() {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function saveResume(file) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");

            transaction.objectStore(STORE_NAME).add({
                name: file.name,
                type: file.type,
                size: file.size,
                file: file,
                uploadedAt: new Date().toISOString()
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    }

    function deleteResume(id) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).delete(id);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    function downloadResume(resume) {
        const url = URL.createObjectURL(resume.file);
        const link = document.createElement("a");

        link.href = url;
        link.download = resume.name;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function formatSize(bytes) {
        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function createButton(label, className, handler) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = className;
        button.textContent = label;
        button.addEventListener("click", handler);

        return button;
    }

    async function renderResumes() {
        const resumes = await getAllResumes();

        resumeList.replaceChildren();

        if (!resumes.length) {
            const empty = document.createElement("p");
            empty.textContent = "No resumes uploaded yet.";
            empty.style.color = "#777";
            empty.style.fontSize = "12px";
            resumeList.appendChild(empty);
            return;
        }

        resumes.forEach(function (resume) {
            const card = document.createElement("article");

            Object.assign(card.style, {
                padding: "16px",
                background: "#101010",
                border: "1px solid #292929",
                borderRadius: "13px",
                minWidth: "0"
            });

            const icon = document.createElement("div");
            icon.textContent = "PDF / DOC";
            icon.style.cssText = "color:#c7ff5e;font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:10px;";

            const name = document.createElement("h4");
            name.textContent = resume.name;
            name.title = resume.name;
            name.style.cssText = "font-size:13px;overflow-wrap:anywhere;margin-bottom:6px;";

            const info = document.createElement("p");
            info.textContent = formatSize(resume.size);
            info.style.cssText = "color:#888;font-size:11px;margin-bottom:14px;";

            const actions = document.createElement("div");
            actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;";

            actions.appendChild(
                createButton("Download", "btn btn-secondary", function () {
                    downloadResume(resume);
                })
            );

            actions.appendChild(
                createButton("Delete", "btn btn-danger", async function () {
                    if (!confirm("Delete " + resume.name + "?")) return;

                    try {
                        await deleteResume(resume.id);
                        showMessage("Resume deleted.");
                        await renderResumes();
                    } catch (error) {
                        showMessage("Could not delete this resume.");
                    }
                })
            );

            card.append(icon, name, info, actions);
            resumeList.appendChild(card);
        });
    }

    uploadInput.addEventListener("change", async function () {
        const files = Array.from(uploadInput.files || []);
        if (!files.length) return;

        const allowedExtensions = /\.(pdf|doc|docx)$/i;
        const maxSize = 10 * 1024 * 1024;

        try {
            for (const file of files) {
                if (!allowedExtensions.test(file.name)) {
                    showMessage("Unsupported file: " + file.name);
                    continue;
                }

                if (file.size > maxSize) {
                    showMessage(file.name + " is larger than 10 MB.");
                    continue;
                }

                await saveResume(file);
                showMessage(file.name + " uploaded successfully.");
            }

            await renderResumes();
        } catch (error) {
            showMessage("Upload failed. Please check browser storage permissions.");
        } finally {
            uploadInput.value = "";
        }
    });

    openDatabase()
        .then(renderResumes)
        .catch(function () {
            showMessage("Resume storage is unavailable in this browser.");
        });
})();

// Nini's JobTracker — Interview Prep Studio
(function () {
    const STORAGE_KEY = "ninisInterviewPrep";

    const form = document.getElementById("prepForm");
    const list = document.getElementById("prepList");
    const search = document.getElementById("prepSearch");
    const message = document.getElementById("prepMessage");
    const progress = document.getElementById("prepProgress");

    // Safely stop if the Interview Prep HTML has not been added.
    if (!form || !list || !search || !message || !progress) return;

    let questions = [];

    function showMessage(text) {
        message.textContent = text;
    }

    function loadQuestions() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            questions = Array.isArray(saved) ? saved : [];
        } catch (error) {
            questions = [];
            showMessage("Could not read saved preparation notes.");
        }
    }

    function saveQuestions() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
            return true;
        } catch (error) {
            showMessage("Could not save. Browser storage may be full or unavailable.");
            return false;
        }
    }

    function makeElement(tag, text, css) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (css) element.style.cssText = css;
        return element;
    }

    function makeButton(text, css, handler) {
        const button = makeElement("button", text, css);
        button.type = "button";
        button.addEventListener("click", handler);
        return button;
    }

    function renderQuestions() {
        const query = search.value.trim().toLowerCase();

        const filtered = questions.filter(function (item) {
            return [
                item.company,
                item.role,
                item.round,
                item.category,
                item.question,
                item.answer
            ].some(function (value) {
                return String(value || "").toLowerCase().includes(query);
            });
        });

        const preparedCount = questions.filter(item => item.prepared).length;
        const percentage = questions.length
            ? Math.round((preparedCount / questions.length) * 100)
            : 0;

        progress.textContent = percentage + "%";
        list.replaceChildren();

        if (!filtered.length) {
            list.appendChild(makeElement(
                "p",
                questions.length
                    ? "No matching questions. Try a different search."
                    : "No questions saved yet. Add your first interview question above.",
                "color:#777; font-size:13px; padding:12px 0;"
            ));
            return;
        }

        filtered.forEach(function (item) {
            const card = makeElement(
                "article",
                undefined,
                "background:#101010; border:1px solid " +
                    (item.prepared ? "#42552a" : "#292929") +
                    "; border-radius:14px; padding:18px; min-width:0;"
            );

            const tags = makeElement(
                "p",
                item.company + (item.role ? " · " + item.role : ""),
                "color:#c7ff5e; font-size:12px; font-weight:700; margin:0 0 9px; overflow-wrap:anywhere;"
            );

            const meta = makeElement(
                "p",
                item.round + "  /  " + item.category,
                "color:#888; font-size:11px; margin:0 0 15px;"
            );

            const questionTitle = makeElement(
                "h4",
                item.question,
                "font-size:14px; line-height:1.6; margin:0 0 12px; overflow-wrap:anywhere;"
            );

            card.append(tags, meta, questionTitle);

            if (item.answer && item.answer.trim()) {
                const answerLabel = makeElement(
                    "p",
                    "YOUR ANSWER / NOTES",
                    "font-size:10px; letter-spacing:1px; color:#888; margin:0 0 6px;"
                );

                const answer = makeElement(
                    "p",
                    item.answer,
                    "white-space:pre-wrap; overflow-wrap:anywhere; color:#ccc; font-size:12px; line-height:1.7; margin:0 0 16px;"
                );

                card.append(answerLabel, answer);
            } else {
                card.appendChild(makeElement(
                    "p",
                    "No answer added yet.",
                    "color:#777; font-size:12px; margin:0 0 16px;"
                ));
            }

            const status = makeElement(
                "p",
                item.prepared ? "✓ Prepared" : "○ Needs revision",
                "color:" + (item.prepared ? "#c7ff5e" : "#aaa") +
                    "; font-size:11px; margin:0 0 14px;"
            );

            const actions = makeElement(
                "div",
                undefined,
                "display:flex; gap:8px; flex-wrap:wrap;"
            );

            const toggleButton = makeButton(
                item.prepared ? "Mark for revision" : "Mark prepared",
                "cursor:pointer; border:1px solid #c7ff5e; border-radius:8px; padding:9px 11px; background:transparent; color:#c7ff5e; font-size:11px;",
                function () {
                    const previous = item.prepared;
                    item.prepared = !previous;

                    if (saveQuestions()) {
                        showMessage(item.prepared
                            ? "Question marked as prepared."
                            : "Question marked for revision.");
                        renderQuestions();
                    } else {
                        item.prepared = previous;
                    }
                }
            );

            const deleteButton = makeButton(
                "Delete",
                "cursor:pointer; border:1px solid #633838; border-radius:8px; padding:9px 13px; background:transparent; color:#ff8e8e; font-size:11px;",
                function () {
                    if (!confirm("Delete this interview question?")) return;

                    const oldQuestions = questions;
                    questions = questions.filter(q => q.id !== item.id);

                    if (saveQuestions()) {
                        showMessage("Question deleted.");
                        renderQuestions();
                    } else {
                        questions = oldQuestions;
                    }
                }
            );

            actions.append(toggleButton, deleteButton);
            card.append(status, actions);
            list.appendChild(card);
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const company = document.getElementById("prepCompany").value.trim();
        const role = document.getElementById("prepRole").value.trim();
        const round = document.getElementById("prepRound").value;
        const category = document.getElementById("prepCategory").value;
        const question = document.getElementById("prepQuestion").value.trim();
        const answer = document.getElementById("prepAnswer").value.trim();

        if (!company || !question) {
            showMessage("Please enter a company and interview question.");
            return;
        }

        const newQuestion = {
            id: (typeof crypto !== "undefined" && crypto.randomUUID)
                ? crypto.randomUUID()
                : Date.now().toString() + Math.random().toString(16).slice(2),
            company,
            role,
            round,
            category,
            question,
            answer,
            prepared: false,
            createdAt: new Date().toISOString()
        };

        questions.unshift(newQuestion);

        if (!saveQuestions()) {
            questions.shift();
            return;
        }

        form.reset();
        showMessage("Interview question saved successfully.");
        renderQuestions();
    });

    search.addEventListener("input", renderQuestions);

    loadQuestions();
    renderQuestions();
})();

// Nini's JobTracker — Salary & Offer Comparison
(function () {
    const KEY = "ninisJobOffers";
    const $ = id => document.getElementById(id);

    const form = $("offerForm");
    const list = $("offerList");
    const message = $("offerMessage");

    // Safe to keep in script.js even before the HTML section is added.
    if (!form || !list || !message) return;

    const fieldIds = [
        "offerCompany", "offerRole", "offerCtc", "offerFixed",
        "offerVariable", "offerBonus", "offerLocation", "offerMode",
        "offerStatus", "offerDate", "offerBenefits",
        "offerRatingSalary", "offerRatingLearning",
        "offerRatingBalance", "offerRatingGrowth"
    ];

    let offers = [];
    let selected = new Set();

    function say(text) {
        message.textContent = text;
    }

    function load() {
        try {
            const data = JSON.parse(localStorage.getItem(KEY) || "[]");
            offers = Array.isArray(data) ? data : [];
        } catch (error) {
            offers = [];
            say("Could not read saved offers from browser storage.");
        }
    }

    function persist() {
        try {
            localStorage.setItem(KEY, JSON.stringify(offers));
            return true;
        } catch (error) {
            say("Could not save. Browser storage may be full or unavailable.");
            return false;
        }
    }

    function el(tag, text, css) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (css) node.style.cssText = css;
        return node;
    }

    function button(text, handler, danger = false) {
        const node = el("button", text);
        node.type = "button";
        node.style.cssText =
            "padding:9px 11px;border-radius:8px;cursor:pointer;font-size:11px;" +
            (danger
                ? "background:transparent;color:#ff9999;border:1px solid #633838;"
                : "background:#171717;color:#c7ff5e;border:1px solid #393939;");
        node.addEventListener("click", handler);
        return node;
    }

    function num(id) {
        const value = $(id).value.trim();
        return value === "" ? null : Number(value);
    }

    function score(offer) {
        return (
            offer.ratingSalary +
            offer.ratingLearning +
            offer.ratingBalance +
            offer.ratingGrowth
        ) / 4;
    }

    function moneyLakh(value) {
        if (value === null || value === undefined || value === "") return "Not entered";
        return "₹" + Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " L";
    }

    function annualMonthly(value) {
        if (value === null || value === undefined || value === "") return "Not entered";
        return "₹" + Math.round(Number(value) * 100000 / 12).toLocaleString("en-IN");
    }

    function resetForm() {
        form.reset();
        $("offerEditId").value = "";
        $("offerFormTitle").textContent = "＋ Add a job offer";
        $("offerSaveBtn").textContent = "Save offer";
        $("offerCancelEditBtn").hidden = true;
    }

    function startEdit(offer) {
        $("offerEditId").value = offer.id;
        $("offerCompany").value = offer.company;
        $("offerRole").value = offer.role;
        $("offerCtc").value = offer.ctc;
        $("offerFixed").value = offer.fixed ?? "";
        $("offerVariable").value = offer.variable ?? "";
        $("offerBonus").value = offer.bonus ?? "";
        $("offerLocation").value = offer.location;
        $("offerMode").value = offer.mode;
        $("offerStatus").value = offer.status;
        $("offerDate").value = offer.date;
        $("offerBenefits").value = offer.benefits;
        $("offerRatingSalary").value = offer.ratingSalary;
        $("offerRatingLearning").value = offer.ratingLearning;
        $("offerRatingBalance").value = offer.ratingBalance;
        $("offerRatingGrowth").value = offer.ratingGrowth;

        $("offerFormTitle").textContent = "Edit offer";
        $("offerSaveBtn").textContent = "Update offer";
        $("offerCancelEditBtn").hidden = false;
        $("offerComparisonSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function render() {
        const query = $("offerSearch").value.trim().toLowerCase();
        const visible = offers.filter(offer =>
            [offer.company, offer.role, offer.location, offer.status]
                .some(value => String(value || "").toLowerCase().includes(query))
        );

        $("offerTotal").textContent = offers.length;

        const highest = offers.length
            ? Math.max(...offers.map(offer => Number(offer.ctc)))
            : null;
        $("offerHighest").textContent =
            highest === null ? "—" : moneyLakh(highest);

        const top = [...offers].sort((a, b) =>
            score(b) - score(a) || Number(b.ctc) - Number(a.ctc)
        )[0];
        $("offerTopRated").textContent =
            top ? top.company + " · " + score(top).toFixed(1) + "/5" : "—";

        selected = new Set([...selected].filter(id =>
            offers.some(offer => offer.id === id)
        ));
        $("offerSelectedCount").textContent = selected.size + " offers selected";

        list.replaceChildren();

        if (!visible.length) {
            list.appendChild(el(
                "p",
                offers.length ? "No matching offers found." : "No offers added yet. Add your first offer above.",
                "color:#777;font-size:13px;padding:10px 0;"
            ));
            return;
        }

        visible.forEach(offer => {
            const card = el("article", undefined,
                "background:#101010;border:1px solid #292929;border-radius:14px;padding:18px;min-width:0;");

            const pickLabel = el("label", undefined,
                "display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-bottom:15px;cursor:pointer;");
            const pick = document.createElement("input");
            pick.type = "checkbox";
            pick.checked = selected.has(offer.id);
            pick.setAttribute("aria-label", "Select " + offer.company + " for comparison");
            pick.addEventListener("change", () => {
                if (pick.checked && selected.size >= 3) {
                    pick.checked = false;
                    say("You can compare up to three offers at a time.");
                    return;
                }
                if (pick.checked) selected.add(offer.id);
                else selected.delete(offer.id);
                render();
            });
            pickLabel.append(pick, document.createTextNode("Select to compare"));

            const company = el("h3", offer.company,
                "color:#c7ff5e;font-size:18px;margin:0 0 5px;overflow-wrap:anywhere;");
            const role = el("p", offer.role,
                "color:#bbb;font-size:12px;margin:0 0 13px;overflow-wrap:anywhere;");

            const ctcLabel = el("p", "ANNUAL CTC",
                "color:#888;font-size:10px;letter-spacing:1px;margin:0 0 5px;");
            const ctc = el("p", moneyLakh(offer.ctc),
                "font-size:25px;font-weight:700;margin:0 0 5px;");
            const monthly = el("p",
                "Fixed-pay monthly gross: " + annualMonthly(offer.fixed),
                "color:#aaa;font-size:11px;margin:0 0 14px;");

            const divider = el("div", undefined,
                "height:1px;background:#292929;margin:14px 0;");

            const detail = el("div", undefined,
                "display:grid;grid-template-columns:1fr 1fr;gap:12px;");
            [
                ["Fixed pay", moneyLakh(offer.fixed)],
                ["Variable pay", moneyLakh(offer.variable)],
                ["Joining bonus", moneyLakh(offer.bonus)],
                ["Location", offer.location || "Not entered"],
                ["Work mode", offer.mode],
                ["Status", offer.status],
                ["Decision / joining", offer.date || "Not entered"],
                ["Personal score", score(offer).toFixed(1) + " / 5"]
            ].forEach(([label, value]) => {
                const cell = el("div");
                cell.append(
                    el("p", label, "color:#888;font-size:10px;margin:0 0 5px;"),
                    el("p", value, "color:#ddd;font-size:12px;margin:0;overflow-wrap:anywhere;")
                );
                detail.appendChild(cell);
            });

            card.append(pickLabel, company, role, ctcLabel, ctc, monthly, divider, detail);

            if (offer.benefits) {
                card.append(
                    el("p", "Benefits & notes",
                        "color:#888;font-size:11px;margin:16px 0 6px;"),
                    el("p", offer.benefits,
                        "color:#ccc;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;margin:0 0 14px;")
                );
            }

            const actions = el("div", undefined,
                "display:flex;gap:8px;flex-wrap:wrap;margin-top:17px;");
            actions.append(
                button("Edit", () => startEdit(offer)),
                button("Delete", () => {
                    if (!confirm("Delete the offer from " + offer.company + "?")) return;
                    const previous = offers;
                    offers = offers.filter(item => item.id !== offer.id);
                    selected.delete(offer.id);
                    if (persist()) {
                        say("Offer deleted.");
                        $("offerCompareResult").replaceChildren();
                        render();
                    } else {
                        offers = previous;
                        render();
                    }
                }, true)
            );
            card.appendChild(actions);
            list.appendChild(card);
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const ctc = num("offerCtc");
        const fixed = num("offerFixed");
        const variable = num("offerVariable");
        const bonus = num("offerBonus");

        if (!Number.isFinite(ctc) || ctc < 0 ||
            [fixed, variable, bonus].some(value =>
                value !== null && (!Number.isFinite(value) || value < 0)
            )) {
            say("Please enter valid, non-negative salary figures.");
            return;
        }

        const editId = $("offerEditId").value;
        const existing = offers.find(offer => offer.id === editId);

        const record = {
            id: editId || (
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : Date.now().toString() + Math.random().toString(16).slice(2)
            ),
            company: $("offerCompany").value.trim(),
            role: $("offerRole").value.trim(),
            ctc,
            fixed,
            variable,
            bonus,
            location: $("offerLocation").value.trim(),
            mode: $("offerMode").value,
            status: $("offerStatus").value,
            date: $("offerDate").value,
            benefits: $("offerBenefits").value.trim(),
            ratingSalary: Number($("offerRatingSalary").value),
            ratingLearning: Number($("offerRatingLearning").value),
            ratingBalance: Number($("offerRatingBalance").value),
            ratingGrowth: Number($("offerRatingGrowth").value),
            createdAt: existing ? existing.createdAt : new Date().toISOString()
        };

        if (!record.company || !record.role) {
            say("Please enter a company and role.");
            return;
        }

        const previous = offers;
        if (existing) {
            offers = offers.map(offer => offer.id === editId ? record : offer);
        } else {
            offers = [record, ...offers];
        }

        if (!persist()) {
            offers = previous;
            return;
        }

        resetForm();
        say(existing ? "Offer updated successfully." : "Offer saved successfully.");
        render();
    });

    $("offerCancelEditBtn").addEventListener("click", resetForm);
    $("offerSearch").addEventListener("input", render);

    $("offerClearCompareBtn").addEventListener("click", function () {
        selected.clear();
        $("offerCompareResult").replaceChildren();
        render();
        say("Comparison selection cleared.");
    });

    $("offerCompareBtn").addEventListener("click", function () {
        const chosen = offers.filter(offer => selected.has(offer.id));
        const result = $("offerCompareResult");
        result.replaceChildren();

        if (chosen.length < 2) {
            say("Select at least two offers to compare.");
            return;
        }

        const table = el("table", undefined,
            "width:100%;border-collapse:collapse;background:#101010;border:1px solid #292929;border-radius:12px;overflow:hidden;font-size:12px;");
        const head = el("tr");
        [ "Comparison", ...chosen.map(offer => offer.company) ].forEach(text => {
            head.appendChild(el("th", text,
                "text-align:left;padding:12px;background:#191919;color:#c7ff5e;border-bottom:1px solid #333;overflow-wrap:anywhere;"));
        });
        const thead = document.createElement("thead");
        thead.appendChild(head);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const rows = [
            ["Role", offer => offer.role],
            ["Annual CTC", offer => moneyLakh(offer.ctc)],
            ["Fixed pay", offer => moneyLakh(offer.fixed)],
            ["Variable pay", offer => moneyLakh(offer.variable)],
            ["Joining bonus", offer => moneyLakh(offer.bonus)],
            ["Fixed monthly gross (estimate)", offer => annualMonthly(offer.fixed)],
            ["Location", offer => offer.location || "Not entered"],
            ["Work mode", offer => offer.mode],
            ["Status", offer => offer.status],
            ["Decision / joining date", offer => offer.date || "Not entered"],
            ["Salary rating", offer => offer.ratingSalary + "/5"],
            ["Learning rating", offer => offer.ratingLearning + "/5"],
            ["Work-life balance", offer => offer.ratingBalance + "/5"],
            ["Career growth", offer => offer.ratingGrowth + "/5"],
            ["Personal score", offer => score(offer).toFixed(1) + "/5"],
            ["Benefits / notes", offer => offer.benefits || "Not entered"]
        ];

        rows.forEach(([label, getValue]) => {
            const tr = document.createElement("tr");
            tr.appendChild(el("td", label,
                "padding:12px;color:#aaa;border-bottom:1px solid #292929;vertical-align:top;"));
            chosen.forEach(offer => {
                tr.appendChild(el("td", getValue(offer),
                    "padding:12px;color:#eee;border-bottom:1px solid #292929;vertical-align:top;white-space:pre-wrap;overflow-wrap:anywhere;"));
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        const wrapper = el("div", undefined, "overflow-x:auto;border-radius:12px;");
        wrapper.appendChild(table);
        result.appendChild(wrapper);
        say("Comparison ready. Review the full package and your priorities before deciding.");
    });

    function csvCell(value) {
        let text = String(value ?? "");
        if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
        return '"' + text.replace(/"/g, '""') + '"';
    }

    $("offerExportBtn").addEventListener("click", function () {
        if (!offers.length) {
            say("Add an offer before exporting.");
            return;
        }

        const columns = [
            ["Company", "company"], ["Role", "role"],
            ["Annual CTC (lakh INR)", "ctc"],
            ["Fixed pay (lakh INR)", "fixed"],
            ["Variable pay (lakh INR)", "variable"],
            ["Joining bonus (lakh INR)", "bonus"],
            ["Location", "location"], ["Work mode", "mode"],
            ["Status", "status"], ["Decision / joining date", "date"],
            ["Benefits / notes", "benefits"],
            ["Salary rating", "ratingSalary"],
            ["Learning rating", "ratingLearning"],
            ["Work-life balance rating", "ratingBalance"],
            ["Career growth rating", "ratingGrowth"]
        ];

        const csv = "\uFEFF" + [
            columns.map(column => csvCell(column[0])),
            ...offers.map(offer =>
                columns.map(column => csvCell(offer[column[1]]))
            )
        ].map(row => row.join(",")).join("\r\n");

        const url = URL.createObjectURL(
            new Blob([csv], { type: "text/csv;charset=utf-8;" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "ninis-salary-offers.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        say("Your offer comparison CSV has been exported.");
    });

    load();
    render();
})();

// Nini's JobTracker — My Career Profile
(function () {
    const KEY = "ninisCareerProfile";
    const $ = id => document.getElementById(id);

    const form = $("careerProfileForm");
    if (!form) return;

    const profileMessage = $("careerProfileMessage");
    const projectMessage = $("careerProjectMessage");
    const projectList = $("careerProjectList");

    const textFields = [
        "careerName", "careerHeadline", "careerTargetRole",
        "careerLocation", "careerDegree", "careerCollege",
        "careerGraduation", "careerBio", "careerSkills",
        "careerGithub", "careerLinkedin", "careerPortfolio",
        "careerOtherLink"
    ];

    let projects = [];
    let profileId = null;

    function say(message) {
        profileMessage.textContent = message;
    }

    function projectSay(message) {
        projectMessage.textContent = message;
    }

    function readSavedProfile() {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return {};

            const data = JSON.parse(raw);
            if (!data || typeof data !== "object" || Array.isArray(data)) {
                return {};
            }

            return data;
        } catch (error) {
            say("Could not read the saved profile. Check browser storage.");
            return {};
        }
    }

    function currentProfile() {
        const data = {};

        textFields.forEach(id => {
            data[id] = $(id).value.trim();
        });

        data.projects = projects;
        data.profileId = profileId;
        data.updatedAt = new Date().toISOString();

        return data;
    }

    function saveProfile(showConfirmation = true) {
        const data = currentProfile();

        try {
            localStorage.setItem(KEY, JSON.stringify(data));
            if (showConfirmation) say("Career profile saved successfully.");
            updatePreview(data);
            return true;
        } catch (error) {
            say("Could not save the profile. Browser storage may be full or unavailable.");
            return false;
        }
    }

    function safeWebUrl(value) {
        if (!value) return null;

        try {
            const url = new URL(value);
            if (url.protocol !== "https:" && url.protocol !== "http:") {
                return null;
            }
            return url.href;
        } catch (error) {
            return null;
        }
    }

    function createElement(tag, text, css) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (css) node.style.cssText = css;
        return node;
    }

    function createLink(label, value) {
        const url = safeWebUrl(value);
        if (!url) return null;

        const link = createElement("a", label);
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.cssText =
            "color:#c7ff5e;text-decoration:none;border:1px solid #384627;" +
            "padding:8px 11px;border-radius:8px;font-size:11px;overflow-wrap:anywhere;";
        return link;
    }

    function updatePreview(data) {
        const name = data.careerName || "";
        const headline = data.careerHeadline || data.careerTargetRole || "";
        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join("");

        $("careerInitials").textContent = initials || "N";
        $("careerPreviewName").textContent = name || "Your Name";
        $("careerPreviewHeadline").textContent =
            headline || "Your professional headline";
        $("careerPreviewLocation").textContent =
            [data.careerLocation, data.careerDegree]
                .filter(Boolean)
                .join(" · ") || "Add your location and education";
        $("careerPreviewBio").textContent =
            data.careerBio || "Your introduction will appear here.";

        const completionFields = [
            data.careerName,
            data.careerHeadline || data.careerTargetRole,
            data.careerLocation,
            data.careerDegree,
            data.careerBio,
            data.careerSkills,
            data.careerGithub,
            data.careerLinkedin,
            data.careerPortfolio,
            data.careerCollege
        ];

        const completed = completionFields.filter(value => String(value || "").trim()).length;
        $("careerCompletion").textContent =
            "Profile " + Math.round(completed / completionFields.length * 100) + "% complete";

        const links = $("careerPreviewLinks");
        links.replaceChildren();

        [
            ["GitHub", data.careerGithub],
            ["LinkedIn", data.careerLinkedin],
            ["Portfolio", data.careerPortfolio],
            ["Other link", data.careerOtherLink]
        ].forEach(([label, value]) => {
            const link = createLink(label, value);
            if (link) links.appendChild(link);
        });
    }

    function renderProjects() {
        projectList.replaceChildren();

        if (!projects.length) {
            projectList.appendChild(createElement(
                "p",
                "No projects added yet.",
                "color:#777;font-size:12px;"
            ));
            return;
        }

        projects.forEach(project => {
            const card = createElement(
                "article",
                undefined,
                "background:#080808;border:1px solid #292929;border-radius:12px;padding:15px;min-width:0;"
            );

            card.appendChild(createElement(
                "h4",
                project.name,
                "color:#c7ff5e;font-size:13px;margin:0 0 8px;overflow-wrap:anywhere;"
            ));

            if (project.description) {
                card.appendChild(createElement(
                    "p",
                    project.description,
                    "white-space:pre-wrap;overflow-wrap:anywhere;color:#bbb;font-size:12px;line-height:1.6;margin:0 0 12px;"
                ));
            }

            const url = safeWebUrl(project.url);
            if (url) {
                const link = createLink("View project ↗", url);
                if (link) {
                    link.style.display = "inline-block";
                    card.appendChild(link);
                }
            }

            const remove = createElement("button", "Remove project");
            remove.type = "button";
            remove.style.cssText =
                "display:block;margin-top:13px;padding:7px 10px;background:transparent;" +
                "color:#ff9999;border:1px solid #633838;border-radius:7px;cursor:pointer;font-size:11px;";

            remove.addEventListener("click", function () {
                const index = projects.findIndex(item => item.id === project.id);
                if (index < 0) return;

                const previous = projects;
                projects = projects.filter(item => item.id !== project.id);

                if (saveProfile(false)) {
                    renderProjects();
                    projectSay("Project removed.");
                    say("Your project changes have been saved.");
                } else {
                    projects = previous;
                    renderProjects();
                }
            });

            card.appendChild(remove);
            projectList.appendChild(card);
        });
    }

    function loadProfile() {
        const data = readSavedProfile();
        profileId = data.profileId || null;

        textFields.forEach(id => {
            $(id).value = data[id] == null ? "" : String(data[id]);
        });

        projects = Array.isArray(data.projects)
            ? data.projects.filter(project =>
                project && typeof project.name === "string"
            )
            : [];

        updatePreview(currentProfile());
        renderProjects();
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = $("careerName").value.trim();
        if (!name) {
            say("Please enter your name.");
            return;
        }

        const urlFields = [
            ["careerGithub", "GitHub"],
            ["careerLinkedin", "LinkedIn"],
            ["careerPortfolio", "Portfolio"],
            ["careerOtherLink", "Other link"],
            ["careerProjectUrl", "Project URL"]
        ];

        for (const [id, label] of urlFields) {
            const value = $(id).value.trim();
            if (value && !safeWebUrl(value)) {
                say(label + " must be a valid http:// or https:// URL.");
                $(id).focus();
                return;
            }
        }

        if (!saveProfile()) return;
        renderProjects();
    });

    // Live preview while typing. This does not save every keystroke.
    textFields.forEach(id => {
        $(id).addEventListener("input", function () {
            updatePreview(currentProfile());
        });
    });

    $("careerAddProjectBtn").addEventListener("click", function () {
        const name = $("careerProjectName").value.trim();
        const url = $("careerProjectUrl").value.trim();
        const description = $("careerProjectDescription").value.trim();

        if (!name) {
            projectSay("Enter a project name first.");
            $("careerProjectName").focus();
            return;
        }

        if (url && !safeWebUrl(url)) {
            projectSay("Enter a valid http:// or https:// project URL.");
            $("careerProjectUrl").focus();
            return;
        }

        const project = {
            id: (typeof crypto !== "undefined" && crypto.randomUUID)
                ? crypto.randomUUID()
                : Date.now().toString() + Math.random().toString(16).slice(2),
            name,
            url,
            description
        };

        projects.push(project);

        if (!saveProfile(false)) {
            projects.pop();
            return;
        }

        $("careerProjectName").value = "";
        $("careerProjectUrl").value = "";
        $("careerProjectDescription").value = "";

        renderProjects();
        projectSay("Project added and saved.");
        say("Your project changes have been saved.");
    });

    $("careerExportBtn").addEventListener("click", function () {
        // Export the current form values and current project list.
        const data = currentProfile();

        if (!data.careerName) {
            say("Enter your name before exporting your profile.");
            $("careerName").focus();
            return;
        }

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json;charset=utf-8" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ninis-career-profile.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        say("Your career profile has been exported as JSON.");
    });

    loadProfile();
})();
