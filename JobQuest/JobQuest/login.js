document.addEventListener("DOMContentLoaded", () => {
    // Toggle between login and create account forms
    document.getElementById("login-option").addEventListener("click", () => {
        toggleForm("login-form", "create-account-form");
    });

    document.getElementById("create-account-option").addEventListener("click", () => {
        toggleForm("create-account-form", "login-form");
    });

    // Create account form submission
    console.log("hit");
    document.getElementById("create-account-form").addEventListener("submit", async(e) => {
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
        console.log('hit');
        const user_data = {'username':newUsername, 'password': newPassword, 'quizResults': [] }
        const response = await fetch('http://127.0.0.1:5000/create-user', {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(user_data)}
            );


        handlePendingQuizResponse(newUsername); // Handle any pending quiz response

        createStatus.innerText = "Account created successfully! Redirecting...";
        createStatus.style.color = "green";

        setTimeout(() => window.location.href = "home.html", 3000); // Redirect after 3 seconds
    });

    // Login form submission
    document.getElementById("login-form").addEventListener("submit", async(e) => {
        e.preventDefault();

        const loginUsername = document.getElementById("login-username").value.trim();
        const loginPassword = document.getElementById("login-password").value.trim();
        const loginStatus = document.getElementById("login-status");

        console.log(loginUsername);
        const storedUserRequest = await fetch('http://127.0.0.1:5000/get-user/'+loginUsername);
        if(!storedUserRequest.ok){
            loginStatus.innerText = "Invalid username.";
            loginStatus.style.color = "red";
            return;
        }
        const storedUser = await storedUserRequest.json();
        if (storedUser && storedUser['password'] === loginPassword) {
            localStorage.setItem("loggedInUser", loginUsername);

            handlePendingQuizResponse(loginUsername); // Handle any pending quiz response

            loginStatus.innerText = "Login successful! Redirecting...";
            loginStatus.style.color = "green";

            setTimeout(() => window.location.href = "home.html", 500); // Redirect after 1 second
        } else {
            loginStatus.innerText = "Invalid password.";
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
async function saveQuizResponse(username, quizData, skillsList = [], projectDetails = {}) {
    console.log('hit');
    const newQuizEntry = {
        responses: quizData.responses || [],
        recommendedJob: quizData.recommendedJob || [],
        jobDescription: quizData.jobDescription || '',
        skills: skillsList,
        projectName: projectDetails.projectName || '',
        projectDescription: projectDetails.projectDescription || '',
        date: new Date().toLocaleString(),
    };

    const request = fetch('http://127.0.0.1:5000/save-quiz/'+username, {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(newQuizEntry)
        })
}

// Function to handle any pending quiz response from sessionStorage
async function handlePendingQuizResponse(username) {
    console.log('hpqr');
    const pendingResponse = sessionStorage.getItem("tempQuizResult");
    if (!pendingResponse) return; // Exit if no pending response

    const quizData = JSON.parse(pendingResponse);

    // Fetch skills list and project details if available
    const skillsList = JSON.parse(localStorage.getItem("skillsList")) || [];
    const projectDetails = JSON.parse(localStorage.getItem("projectDetails")) || {};

    // Ensure jobDescription is included
    if (!quizData.jobDescription) {
        quizData.jobDescription = localStorage.getItem("jobDescription") || '';
    }

    // Save the response to the user's profile
    saveQuizResponse(username, quizData, skillsList, projectDetails);

    // Clean up temporary data
    sessionStorage.removeItem("tempQuizResult");
    localStorage.removeItem("skillsList");
    localStorage.removeItem("projectDetails");
    localStorage.removeItem("jobDescription");
}