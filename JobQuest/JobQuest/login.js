document.getElementById("login-option").addEventListener("click", function() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("create-account-form").style.display = "none";
});


document.getElementById("create-account-option").addEventListener("click", function() {
    document.getElementById("create-account-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
});


document.getElementById("create-account-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const newUsername = document.getElementById("new-username").value;
    const newPassword = document.getElementById("new-password").value;
    
    // Check if the username already exists
    if (localStorage.getItem(newUsername)) {
        document.getElementById("create-status").innerText = "Username already exists.";
        document.getElementById("create-status").style.color = "red";
    } else {
        // Store new user in localStorage
        localStorage.setItem(newUsername, JSON.stringify({
            password: newPassword,
            quizResults: []  // Initialize with empty quiz results
        }));
        document.getElementById("create-status").innerText = "Account created successfully!";
        document.getElementById("create-status").style.color = "green";

    }
});


document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const loginUsername = document.getElementById("login-username").value;
    const loginPassword = document.getElementById("login-password").value;
    
    // Get user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem(loginUsername));
    
    if (storedUser && storedUser.password === loginPassword) {
        localStorage.setItem("loggedInUser", loginUsername);  // Store logged-in user

        // Check for any temporary quiz result in session storage
        const tempQuizResult = sessionStorage.getItem('tempQuizResult');
        if (tempQuizResult) {
            const quizData = JSON.parse(tempQuizResult);
            saveQuizResponse(loginUsername, quizData.responses, quizData.recommendedJob);
            sessionStorage.removeItem('tempQuizResult');  // Clear the temporary result
        }

        window.location.href = "home.html";  // Redirect to home page
    } else {
        document.getElementById("login-status").innerText = "Invalid credentials.";
        document.getElementById("login-status").style.color = "red";
    }
});

// Function to save quiz response to a specific user's profile
function saveQuizResponse(username, responses, recommendedJob) {
    const userQuizHistory = JSON.parse(localStorage.getItem(`${username}_quizHistory`)) || [];
    userQuizHistory.push({
        responses: responses,
        recommendedJob: recommendedJob,
        date: new Date().toLocaleString()
    });
    localStorage.setItem(`${username}_quizHistory`, JSON.stringify(userQuizHistory));
}