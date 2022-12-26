// VARIABLES =========================================================================================================================

const userSurvey = document.getElementsByClassName("user-survey")[0];

// Student or Teacher
const teacher = document.getElementById("user-survey-relationship-teacher");
const student = document.getElementById("user-survey-relationship-student");

// Student Questions
const gradeOptions = document.getElementsByClassName("user-survey-grade-option");
const classOptions = document.getElementsByClassName("user-survey-classes-option");
const gradesContainer = document.getElementsByClassName("user-survey-grade")[0];
const classesContainer = document.getElementsByClassName("user-survey-classes")[0];

// Submission
const submission = document.getElementsByClassName("user-survey-submission")[0];

// FUNCTIONS =========================================================================================================================

// Reset choices so that none is clicked (if needed)
function resetClick(options, click){
    for (let i = 0; i < options.length; i += 1){
        options[i].classList.remove(click);
    }
}

// Give survey options the ability to click
function setClick(option, options, click){
    resetClick(options, click);

    // Give the clicked choice the pressed down styling
    option.classList.add(click);
}

function animate(surveyContainer, add_or_remove){

    if (add_or_remove === true){
        surveyContainer.classList.remove("content-gone");
        surveyContainer.classList.remove("fadeOut");
        surveyContainer.classList.add("fadeIn");
    }
    else if (add_or_remove === false){
        surveyContainer.classList.remove("fadeIn");
        surveyContainer.classList.add("fadeOut");
    }
}

// CONFIGURATION =========================================================================================================================

// Add event listeners for all survey options
// Configure the grade choices
// Debounce is used to prevent the user from spamming the choices and causing the animation to break
let debounce = false;
for (let option = 0; option < gradeOptions.length; option += 1){

    // Gradeoptions event listeners
    gradeOptions[option].addEventListener("click", () => {
        
        // Check if the grade is greater than six, if so, then ask if they are in
        // honors or AP classes
        let gradeValue = gradeOptions[option].innerHTML;
        
        if (debounce === true){
            gradeOptions[option].style.cursor = "wait";

            setTimeout(() => { gradeOptions[option].style.cursor = "pointer"; return; }, 500);
        }
        debounce = true;

        // Add the clicked styling to the choice
        setClick(gradeOptions[option], gradeOptions, "user-survey-grade-selector-clicked");

        if (gradeValue >= 6){
            animate(classesContainer, true);

            submission.classList.add("content-gone");
            submission.classList.remove("fadeIn");

            // Allow selection after the animation ends
            setTimeout(() => {
                debounce = false;
            }, 500);
        }
        else{
            animate(classesContainer, false);
            animate(submission, true);

            resetClick(classOptions, "user-survey-classes-selector-clicked");

            setTimeout(() => {
                classesContainer.classList.add("content-gone");
                debounce = false;
            }, 500);
        }
    });
}

// configure the class choices
for (let j = 0; j < classOptions.length; j += 1){
    classOptions[j].addEventListener("click", () => {
        
        setClick(classOptions[j], classOptions, "user-survey-classes-selector-clicked");

        // Reveal Submission button
        submission.classList.remove("content-gone");
        submission.classList.add("fadeIn");
    });
}

// MAINSETUP =========================================================================================================================

let teacherClicked = false;
let studentClicked = false;

teacher.addEventListener("click", () => {

    if (teacherClicked === true){
        return;
    }

    teacherClicked = true;
    studentClicked = false;

    teacher.classList.add("user-survey-relationship-selector-clicked");
    student.classList.remove("user-survey-relationship-selector-clicked");

    gradesContainer.classList.add("content-gone");
    classesContainer.classList.add("content-gone");

    // Reset choices for student if the teacher is clicked 
    resetClick(gradeOptions, "user-survey-grade-selector-clicked");
    resetClick(classOptions, "user-survey-classes-selector-clicked");

    submission.classList.remove("content-gone");
    submission.classList.add("fadeIn");

    setTimeout(() => {
        submission.classList.remove("fadeIn");
    }, 500);
});

student.addEventListener("click", () => {

    if (studentClicked === true){
        return;
    }

    studentClicked = true;
    teacherClicked = false;

    student.classList.add("user-survey-relationship-selector-clicked");
    teacher.classList.remove("user-survey-relationship-selector-clicked");

    submission.classList.add("content-gone");

    gradesContainer.classList.remove("content-gone");
    gradesContainer.classList.add("fadeIn");
});

