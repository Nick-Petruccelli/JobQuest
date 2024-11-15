async function loadPage() {
    const selectedJob = localStorage.getItem("selectedJob");
    if (!selectedJob) {
        console.error("No job selected. Redirecting to home page.");
        window.location.href = 'home.html'; // Redirect to home if no job is selected
        return;
    }

    console.log('Selected Job:', selectedJob); // Checks the selected job
    loadTitle(selectedJob);

    const apiOut = await getApiResults(selectedJob);
    console.log('API Output:', apiOut); // Debugging line to check the API output

    if (!apiOut) {
        document.getElementById('result').textContent = 'Error fetching job details.';
        return;
    }

    const parsedData = parseApiResults(apiOut);
    console.log('Parsed Data:', parsedData); // Checks parsed data

    if (parsedData) {
        loadDesc(parsedData["jobDescription"]);
        loadSkills(parsedData["skills"]);
        loadProject(parsedData["projectName"], parsedData["projectDescription"]);

        // Save the parsed job data into localStorage to be used in saveQuizResponse
        localStorage.setItem("jobData", JSON.stringify(parsedData));

        // Save skills and project details to localStorage for later use when saving the response
        localStorage.setItem("skillsList", JSON.stringify(parsedData["skills"]));
        localStorage.setItem("projectDetails", JSON.stringify({
            projectName: parsedData["projectName"],
            projectDescription: parsedData["projectDescription"]
        }));

        // Check if quiz result is stored in sessionStorage for non-logged in users
        const tempQuizResult = sessionStorage.getItem('tempQuizResult');
        if (tempQuizResult) {
            const { responses, recommendedJobStr } = JSON.parse(tempQuizResult);
            console.log('Temp Quiz Result:', responses, recommendedJobStr);
            // Display job recommendations, etc. as you do for logged-in users.
        }
    } else {
        document.getElementById('result').textContent = 'Error processing API response.';
    }
}

async function getApiResults(job) {
    const query = `give a description of what a ${job} does, also give a list of 10 skills needed for the ${job} career, also give a description of a project that someone could make to help build those skills.
    give the response in valid json with a jobDescription, skills, projectName, and projectDescription keys.
    keep the response below 150 tokens.`;

    // Send the request to ChatGPT
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",  // or "gpt-4" if you have access
                messages: [{ role: "user", content: query }],
                max_tokens: 150
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const apiOut = data.choices[0].message.content.trim();
        console.log('Raw API Response:', apiOut);

        return apiOut;

    } catch (error) {
        console.error('Error fetching API results:', error);
        return null;  
    }
}

function parseApiResults(apiRes) {
    try {
        const data = JSON.parse(apiRes);
        console.log('Parsed API Response:', data); 

        if (!data.jobDescription || !Array.isArray(data.skills) || !data.projectName || !data.projectDescription) {
            console.error('Invalid data structure:', data);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error parsing API results:', error);
        return null; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPage();

    const saveResponseBtn = document.getElementById('save-response');
    const loggedInUser = localStorage.getItem('loggedInUser');

    console.log('Logged In User:', loggedInUser); // Debugging log

    // Ensure the button is always displayed, even for logged-out users
    if (saveResponseBtn) {
        saveResponseBtn.style.display = 'block'; // Always show the button

        saveResponseBtn.addEventListener('click', () => {
            if (!loggedInUser) {
                console.log('User is not logged in. Prompting signup or login.');
                promptSignUp(); // Show signup prompt for logged-out users
                return;
            }

            // For logged-in users, proceed to save the response
            const jobData = JSON.parse(localStorage.getItem("jobData"));
            const quizResponse = sessionStorage.getItem('tempQuizResult') || localStorage.getItem('quizResult');
            if (!quizResponse) {
                console.error("Quiz response not found.");
                return;
            }

            const quizData = JSON.parse(quizResponse);
            saveQuizResponse(loggedInUser, quizData, jobData);
        });
    }
});

function saveQuizResponse(username, quizData, jobData) {
    const responseData = {
        responses: quizData.responses,
        recommendedJobStr: quizData.recommendedJobStr,
        job: jobData.job,
        jobDescription: jobData.jobDescription,
        skills: jobData.skills,
        projectName: jobData.projectName,
        projectDescription: jobData.projectDescription,
        date: new Date().toLocaleString()
    };

    const userQuizHistory = JSON.parse(localStorage.getItem(`${username}_quizHistory`)) || [];
    userQuizHistory.push(responseData);
    localStorage.setItem(`${username}_quizHistory`, JSON.stringify(userQuizHistory));

    console.log('Response saved successfully!');
}

function promptSignUp() {
    document.body.innerHTML += `
        <div id="signup-prompt" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgba(0, 0, 0, 0.7); color: white; border-radius: 8px;">
            <p>You need to create an account to save your response.</p>
            <button onclick="window.location.href='login.html'">Sign Up or Log In</button>
        </div>
    `;
}

function loadTitle(title) {
    const jobTitle = document.querySelector(".job-title");
    if (jobTitle) {
        jobTitle.innerText = title;
    }
}

function loadDesc(desc) {
    const descContainer = document.querySelector(".desc-container");
    if (desc) {
        const descElm = document.createElement("p");
        descElm.innerText = desc;
        descContainer.appendChild(descElm);
    } else {
        const fallback = document.createElement("p");
        fallback.innerText = 'Description not available.';
        descContainer.appendChild(fallback);
    }
}

function loadSkills(skills) {
    console.log('Loading skills:', skills);
    const skillList = document.querySelector('.skills-list');
    skillList.innerHTML = ''; // Clear previous skills
    if (Array.isArray(skills) && skills.length > 0) {
        skills.forEach(skill => {
            const skillElm = document.createElement("li");
            skillElm.innerText = skill;
            skillList.appendChild(skillElm);
        });
    } else {
        const fallback = document.createElement("li");
        fallback.innerText = 'No skills available.';
        skillList.appendChild(fallback);
    }
}

function loadProject(projName, projDesc) {
    const projContainer = document.querySelector(".proj-container");
    projContainer.innerHTML = ''; // Clear previous project
    if (projName && projDesc) {
        const projNameElm = document.createElement("h2");
        projNameElm.innerText = projName;
        const projDescElm = document.createElement("p");
        projDescElm.innerText = projDesc;

        projContainer.appendChild(projNameElm);
        projContainer.appendChild(projDescElm);
    } else {
        const fallback = document.createElement("p");
        fallback.innerText = 'No project details available.';
        projContainer.appendChild(fallback);
    }
}