document.addEventListener("DOMContentLoaded", () => {
    // Toggle between login and create account forms
    document.getElementById("login-option").addEventListener("click", () => {
        toggleForm("login-form", "create-account-form");
    });

    document.getElementById("create-account-option").addEventListener("click", () => {
        toggleForm("create-account-form", "login-form");
    });

    // Create account form submission
    document.getElementById("create-account-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const newUsername = document.getElementById("new-username").value.trim();
        const newPassword = document.getElementById("new-password").value.trim();
        const createStatus = document.getElementById("create-status");

        if (localStorage.getItem(newUsername)) {
            createStatus.innerText = "Username already exists.";
            createStatus.style.color = "red";
            return;
        }

        // Save new user and log them in
        localStorage.setItem(newUsername, JSON.stringify({ password: newPassword, quizResults: [] }));
        localStorage.setItem("loggedInUser", newUsername);

        handlePendingQuizResponse(newUsername); // Handle any pending quiz response

        createStatus.innerText = "Account created successfully! Redirecting...";
        createStatus.style.color = "green";

        setTimeout(() => window.location.href = "home.html", 3000); // Redirect after 3 seconds
    });

    // Login form submission
    document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const loginUsername = document.getElementById("login-username").value.trim();
        const loginPassword = document.getElementById("login-password").value.trim();
        const loginStatus = document.getElementById("login-status");

        const storedUser = JSON.parse(localStorage.getItem(loginUsername));
        if (storedUser && storedUser.password === loginPassword) {
            localStorage.setItem("loggedInUser", loginUsername);

            handlePendingQuizResponse(loginUsername); // Handle any pending quiz response

            loginStatus.innerText = "Login successful! Redirecting...";
            loginStatus.style.color = "green";

            setTimeout(() => window.location.href = "home.html", 1000); // Redirect after 1 second
        } else {
            loginStatus.innerText = "Invalid credentials.";
            loginStatus.style.color = "red";
        }
    });
});

// Helper function to toggle between forms
function toggleForm(showFormId, hideFormId) {
    document.getElementById(showFormId).style.display = "block";
    document.getElementById(hideFormId).style.display = "none";
}

// Function to save a quiz response to the logged-in user's profile
function saveQuizResponse(username, quizData) {
    const userQuizHistory = JSON.parse(localStorage.getItem(`${username}_quizHistory`)) || [];
    userQuizHistory.push({
        responses: quizData.responses,
        recommendedJob: quizData.recommendedJob,
        date: new Date().toLocaleString(),
        jobDetails: quizData.jobDetails || {}
    });
    localStorage.setItem(`${username}_quizHistory`, JSON.stringify(userQuizHistory));
}

// Function to handle any pending quiz response from sessionStorage
function handlePendingQuizResponse(username) {
    const pendingResponse = sessionStorage.getItem("tempQuizResult");
    if (pendingResponse) {
        const quizData = JSON.parse(pendingResponse);
        saveQuizResponse(username, quizData);
        sessionStorage.removeItem("tempQuizResult"); 
    }
}