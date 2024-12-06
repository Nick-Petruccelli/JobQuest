loadPage();

async function getApiResults(job) {
    // Format the question to send to ChatGPT
    const query = `give a description of what a ${job} does, also give a list of 10 skills needed for the ${job} career, also give a description of a project that someone could make to help build those skills.
    give the response in valid json with a jobDescription, skills, projectName, and projectDescription keys.
    keep the response below 150 tokens.`;

    // Send the request to ChatGPT
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer' + '',
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
        console.log(apiOut);
        return apiOut;


    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').textContent = 'Sorry, there was an error processing your request.';
    }
}

async function loadPage(){
    const selectedJob = localStorage.getItem("selectedJob");
    loadTitle(selectedJob);
    const apiOut = await getApiResults(selectedJob);
    const parsedData = parseApiResults(apiOut);
    loadDesc(parsedData["jobDescription"])
    loadSkills(parsedData["skills"]);
    loadProject(parsedData["projectName"], parsedData["projectDescription"])
}
function parseApiResults(apiRes){
    const data = JSON.parse(apiRes);
    console.log(data);
    return data;
}

function loadTitle(title){
    const jobTitle = document.querySelector(".job-title");
    jobTitle.innerText = title;
}

function loadDesc(desc){
    const descContainer = document.querySelector(".desc-container");
    const descElm = document.createElement("p");
    descElm.innerText = desc;
    descContainer.appendChild(descElm);
}

function loadSkills(skills){
    console.log(skills);
    const skillList = document.getElementsByClassName('skills-list')[0];
    for(const skill of skills){
        const skillElm = document.createElement("li");
        skillElm.innerText = skill;
        skillList.appendChild(skillElm);
    }
}

function loadProject(projName, projDesc){
    const projNameElm = document.createElement("h2");
    projNameElm.innerText = projName;
    console.log(projName);
    const projDescElm = document.createElement("p");
    projDescElm.innerText = projDesc;
    console.log(projDesc);
    const projContainer = document.getElementsByClassName("proj-container")[0];
    projContainer.appendChild(projNameElm);
    projContainer.appendChild(projDescElm);
}