document.getElementById('quiz-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Gather responses
    const responses = {
        q1: document.querySelector('input[name="q1"]:checked').value,
        q2: document.querySelector('input[name="q2"]:checked').value,
        q3: document.querySelector('input[name="q3"]:checked').value,
        q4: document.querySelector('input[name="q4"]:checked').value,
        q5: document.querySelector('input[name="q5"]:checked').value,
    };

    // Format the question to send to ChatGPT
    const query = `The user answered the following quiz questions:
    1. Enjoys solving logical problems: ${responses.q1}.
    2. Interested in hardware or software: ${responses.q2}.
    3. Prefers individual projects or team collaboration: ${responses.q3}.
    4. Comfort level with mathematics: ${responses.q4}.
    5. Prefers theoretical concepts or practical applications: ${responses.q5}.
    Based on these responses, please recommend a computer science job that aligns with the user's skills, interests, and preferences, such as software engineering, data science, cybersecurity, or machine learning. Briefly describe the job’s typical responsibilities and how it matches their profile.`;

    // Send the request to ChatGPT
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': ''
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",  // or "gpt-4" if you have access
                messages: [{ role: "user", content: query }],
                max_tokens: 150
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const recommendedJob = data.choices[0].message.content.trim();

        // Display the result to the user
        const resultContainer = document.getElementById('result');
        resultContainer.innerHTML = `<h3>Recommended Field:</h3><p>${recommendedJob}</p>`;

        // Check if the user is logged in
        const loggedInUser = localStorage.getItem('loggedInUser');

        if (loggedInUser) {
            // If user is logged in, save directly to their profile
            saveQuizResponse(loggedInUser, responses, recommendedJob);
        } else {
            // If user is not logged in, store temporarily and prompt to save
            sessionStorage.setItem('tempQuizResult', JSON.stringify({ responses, recommendedJob }));

            resultContainer.innerHTML += `
                <div>
                    <button id="save-response">Save this response</button>
                    <button id="more-info">Get more information</button>
                </div>
            `;

            // Add event listeners for Save and More Info buttons
            document.getElementById('save-response').addEventListener('click', promptSignUp);
            document.getElementById('more-info').addEventListener('click', promptSignUp);
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').textContent = 'Sorry, there was an error processing your request.';
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

// Prompt to sign up or log in
function promptSignUp() {
    document.getElementById('result').innerHTML = `
        <p>You need to create an account to save your response or get more information.</p>
        <button onclick="window.location.href='login.html'">Sign Up or Log In</button>
    `;
}