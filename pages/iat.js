// VARIABLES =========================================================================================================================

// Body and Root Variables
const body = {
    rootElement: document.documentElement,
    iat_container: document.getElementsByClassName("iat-container")[0]
}

// All Variables for instruction
const instructions = {
    instructionsClass: document.getElementsByClassName("instructions")[0],
    
    instructionsText: {
        instructionsTextContainer: document.getElementsByClassName("instructions-text")[0],

        welcome: document.getElementsByClassName("instructions-welcome-text")[0],
        acknowledgement: document.getElementsByClassName("instructions-acknowledgement-text")[0],
        info: document.getElementsByClassName("instructions-info-text")[0],
        example: document.getElementsByClassName("instructions-example-text content-gone")[0],
    
        keywords: document.getElementsByClassName("instructions-keywords")[0]
    },

    // When you're ready press ENTER to Continue
    start: document.getElementsByClassName("instructions-start-text")[0]
}

const iatProcess = {
    iat_agreement: document.getElementsByClassName("instructions-agreement-text")[0],

    iat_questions: document.getElementsByClassName("iat-questions")[0],
    question_section: document.getElementsByClassName("question-section")[0],
    section_name: document.getElementsByClassName("question-section-name")[0],
    question_word: document.getElementsByClassName("question-word")[0],

    // IAT Breather Section
    breather: {
        iat_breather: document.getElementsByClassName("iat-breather")[0],
        iat_breather_img: document.getElementById("iat-breather-image"),
        iat_breather_message: document.getElementsByClassName("iat-breather-message")[0],
        iat_breather_timer: document.getElementsByClassName("iat-breather-timer")[0]
    },

    submission: document.getElementsByClassName("user-survey-submission")[0]
}

// Basic DOM Elements to read survey data from the user and store into the userData object
const userSurveySubmit = {
    teacher: {
        teacherButton: document.getElementById("user-survey-relationship-teacher"),

        gradeOptions: document.getElementsByClassName("user-survey-teacher-grade-option"),
        classOptions: document.getElementsByClassName("user-survey-teacher-class-option")
    },

    student: {
        studentButton: document.getElementById("user-survey-relationship-student"),

        gradeOptions: document.getElementsByClassName("user-survey-grade-option"),
        classOptions: document.getElementsByClassName("user-survey-classes-option")
    }
}

// GRAB USER SURVEY DATA =============================================================================================================

// Submission button for the user survey to finish 
iatProcess.submission.addEventListener("click", () => {
    storeSurveyData();
});

// This is where all the iatData will go. It will be sent to the database at the end of the test
let userData = {};

function storeSurveyData(){
    // Check if the user is a teacher or student
    const isTeacher = userSurveySubmit.teacher.teacherButton.classList.contains("user-survey-selector-clicked");
    (isTeacher)? userData.relationship = "Teacher": userData.relationship = "Student";

    if (isTeacher === true) teacherStudentHandler(userSurveySubmit.teacher.gradeOptions, userSurveySubmit.teacher.classOptions);
    if (isTeacher === false) teacherStudentHandler(userSurveySubmit.student.gradeOptions, userSurveySubmit.student.classOptions);

    // Start the IAT instructions and process
    beginInstructions();

    function teacherStudentHandler(gradeOptions, classOptions){
        // Get the index for the grade and class choice that the student clicks 
        for (let option = 0; option < gradeOptions.length; option += 1){
            if (gradeOptions[option].classList.contains("user-survey-selector-clicked")){

                // Add the grade to the userData object
                userData.grade = parseInt(gradeOptions[option].innerHTML);
            }
        }

        for (let option = 0; option < classOptions.length; option += 1){
            if (classOptions[option].classList.contains("user-survey-selector-clicked")){

                // Add the class to the userData object
                userData.classesAdvanced = classOptions[option].innerHTML;
            }
        }
    }

}

// IAT CLASS =========================================================================================================================

// This is where all the IAT data will go. It will be sent to the database at the end of the test
let iatList = []; 
 
let optionChosen = false;
class IAT{

    constructor(prompt, sectionNumber, terms){
        this.sectionPrompt = prompt; // (ex. Negative)
        this.terms = terms;
        this.section = sectionNumber;
        this.totalSections = 8;

        this.timeCounter = 5; // 5 second break time
    }

    async run(){

        iatProcess.section_name.innerHTML = "Current Section: " + "<strong>" + this.sectionPrompt + "</strong>";
        iatProcess.question_section.innerHTML = "Section " + this.section + " of " + this.totalSections;

        for (let i = 0; i < this.terms.length; i++){
            
            iatProcess.question_word.innerHTML = this.terms[i];

            // Reset animation as new words are being displayed to the user            
            iatProcess.question_word.classList.add("fade-in-iat-question");

            setTimeout(() => {
                iatProcess.question_word.classList.remove("fade-in-iat-question");
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
        iatProcess.breather.iat_breather.classList.remove("content-gone");
        iatProcess.breather.iat_breather.classList.add("fadeInBreather");

        iatProcess.iat_questions.classList.add("content-gone"); 
        
        // Display the cat image and a message to the user
        // We have a try/catch in case the cat api refuses our GET Request
        try{
            iatProcess.breather.iat_breather_img.src = catImage[0].url; // [0] is the promise result
        }
        catch (error){
            console.log(error);
        }
        finally{
            iatProcess.breather.iat_breather_message.innerHTML = "You have completed section <strong>" + this.section + " of " + this.totalSections + "</strong>. Take a small breather!";
        }


        const timer = setInterval(() => {
            this.timeCounter -= 1;
            iatProcess.breather.iat_breather_timer.innerHTML = "<strong>You're on break for " + this.timeCounter + " seconds!</strong>";
        }, 1000)

        // Once a promise is returned, continue the IAT process (after 5 seconds)
        // Because of this, we do not need a continue button
        return new Promise((resolve) => { 
            setTimeout(() => {
                iatProcess.breather.iat_breather.classList.remove("fadeInBreather");
                iatProcess.breather.iat_breather.classList.add("content-gone");

                iatProcess.iat_questions.classList.remove("content-gone");

                // Stop the timer
                clearInterval(timer);

                this.timeCounter = 5; // reset class variable (all classes use the same instance value)
                iatProcess.breather.iat_breather_timer.innerHTML = "<strong>You're on break for " + "5" + " seconds!</strong>";

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

    if (userData.relationship === "Student"){
        let gradeLevel;
        (userData.grade === 3) ? gradeLevel = "rd" : gradeLevel = "th";

        instructions.instructionsText.welcome.innerHTML = "Welcome, " + userData.grade + gradeLevel + " grader!";
    }
    else{
        instructions.instructionsText.welcome.innerHTML = "Welcome, " + userData.relationship + "!";
    }

    instructions.instructionsText.acknowledgement.innerHTML = "The survey you are about to complete will not collect any personal information and all answers will be anonymous.";
    
    survey.classList.add("content-gone");
    instructions.instructionsClass.classList.remove("content-gone");

}

// Remove the welcome and acknowedgement text and reveal how to use the IAT
function continueInstructions(){

    // Hide the welcome and acknowledgement text
    instructions.instructionsText.welcome.classList.add("content-gone");
    instructions.instructionsText.acknowledgement.classList.add("content-gone");
    iatProcess.iat_agreement.classList.add("content-gone");

    // Show the instructions
    instructions.instructionsText.info.classList.remove("content-gone");
    instructions.instructionsText.info.innerHTML = "In the following test, you will be asked to <span class=\"underline\">sort words with each other</span> with the following keys:<br><span class=\"hotkeys-info\">[I] = Included Yes, [E] = Excluded No</span>";
    
    instructions.instructionsText.example.classList.remove("content-gone");
    
    // Give teacher instructions if the user is a teacher
    if (userData.relationship === "Teacher"){
        instructions.instructionsText.example.innerHTML = "<span class=\"bold\">For Example:</span><br><br>The category is <span class=\"bold\">Positive Words</span>. When the word \"Studious\" appears, you press <span class=\"hotkeys-info\">[I]</span> because \"Studious\" is a <span class=\"bold\">Positive Word</span><br><br>The category is <span class=\"bold\">Negative Words</span>. When the word \"Studious\" appears, you press <span class=\"hotkeys-info\">[E]</span> because \"Studious\" is a <span class=\"bold\">Negative Word</span>";
        instructions.instructionsText.keywords.innerHTML = "<span class=\"bold\">Key Words:</span><ul><li><span class=\"underline\">Positive Words</span>: Motivated, Studious, Competent, Collaborative</li><li><span class=\"underline\">Negative Words</span>: Disruptive, Lazy, Cheaters, Irresponsible</li</ul>";
    }
    
    instructions.instructionsText.keywords.classList.remove("content-gone");
    instructions.start.classList.remove("content-gone");
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
      document.addEventListener('keydown', function resolveHandler(e){
        if (e.key === "e") {
            document.removeEventListener('keydown', resolveHandler); // Unmount event listener after use
            resolve("e"); // Promise value
        }
        else if (e.key === "i"){
            document.removeEventListener('keydown', resolveHandler); // Unmount event listener after use
            resolve("i"); // Promise value
        }
      });
    });
}

// By starting the test, hide the instructions and reveal the upcoming questions
// We want the terms to be jumbled up together randomly so we use randomArray() function 
async function startTest(){
    // Start the IAT process
    iatProcess.iat_questions.classList.remove("content-gone");
    instructions.instructionsClass.classList.add("content-gone");

    // Left choice and right choice buttons for the iatProcess
    let leftChoice = document.getElementsByClassName("left-choice")[0];
    let rightChoice = document.getElementsByClassName("right-choice")[0];

    leftChoice.classList.add("fadeInStartIAT");
    rightChoice.classList.add("fadeInStartIAT");

    // Set terms based on whether the user is a student or a teacher
    let positiveTerms;
    let negativeTerms;

    if (userData.relationship === "Student"){
        positiveTerms = ["Joyful", "Happy", "Content", "Cheerful"];
        negativeTerms = ["Miserable", "Sad", "Gloomy", "Depressed"];
    }
    else if (userData.relationship === "Teacher"){
        positiveTerms = ["Motivated", "Studious", "Competent", "Collaborative"];
        negativeTerms = ["Disruptive", "Lazy", "Cheaters", "Irresponsible"];
    }

    // Group all terms together and shuffle later
    let termGroups = [positiveTerms, negativeTerms].flat();

    const iatOne = new IAT('Positive Words', 1, shuffleArray(termGroups));
    await iatOne.run();
    await iatOne.pause();

    const iatTwo = new IAT('Negative Words', 2, shuffleArray(termGroups));
    await iatTwo.run();
    await iatTwo.pause();

    const iatThr = new IAT('Positive Words', 3, shuffleArray(termGroups));
    await iatThr.run();
    await iatThr.pause();

    const iatFour = new IAT('Negative Words', 4, shuffleArray(termGroups));
    await iatFour.run();
    await iatFour.pause();

    const iatFive = new IAT('Positive Words', 5, shuffleArray(termGroups));
    await iatFive.run();
    await iatFive.pause();

    const iatSix = new IAT('Negative Words', 6, shuffleArray(termGroups));
    await iatSix.run();
    await iatSix.pause();

    const iatSeven = new IAT('Positive Words', 7, shuffleArray(termGroups));
    await iatSeven.run();
    await iatSeven.pause();

    const iatEight = new IAT('Negative Words', 8, shuffleArray(termGroups));
    await iatEight.run();

    userData.data = iatList; // adding the IAT data to the userData object
    await endTest();
}  

async function endTest(){
    let iat_finish = document.getElementsByClassName("iat-finish")[0];
    let iat_quote = document.getElementsByClassName("iat-finish-inspirational-quote")[0];
    let iat_qoute_author = document.getElementsByClassName("iat-finish-inspirational-quote-author")[0];

    let iat_quote_container = document.getElementsByClassName("iat-finish-inspirational-quote-container")[0];

    iatProcess.iat_questions.classList.add("content-gone");
    iat_finish.classList.remove("content-gone");
    iat_finish.classList.add("fadeIn");

    // Get a random quote from the list of quotes (no-cors mode is used in the GET Request to bypass CORS)
    try{
        let getQuote = await fetch("https://api.quotable.io/random");
        let quote = await getQuote.json();

        // Display the quote for the user to see
        iat_quote.innerHTML = `"${quote.content}"`;
        iat_qoute_author.innerHTML = `— ${quote.author}`;

        iat_quote_container.classList.add("fadeIn");
    }
    catch(err){
        console.log(err);
    }
    finally{
        // Send the data to the server
        postRequestData();

        console.log("Hang on tight. Sending POST Request to server...");
    }

    // Offically close the startTest() function
    return new Promise((resolve) => { resolve(); });
}

async function postRequestData(){
    
    // Check if the user is a student or a teacher
    let relationship = userData.relationship;

    const response = await fetch(`https://myservertest.azurewebsites.net/${relationship.toLowerCase()}/`, { 
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

body.rootElement.addEventListener("keyup", (keyboardEvent) => {

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
})