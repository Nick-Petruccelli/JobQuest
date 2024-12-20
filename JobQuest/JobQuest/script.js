document.getElementById("login-btn").addEventListener("click", function() {
    window.location.href = "login.html"; 
});

// Redirect to the quiz page when the quiz button is clicked
document.getElementById("quiz-btn").addEventListener("click", function() {
    window.location.href = "quiz.html"; 
});

// Check if the user is logged in
const loggedInUser = localStorage.getItem("loggedInUser");

if (loggedInUser) {
    console.log('Logged in as:', loggedInUser); // Debugging line to confirm the logged-in user
    
    document.getElementById("login-btn").style.display = "none";
    document.getElementById("profile-container").style.display = "flex";

    // Handle "My Profile" click
    document.getElementById("profile-btn").addEventListener("click", function() {
        window.location.href = "profile.html";  
    });

    // Handle logout functionality
    document.getElementById("logout-btn").addEventListener("click", function() {
        localStorage.removeItem("loggedInUser"); 
        window.location.href = "home.html";  
    });
} else {
    console.log('No user logged in');
}