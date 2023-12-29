const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

let interval;

const buttonSound = new Audio('button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    buttonSound.play();
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    } else {
        stopTimer();
    }
});

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener("click", handleMode);

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10); // Converting miliseconds to seconds
    const minutes = Number.parseInt((total / 60) % 60, 10) // Converting seconds to minutes
    const seconds = Number.parseInt(total % 60, 10) // Extracting the remaining seconds within the total time

    return {
        total,
        minutes,
        seconds,
    };
}

function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro') timer.sessions++;

    // Change the button to 'STOP' once it is started
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);

            switch(timer.mode) {
                case 'pomodoro':
                    if (timer.sessions % timer.longBreakInterval === 0) {   
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                    break;
                default:
                    switchMode('pomodoro');
            }
            
            if (Notification.permission === 'granted') {
                const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
                new Notification(text);
            }


            document.querySelector(`[data-sound="${timer.mode}"]`).play();

            startTimer();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(interval);

        // Change the button to 'START' once it is stopped
        mainButton.dataset.action = 'start';
        mainButton.textContent = 'start';
        mainButton.classList.remove('active');
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById( 'js-minutes');
    const sec = document.getElementById( 'js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    document.title = `${minutes} : ${seconds} - ${text} `;

    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}


function switchMode(mode) { // This function takes in two properties, one of which is an object itself with its own properties
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60, // Total seconds remaining
        minutes: timer[mode],
        seconds: 0,
    };

    // The active class is removed from all the mode buttons and set on the one that was clicked
    document.querySelectorAll('button[data-mode]').forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    // Change the color of the document body
    document.body.style.backgroundColor = `var(--${mode})`;
    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total);

    updateClock();
}


function handleMode(event) {
    const  { mode } = event.target.dataset; // Extracts the value of the mode attribute from the dataset of the clicked element

    if (!mode) return; // If mode is falsy (e.g., undefined, null, an empty string), the function exits early and does nothing.

    switchMode(mode);
    stopTimer();
}


document.addEventListener('DOMContentLoaded', () => {
    // Check if the browser supports notifications
    if ('Notification' in window) {
        // If notification permissions have neither been granted nor denied, ask user for permission
        if(Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
                // If permission is granted
                if (permission === 'granted') {
                    // Create a new notification
                    new Notification (
                        'Awesome! You will be notified at the start of each session.'
                    )
                }
            });
        }
    }
    switchMode('pomodoro');
});
