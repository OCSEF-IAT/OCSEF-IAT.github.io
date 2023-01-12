// VARIABLES =========================================================================================================================

const userSurvey = document.getElementsByClassName("user-survey")[0];

// Student or Teacher
const teacher = document.getElementById("user-survey-relationship-teacher");
const student = document.getElementById("user-survey-relationship-student");

// Teacher Questions
const teacherGradeOptions = document.getElementsByClassName("user-survey-teachergrade-option");
const teacherClassOptions = document.getElementsByClassName("user-survey-teacherclass-option");
const teacherGradesContainer = document.getElementsByClassName("user-survey-grade-teacher")[0];
const teacherClassesContainer = document.getElementsByClassName("user-survey-classes-teacher")[0];

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

// Configure the grade choices
class configure{
        
    // Options = the nodes that the user clicks
    // Options_Container = the parent, which we use to animation the appearance or disappearance of a survey question
    // SubsequentQuestion = this question specifically appears if grade 6 or higher
    constructor(options, options_length, options_container, click, subsequentQuestion = null, subsequentQuestionParent = null){
        // Debounce is used to prevent the user from spamming the choices and causing the animation to break
        this.debounce = false;

        this.options = options;
        this.options_container = options_container;
        this.options_length = options_length;
        this.click = click;

        this.subsequentQuestion = subsequentQuestion;
        this.subsequentQuestionParent = subsequentQuestionParent;
    }

    // Add event listeners for all survey options
    // Create debounce to prevent animation spam
    createEventListeners(){
        
        for (let option = 0; option < this.options_length; option += 1){

            this.options[option].addEventListener("click", () => {
                
                // Check if the grade is greater than six, if so, then ask if they are in
                // or teach honors/AP classes
                let gradeValue = gradeOptions[option].innerHTML;

                // Prevent spamming animation 
                if (this.debounce === true){
                    gradeOptions[option].style.cursor = "wait";
        
                    setTimeout(() => { gradeOptions[option].style.cursor = "pointer"; return; }, 500);
                }
                this.debounce = true;

                // Add the clicked styling to the choice
                setClick(this.options[option], this.options, this.click);

                if (gradeValue >= 6){
                    animate(this.subsequentQuestionParent, true);
        
                    submission.classList.add("content-gone");
                    submission.classList.remove("fadeIn");
        
                    // Allow selection after the animation ends
                    setTimeout(() => {
                        this.debounce = false;
                    }, 500);
                }
                else{
                    animate(this.subsequentQuestionParent, false);
                    animate(submission, true);
        
                    if (this.subsequentQuestionParent !== null){
                        resetClick(this.subsequentQuestionParent, this.click);
                    }
        
                    setTimeout(() => {
                        classesContainer.classList.add("content-gone");
                        this.debounce = false;
                    }, 500);
                }

            });
        }

        // configure the subsequent question choices
        for (let j = 0; j < this.subsequentQuestion.length; j += 1){
            this.subsequentQuestion[j].addEventListener("click", () => {
                
                setClick(this.subsequentQuestion[j], this.subsequentQuestion, this.click);
            
                // Reveal Submission button
                submission.classList.remove("content-gone");
                submission.classList.add("fadeIn");
            });
        }
    }
}

// CONFIGURATION =========================================================================================================================

let m_student = new configure(gradeOptions, gradeOptions.length, gradesContainer, "user-survey-grade-selector-clicked", classOptions, classesContainer);
m_student.createEventListeners();

let m_teacher = new configure(teacherGradeOptions, teacherGradeOptions.length, teacherGradesContainer, "user-survey-grade-selector-clicked", teacherClassOptions, teacherClassesContainer);
m_teacher.createEventListeners();

// let debounce = false;
// for (let option = 0; option < gradeOptions.length; option += 1){

//     // Gradeoptions event listeners
//     gradeOptions[option].addEventListener("click", () => {
        
//         // Check if the grade is greater than six, if so, then ask if they are in
//         // honors or AP classes
//         let gradeValue = gradeOptions[option].innerHTML;
        
//         if (debounce === true){
//             gradeOptions[option].style.cursor = "wait";

//             setTimeout(() => { gradeOptions[option].style.cursor = "pointer"; return; }, 500);
//         }
//         debounce = true;

//         // Add the clicked styling to the choice
//         setClick(gradeOptions[option], gradeOptions, "user-survey-grade-selector-clicked");

//         if (gradeValue >= 6){
//             animate(classesContainer, true);

//             submission.classList.add("content-gone");
//             submission.classList.remove("fadeIn");

//             // Allow selection after the animation ends
//             setTimeout(() => {
//                 debounce = false;
//             }, 500);
//         }
//         else{
//             animate(classesContainer, false);
//             animate(submission, true);

//             resetClick(classOptions, "user-survey-classes-selector-clicked");

//             setTimeout(() => {
//                 classesContainer.classList.add("content-gone");
//                 debounce = false;
//             }, 500);
//         }
//     });
// }

// // configure the class choices
// for (let j = 0; j < classOptions.length; j += 1){
//     classOptions[j].addEventListener("click", () => {
        
//         setClick(classOptions[j], classOptions, "user-survey-classes-selector-clicked");

//         // Reveal Submission button
//         submission.classList.remove("content-gone");
//         submission.classList.add("fadeIn");
//     });
// }

// MAINSETUP =========================================================================================================================

let teacherClicked = false;
let studentClicked = false;

// Add teacher questions appearing =================================
teacher.addEventListener("click", () => {

    if (teacherClicked === true) return; 

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

    if (studentClicked === true) return;

    studentClicked = true;
    teacherClicked = false;

    student.classList.add("user-survey-relationship-selector-clicked");
    teacher.classList.remove("user-survey-relationship-selector-clicked");

    submission.classList.add("content-gone");

    gradesContainer.classList.remove("content-gone");
    gradesContainer.classList.add("fadeIn");
});

