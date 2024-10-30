window.onload = function() {
    // Check if the user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
        // If the user is not logged in, redirect to the login page
        window.location.href = 'login.html';
        return;
    }

    // Retrieve quiz history from localStorage specific to the logged-in user
    const quizHistory = JSON.parse(localStorage.getItem(`${loggedInUser}_quizHistory`)) || [];

    const quizHistoryContainer = document.getElementById('quiz-history');

    if (quizHistory.length === 0) {
        quizHistoryContainer.innerHTML = '<p>You have not taken any quizzes yet.</p>';
    } else {
        quizHistory.forEach((quiz, index) => {
            const quizItem = document.createElement('div');
            quizItem.classList.add('quiz-item');

            quizItem.innerHTML = `
                <h4>Quiz ${index + 1} (Taken on: ${quiz.date})</h4>
                <p><strong>1. Enjoys solving logical problems:</strong> ${quiz.responses.q1}</p>
                <p><strong>2. Interested in hardware or software:</strong> ${quiz.responses.q2}</p>
                <p><strong>3. Prefers individual or team projects:</strong> ${quiz.responses.q3}</p>
                <p><strong>4. Comfort level with mathematics:</strong> ${quiz.responses.q4}</p>
                <p><strong>5. Prefers theoretical or practical:</strong> ${quiz.responses.q5}</p>
                <p><strong>Recommended Field:</strong> ${quiz.recommendedJob}</p>
                <hr>
            `;

            quizHistoryContainer.appendChild(quizItem);
        });
    }

    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'home.html';
    });
};