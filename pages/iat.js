// VARIABLES =========================================================================================================================

const rootElement = document.documentElement;
const iat_container = document.getElementsByClassName("iat-container")[0];

// IAT Instructions Screen
const instructions = document.getElementsByClassName("instructions")[0];
const iat_agreement = document.getElementsByClassName("instructions-agreement-text")[0];

// IAT Process
const iat_questions = document.getElementsByClassName("iat-questions")[0];
const question_section = document.getElementsByClassName("question-section")[0];
const section_name = document.getElementsByClassName("question-section-name")[0];
const question_word = document.getElementsByClassName("question-word")[0];

// IAT Breather Screen
const iat_breather = document.getElementsByClassName("iat-breather")[0];
const iat_breather_img = document.getElementById("iat-breather-image");
const iat_breather_message = document.getElementsByClassName("iat-breather-message")[0];
const iat_breather_timer = document.getElementsByClassName("iat-breather-timer")[0];

// Survey Submission
const _submission = document.getElementsByClassName("user-survey-submission")[0];

_submission.addEventListener("click", () => {
    storeSurveyData();
});

// GRAB USER SURVEY DATA =============================================================================================================

// This is where all the iatData will go. It will be sent to the database at the end of the test
let userData = {};

function storeSurveyData(){
    // We get this data to store later with the IAT reaction times
    // Student or Teacher
    const _teacher = document.getElementById("user-survey-relationship-teacher");
    const _student = document.getElementById("user-survey-relationship-student");

    // User Survey Options for Student
    const _gradeOptions = document.getElementsByClassName("user-survey-grade-option");
    const _classOptions = document.getElementsByClassName("user-survey-classes-option");

    // Check if the user is a teacher or student
    (_teacher.classList.contains("user-survey-relationship-selector-clicked")) ? userData.relationship = "Teacher" : userData.relationship = "Student";

    // Get the index for the grade and class choice that the student clicks 
    for (let option = 0; option < _gradeOptions.length; option += 1){
        if (_gradeOptions[option].classList.contains("user-survey-grade-selector-clicked")){

            // Add the grade to the userData object
            userData.grade = parseInt(_gradeOptions[option].innerHTML);
        }
    }

    for (let option = 0; option < _classOptions.length; option += 1){
        if (_classOptions[option].classList.contains("user-survey-classes-selector-clicked")){

            // Add the class to the userData object
            userData.classesAdvanced = parseInt(_classOptions[option].innerHTML);
        }
    }

    // console.log(userData);

    // Start the IAT instructions and process
    beginInstructions();
}

// IAT CLASS =========================================================================================================================

// This is where all the IAT data will go. It will be sent to the database at the end of the test
let iatList = []; 
 
let optionChosen = false;
class IAT{

    constructor(prompt, sectionNumber, terms){
        this.sectionPrompt = prompt; // (ex. Student & Negative)
        this.terms = terms;
        this.section = sectionNumber;
        this.totalSections = 8;

        this.timeCounter = 5; // 5 second break time
    }

    async run(){

        section_name.innerHTML = "Current Section: " + "<strong>" + this.sectionPrompt + "</strong>";
        question_section.innerHTML = "Section " + this.section + " of " + this.totalSections;

        for (let i = 0; i < this.terms.length; i++){
            
            question_word.innerHTML = this.terms[i];

            // Reset animation as new words are being displayed to the user            
            question_word.classList.add("fade-in-iat-question");

            setTimeout(() => {
                question_word.classList.remove("fade-in-iat-question");
            }, 150);
            
            let start = Date.now(); // Get the current time
            let keyChoice = await choiceSelected(); // Wait for the user to make a choice
            let end = Date.now();

            let msElapsed = end - start; // Get the time elapsed

            iatList.push([this.section, msElapsed, this.sectionPrompt, this.terms[i], keyChoice]);

            console.log(iatList);
        }
        
        return new Promise((resolve) => { 
            resolve();
        });
    }

    // After the user has finished their section, this method can be called ot pause for a break
    async pause(){
        let catImage = await this.getCatImage();
        
        // Hide the question section and show a break screen
        iat_breather.classList.remove("content-gone");
        iat_breather.classList.add("fadeInBreather");

        iat_questions.classList.add("content-gone"); 
        
        iat_breather_img.src = catImage[0].url; // [0] is the promise result
        iat_breather_message.innerHTML = "You have completed section <strong>" + this.section + " of " + this.totalSections + "</strong>. Take a small breather!";


        const timer = setInterval(() => {
            this.timeCounter -= 1;
            iat_breather_timer.innerHTML = "<strong>You're on break for " + this.timeCounter + " seconds!</strong>";
        }, 1000)

        // Once a promise is returned, continue the IAT process (after 5 seconds)
        // Because of this, we do not need a continue button
        return new Promise((resolve) => { 
            setTimeout(() => {
                iat_breather.classList.remove("fadeInBreather");
                iat_breather.classList.add("content-gone");

                iat_questions.classList.remove("content-gone");

                // Stop the timer
                clearInterval(timer);

                this.timeCounter = 5; // reset class variable (all classes use the same instance value)
                iat_breather_timer.innerHTML = "<strong>You're on break for " + "5" + " seconds!</strong>";

                // End the promise so the IAT process can continue
                resolve();
            }, 5000);    
        });
    }

    getCatImage(){
        return new Promise(async (resolve) => {
            let result;
            
            // GET request to Cat API for a random cat image
            // Convert response.json() converts JSON to a JS object
            try{
                let response = await fetch("https://api.thecatapi.com/v1/images/search?larryfoundcatapi");
                result = await response.json(); 
            }
            catch (err){
                console.log(err);
            }
            finally{
                resolve(result);
            }
        });
    }
}

// FUNCTIONS =========================================================================================================================

// Remove the user survey and reveal the IAT instructions (welcome)
function beginInstructions(){
    let survey = document.getElementsByClassName("user-survey")[0];

    let welcome = document.getElementsByClassName("instructions-welcome-text")[0];
    let acknowledgement = document.getElementsByClassName("instructions-acknowledgement-text")[0];

    if (userData.relationship === "Student"){
        let gradeLevel;
        (userData.grade === 3) ? gradeLevel = "rd" : gradeLevel = "th";

        welcome.innerHTML = "Welcome, " + userData.grade + gradeLevel + " grader!";
        acknowledgement.innerHTML = "The survey you have here does not collect any personal identifiers. Today, we want to test your reaction speed to a couple of questions; your answers are all anonymous. You may have negative answer choices to choose from, like as \"bad\" or \"gloomy.\" Some people may not like this.";
    }
    
    survey.classList.add("content-gone");
    instructions.classList.remove("content-gone");

}

// Remove the welcome and acknowedgement text and reveal how to use the IAT
function continueInstructions(){
    
    let welcome = document.getElementsByClassName("instructions-welcome-text")[0];
    let acknowledgement = document.getElementsByClassName("instructions-acknowledgement-text")[0];

    let info = document.getElementsByClassName("instructions-info-text")[0];
    let example = document.getElementsByClassName("instructions-example-text content-gone")[0];
    let start = document.getElementsByClassName("instructions-start-text")[0];

    // Left choice and right choice buttons
    let left_choice_start = document.getElementsByClassName("left-choice")[0];
    let right_choice_start = document.getElementsByClassName("right-choice")[0];

    welcome.classList.add("content-gone");
    acknowledgement.classList.add("content-gone");
    iat_agreement.classList.add("content-gone");

    info.classList.remove("content-gone");
    example.classList.remove("content-gone");
    start.classList.remove("content-gone");

    left_choice_start.classList.add("fadeInStartIAT");
    right_choice_start.classList.add("fadeInStartIAT");
}

// Fisher-Yates Shuffle: https://bost.ocks.org/mike/shuffle/
// pull a random card from the deck repeatedly and set it aside, incrementally building a new stack. 
// As long as you pick each remaining card from the deck with equal probability, you’ll have a 
// perfectly-unbiased random stack when you’re done
function shuffleArray(array){
    let arrayIndex = array.length; // We start at the end of the array and work backwards 
    let currentValue;
    let remainingValue;

    // While there remain elements to shuffle…
    while (arrayIndex > 0) {
  
      // Pick a remaining element…
      remainingValue = Math.floor(Math.random() * arrayIndex--);
  
      // And swap and replace it with the current element.
      currentValue = array[arrayIndex];
      
      array[arrayIndex] = array[remainingValue];
      array[remainingValue] = currentValue; // keep swapping values
    }
    return array;  
}

function choiceSelected() {
    return new Promise((resolve) => { 
        
      // we immediately return a Promise, however the await from the test function waits for resolve being called:
      document.addEventListener('keydown', (e) => {
        if (e.key === "e") {
            resolve("e"); // Promise value
        }
        else if (e.key === "i"){
            resolve("i"); // Promise value
        }
      });
    });
}

// By starting the test, hide the instructions and reveal the upcoming questions
// We want the terms to be jumbled up together randomly so we use randomArray() function 
async function startTest(){
    // Start the IAT process
    iat_questions.classList.remove("content-gone");
    instructions.classList.add("content-gone");

    // Set terms based on whether the user is a student or a teacher
    let positiveTerms;
    let negativeTerms;
    let studentTerms;
    let themTerms;

    if (userData.relationship === "Student"){
        positiveTerms = ["Joyful", "Happy", "Content", "Cheerful"];
        negativeTerms = ["Miserable", "Sad", "Gloomy", "Depressed"];
        studentTerms  = ["Me", "Self", "I", "My"];
        themTerms     = ["Them", "Other", "Him", "Her"];
    }
    else if (userData.relationship === "Teacher"){
        positiveTerms = ["Motivated", "Studious", "Competent", "Collaborative"];
        negativeTerms = ["Disruptive", "Lazy", "Cheaters", "Irresponsible"];
        studentTerms  = ["Pupil", "Learner"];
        themTerms     = ["Them", "Other"];
    }

    // Group all terms together and shuffle later
    let termGroups = [positiveTerms, negativeTerms, studentTerms, themTerms].flat();

    const iatOne = new IAT('Student & Positive', 1, shuffleArray(termGroups));
    await iatOne.run();
    await iatOne.pause();

    const iatTwo = new IAT('Student & Negative', 2, shuffleArray(termGroups));
    await iatTwo.run();
    await iatTwo.pause();

    const iatThr = new IAT('Student & Positive', 3, shuffleArray(termGroups));
    await iatThr.run();
    await iatThr.pause();

    const iatFour = new IAT('Student & Negative', 4, shuffleArray(termGroups));
    await iatFour.run();
    await iatFour.pause();

    const iatFive = new IAT('Student & Positive', 5, shuffleArray(termGroups));
    await iatFive.run();
    await iatFive.pause();

    const iatSix = new IAT('Student & Negative', 6, shuffleArray(termGroups));
    await iatSix.run();
    await iatSix.pause();

    const iatSeven = new IAT('Student & Positive', 7, shuffleArray(termGroups));
    await iatSeven.run();
    await iatSeven.pause();

    const iatEight = new IAT('Student & Negative', 8, shuffleArray(termGroups));
    await iatEight.run();

    userData.data = iatList; // adding the IAT data to the userData object
    endTest();
}  

function endTest(){
    let iat_finish = document.getElementsByClassName("iat-finish")[0];
    let results_text = document.getElementById("results-text");

    iat_questions.classList.add("content-gone");
    iat_finish.classList.remove("content-gone");

    postRequestData();
    
    results_text.innerHTML = iatList.join("<br>"); // Split each element in the arraylist by line break
}

async function postRequestData(){
    
    // Check if the user is a student or a teacher
    let relationship = userData.relationship;

    const response = await fetch(`https://myservertest.azurewebsites.net/${relationship}/`, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // send a JSON to the server
        },
        body: JSON.stringify(userData)
    });
    console.log(response.json()); // Get response from server and convert to JS Object
}

// MAINSETUP =========================================================================================================================

// Check if the user has completed the user survey
let metInstructions = false;

// Check if the user has agreed to the terms
let startedTest = false;
let agreeTerms = false;

rootElement.addEventListener("keyup", (keyboardEvent) => {

    // Check if the user has completed the user survey (all surveys have a relationship property)
    (userData.hasOwnProperty("relationship"))? metInstructions = true : metInstructions = false;

    if (keyboardEvent.key === "Enter") {
    
        // Check if the user has agreed to the terms
        if (startedTest === true) {
            return;
        } 
        if (agreeTerms === false && metInstructions === true) {
            agreeTerms = true;
            continueInstructions();
            return;
        }
        
        // Once the user understands what they need to do, start the test
        if (agreeTerms === true){
            startTest();
            startedTest = true;
        }
    }

    // the choiceSelected() function is only useful if the IAT class is awaiting for a response
    // this means the user can press the keys during the break period and it won't do anything undesirable
    if (keyboardEvent.key === "e" || keyboardEvent.key === "i"){
        choiceSelected();
    }
})