main();
//document.addEventListener('DOMContentLoaded', loadPage);

async function main(){
    const apiKeyResponse = await fetch("apiKey/key.txt");
    const apiKey = await apiKeyResponse.text();
    loadPage(apiKey);
}

async function loadPage(apiKey){
    document.getElementById('quiz-form').addEventListener('submit', formSubmit);
    console.log("hit");

    async function formSubmit(e) {
        await getApiResults(e);
        console.log("hit");
        addResultEventListeners();
    }

    async function getApiResults(event) {
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
        Based on these responses, please recommend a computer science job that aligns with the user's skills, interests, and preferences, such as software engineering, data science, cybersecurity, or machine learning. Only list the name of the job and nothing else. Give 3 recommendations separated by commas. ex "Software Engineer, cybersecurity, ml engineer"`;

        // Send the request to ChatGPT
        try {
            console.log(apiKey);
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+apiKey,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",  // or "gpt-4" if you have access
                    messages: [{ role: "user", content: query }],
                    max_tokens: 150
                })
            });

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            const recommendedJobStr = data.choices[0].message.content.trim();
            const recommendedJobList = recommendedJobStr.split(", ");

            // Display the result to the user
            const resultContainer = document.getElementById('result');
            resultContainer.innerHTML = `<h3>Recommended Fields:</h3>`;
            let i = 0;
            for (const job of recommendedJobList) {
                const btn = document.createElement("button");
                btn.innerText = job;
                btn.classList.add(`resultBtn${i++}`);
                resultContainer.appendChild(btn);
            }

            // Store the quiz result temporarily
            sessionStorage.setItem(
                'tempQuizResult',
                JSON.stringify({
                    responses,
                    recommendedJob: recommendedJobList,
                })
            );

        } catch (error) {
            console.error('Error:', error);
            document.getElementById('result').textContent = 'Sorry, there was an error processing your request.';
        }
    }

    function addResultEventListeners() {
        const resultContainer = document.getElementById('result');
        for (let i = 0; i < 3; i++) {
            const btn = document.getElementsByClassName(`resultBtn${i}`)[0];
            if (btn) {
                btn.addEventListener("click", loadResults);
            }
        }
    }

    async function loadResults(e) {
        localStorage.setItem("selectedJob", e.target.innerText);
        window.location.href = "results.html";
    }
}