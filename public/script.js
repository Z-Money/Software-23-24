let circularProgress = document.querySelector(".circular-progress"), progressValue = document.querySelector(".progress-value");
let progressStartValue = 0, progressEndValue = 71.4, speed = 20;

let progress = setInterval(() => {
    progressStartValue++;

    progressValue.textContent = `${progressStartValue}%`;
    circularProgress.style.background = `conic-gradient(#2a3de8 ${progressStartValue * 3.6}deg, #ededed 0deg)`;

    if (progressStartValue >= progressEndValue) {
        clearInterval(progress);
    }
}, speed);

//Events: name, progress, tasks
//Add tasks and mark task complete
//Get members from users db by finding all whose "events" contain event
//Comments done with getstream.io
//Calender done with fullcalendar


//Memebers searched by tags: events, confrences, year
//Include search bar
//Dropdown to see all info