async function loadPage() {
    const selectedJob = localStorage.getItem("selectedJob");
    if (!selectedJob) {
        console.error("No job selected. Redirecting to home page.");
        window.location.href = 'home.html'; // Redirect to home if no job is selected
        return;
    }

    console.log('Selected Job:', selectedJob); // Debugging
    loadTitle(selectedJob);

    const apiOut = await getApiResults(selectedJob);
    console.log('API Output:', apiOut); // Debugging

    if (!apiOut) {
        document.getElementById('result').textContent = 'Error fetching job details.';
        return;
    }

    const parsedData = parseApiResults(apiOut);
    console.log('Parsed Data:', parsedData); // Debugging

    if (parsedData) {
        loadDesc(parsedData["jobDescription"]);
        loadSkills(parsedData["skills"]);
        loadProject(parsedData["projectName"], parsedData["projectDescription"]);

        // Save the parsed job data into localStorage for use when saving the response
        localStorage.setItem("jobData", JSON.stringify(parsedData));

        // Save skills and project details separately for later use
        localStorage.setItem("skillsList", JSON.stringify(parsedData["skills"]));
        localStorage.setItem("projectDetails", JSON.stringify({
            projectName: parsedData["projectName"],
            projectDescription: parsedData["projectDescription"]
        }));

        // Save job description explicitly
        localStorage.setItem("jobDescription", parsedData["jobDescription"]);

        // Handle temporary quiz result
        const tempQuizResult = sessionStorage.getItem('tempQuizResult');
        if (tempQuizResult) {
            console.log('Temp Quiz Result:', JSON.parse(tempQuizResult));
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
        const apiKeyResponse = await fetch('apiKey/key.txt');
        const apiKey = await apiKeyResponse.text();
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+apiKey
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

    if (saveResponseBtn) {
        saveResponseBtn.style.display = 'block'; // Ensure the button is visible

        saveResponseBtn.addEventListener('click', () => {
            if (!loggedInUser) {
                console.warn('User is not logged in. Prompting signup or login.');
                promptSignUp();
                return;
            }

            const quizResponse = getQuizResponse();
            const jobData = JSON.parse(localStorage.getItem("jobData")) || {};
            console.log("Parsed Job Data:", jobData);

            if (!jobData.job) {
                 console.error("Job data is missing. Verify API and localStorage handling.");
            }

            if (!quizResponse) {
                console.error("Quiz response not found. Cannot proceed with saving.");
                return;
            }

            const quizData = JSON.parse(quizResponse);

            // Ensure skills and project details are valid
            const skillsList = getSkillsList(jobData);
            const projectDetails = getProjectDetails(jobData);

            // Fallbacks for incomplete data
            const validJobData = {
                job: jobData.job || localStorage.getItem('selectedJob') || 'Unknown Job',
                jobDescription: jobData.jobDescription || 'Description not available.',
                skills: skillsList.length > 0 ? skillsList : ['No skills available.'],
                projectName: projectDetails.projectName || 'Unnamed Project',
                projectDescription: projectDetails.projectDescription || 'No description available.'
            };

            console.log("Saving Data:", { quizData, validJobData });

            saveQuizResponse(loggedInUser, quizData, validJobData, validJobData.skills, {
                projectName: validJobData.projectName,
                projectDescription: validJobData.projectDescription
            });
        });
    }
});

/**
 * Utility function to retrieve quiz response from storage.
 */
function getQuizResponse() {
    return sessionStorage.getItem('tempQuizResult') || localStorage.getItem('quizResult');
}

/**
 * Utility function to extract skills list with fallback handling.
 */
function getSkillsList(jobData) {
    return jobData.skills || JSON.parse(localStorage.getItem('skillsList')) || [];
}

/**
 * Utility function to extract project details with fallback handling.
 */
function getProjectDetails(jobData) {
    const fallbackProjectDetails = JSON.parse(localStorage.getItem('projectDetails')) || {};
    return {
        projectName: jobData.projectName || fallbackProjectDetails.projectName || '',
        projectDescription: jobData.projectDescription || fallbackProjectDetails.projectDescription || ''
    };
}

/**
 * Utility function to validate skills and project details.
 */
function isValidData(skillsList, projectDetails) {
    return skillsList.length > 0 && projectDetails.projectName && projectDetails.projectDescription;
}

function saveQuizResponse(username, quizData, jobData, skillsList, projectDetails) {
    if (!jobData || !skillsList || !projectDetails) {
        console.error("Incomplete data to save response:", { jobData, skillsList, projectDetails });
        return;
    }

    const responseData = {
        responses: quizData.responses || [],
        recommendedJobStr: quizData.recommendedJob || "No recommendation",
        job: jobData.job || "Unknown",
        jobDescription: jobData.jobDescription || "No description available",
        skills: skillsList || [],
        projectName: projectDetails.projectName || "No project name",
        projectDescription: projectDetails.projectDescription || "No project description",
        date: new Date().toLocaleString()
    };

    console.log("Data to Save:", responseData);

    const userQuizHistory = JSON.parse(localStorage.getItem(`${username}_quizHistory`)) || [];
    userQuizHistory.push(responseData);
    localStorage.setItem(`${username}_quizHistory`, JSON.stringify(userQuizHistory));

    console.log('Response saved successfully with full data!', responseData);

    showSavedPopup();
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

function showSavedPopup() {
    document.body.innerHTML += ` 
        <div id="saved-popup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgba(11, 197, 235, 1); color: white; border-radius: 8px; text-align: center; z-index: 1000;">
            <p>Your results have been successfully saved to your account!</p>
            <button onclick="closeSavedPopup()">Close</button>
        </div>
    `;
}

function closeSavedPopup() {
    const popup = document.getElementById('saved-popup');
    if (popup) {
        popup.remove();
    }
}

const moreInfoBtn = document.getElementById('more-info-btn');
const searchBarContainer = document.getElementById('search-bar-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const answerContainer = document.createElement('div');
document.body.appendChild(answerContainer);

moreInfoBtn.addEventListener('click', function() {
    searchBarContainer.style.display = searchBarContainer.style.display === 'none' ? 'block' : 'none';
});

searchBtn.addEventListener('click', async function() {
    const query = searchInput.value.trim();
    if (query) {
        console.log('User search query:', query);

        try {
            const apiKeyResponse = await fetch('apiKey/key.txt');
            const apiKey = await apiKeyResponse.text();
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+apiKey
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",  // or "gpt-4" if you have access
                    messages: [{ role: "user", content: query }],
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch response from backend');
            }

            const data = await response.json();

            if (data.answer) {
                answerContainer.innerHTML = `<p><strong>Answer:</strong> ${data.answer}</p>`;
            } else {
                answerContainer.innerHTML = `<p>Sorry, I couldn't find an answer to your question.</p>`;
            }
        } catch (error) {
            console.error('Error with fetching answer:', error);
            answerContainer.innerHTML = `<p>There was an error while fetching the answer. Please try again later.</p>`;
        }
    } else {
        alert('Please enter a question!');
    }
});