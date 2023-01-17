// VARIABLES ========================================================================================================================

const userSurvey = {
    clickEffect: "user-survey-selector-clicked",

    // teacher DOM Elements/Questions
    teacher: {
        teacherButton: document.getElementById("user-survey-relationship-teacher"),
        
        gradeOptions: document.getElementsByClassName("user-survey-teacher-grade-option"),
        classOptions: document.getElementsByClassName("user-survey-teacher-class-option"),
        
        gradesContainer: document.getElementsByClassName("user-survey-teacher-grade")[0],
        classesContainer: document.getElementsByClassName("user-survey-teacher-class")[0]
    },

    // student DOM Elements/Questions
    student: {
        studentButton: document.getElementById("user-survey-relationship-student"),

        gradeOptions: document.getElementsByClassName("user-survey-grade-option"),
        classOptions: document.getElementsByClassName("user-survey-classes-option"),

        gradesContainer: document.getElementsByClassName("user-survey-grade")[0],
        classesContainer: document.getElementsByClassName("user-survey-classes")[0]
    }
}

// DOM element information from the userSurvey object
const teacherInfo = userSurvey.teacher;
const studentInfo = userSurvey.student;

const submission = document.getElementsByClassName("user-survey-submission")[0];

// Enum for animation function
const animationOptions = {
    add: "add",
    remove: "remove"
}

// CONFIGURE CLASS ===================================================================================================================

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
                let gradeValue = this.options[option].innerHTML;

                // Prevent spamming animation 
                if (this.debounce === true){
                    this.options[option].style.cursor = "wait";
        
                    setTimeout(() => { this.options[option].style.cursor = "pointer"; return; }, 500);
                }
                this.debounce = true;

                // Add the clicked styling to the choice
                setClick(this.options[option], this.options, this.click);

                if (gradeValue >= 6){
                    animate(this.subsequentQuestionParent, animationOptions.add);
                    resetClick(this.subsequentQuestion, "user-survey-selector-clicked");
                    
                    // Hide submission to reveal subsequent question                    
                    submission.classList.add("content-gone");

                    // Allow selection after the animation ends
                    setTimeout(() => {
                        this.debounce = false;
                    }, 500);
                }
                else{

                    // Do not hide submission button and have no subsequent question
                    this.subsequentQuestionParent.classList.add("fadeOut");
                    resetClick(this.subsequentQuestion, "user-survey-selector-clicked");

                    setTimeout(() => {
                        this.subsequentQuestionParent.classList.add("content-gone");
                        this.subsequentQuestionParent.classList.remove("fadeOut");
                    }, 500);


                    animate(submission, animationOptions.add);
        
                    setTimeout(() => {
                        this.subsequentQuestionParent.classList.add("content-gone");
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

let m_teacher = new configure(
    teacherInfo.gradeOptions, 
    teacherInfo.gradeOptions.length, 
    teacherInfo.gradesContainer, 
    userSurvey.clickEffect, 
    teacherInfo.classOptions, 
    teacherInfo.classesContainer
);

let m_student = new configure(
    studentInfo.gradeOptions, 
    studentInfo.gradeOptions.length, 
    studentInfo.gradesContainer, 
    userSurvey.clickEffect, 
    studentInfo.classOptions, 
    studentInfo.classesContainer
);

// Create event listeners for the user survey options
m_teacher.createEventListeners();
m_student.createEventListeners();

// MAINSETUP =========================================================================================================================

let teacherClicked = false;
let studentClicked = false;

teacherInfo.teacherButton.addEventListener("click", () => {

    if (teacherClicked === true) return; 

    teacherClicked = true;
    studentClicked = false;

    initialClick(teacherInfo.teacherButton);

    // Hide student survey questions
    studentInfo.gradesContainer.classList.add("content-gone");
    studentInfo.classesContainer.classList.add("content-gone");

    // Reset choices for student if the teacher is clicked 
    resetClick(studentInfo.gradeOptions, "user-survey-selector-clicked");
    resetClick(studentInfo.classOptions, "user-survey-selector-clicked");

    // Remove submission 
    submission.classList.add("content-gone");

    animate(teacherInfo.gradesContainer, animationOptions.add);
});

studentInfo.studentButton.addEventListener("click", () => {

    if (studentClicked === true) return;

    studentClicked = true;
    teacherClicked = false;

    // Button click styling
    initialClick(studentInfo.studentButton);

    // Hide teacher survey questions
    teacherInfo.gradesContainer.classList.add("content-gone");
    teacherInfo.classesContainer.classList.add("content-gone");

    // Reset choices for teacher if the student is clicked 
    resetClick(teacherInfo.gradeOptions, "user-survey-selector-clicked");
    resetClick(teacherInfo.classOptions, "user-survey-selector-clicked");


    // Remove submission 
    submission.classList.add("content-gone");
    
    animate(studentInfo.gradesContainer, animationOptions.add);
});

// HELPER FUNCTIONS =========================================================================================================================

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

// Initial Student or Teacher click:
// relationshipType = student or teacher DOM element 
const initialClick = (relationshipType) => {
    
    teacherInfo.teacherButton.classList.remove("user-survey-selector-clicked");
    studentInfo.studentButton.classList.remove("user-survey-selector-clicked");

    relationshipType.classList.add("user-survey-selector-clicked");
}

// Add or remove animations
// surveyContainer = DOM element to be animated
// status = add or remove
function animate(surveyContainer, status){

    if (status === "add"){
        surveyContainer.classList.remove("content-gone");
        surveyContainer.classList.remove("fadeOut");

        surveyContainer.classList.add("fadeIn");

        setTimeout(() => {
            surveyContainer.classList.remove("fadeIn");
        }, 500);
    }

    else if (status == "remove"){
        surveyContainer.classList.remove("fadeIn");
        surveyContainer.classList.add("fadeOut");

        setTimeout(() => {
            surveyContainer.classList.add("content-gone");
            surveyContainer.classList.remove("fadeOut");
        }, 500);
    }
}
