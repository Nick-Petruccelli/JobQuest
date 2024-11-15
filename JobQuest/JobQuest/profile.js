window.onload = function() {
    // Check if the user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (!loggedInUser) {
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

            // Check if the 'responses' object exists and contains the necessary questions
            const responses = quiz.responses || {};

            quizItem.innerHTML = `
                <h4>Quiz ${index + 1} (Taken on: ${quiz.date})</h4>
                <p><strong>1. Enjoys solving logical problems:</strong> ${responses.q1 || 'Not answered'}</p>
                <p><strong>2. Interested in hardware or software:</strong> ${responses.q2 || 'Not answered'}</p>
                <p><strong>3. Prefers individual or team projects:</strong> ${responses.q3 || 'Not answered'}</p>
                <p><strong>4. Comfort level with mathematics:</strong> ${responses.q4 || 'Not answered'}</p>
                <p><strong>5. Prefers theoretical or practical:</strong> ${responses.q5 || 'Not answered'}</p>
                <p><strong>Recommended Field:</strong> ${quiz.recommendedJob || 'Not available'}</p>
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