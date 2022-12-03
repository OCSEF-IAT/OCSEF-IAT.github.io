// VARIABLES =========================================================================================================================

const rootElement = document.documentElement;

const iat_container = document.getElementsByClassName("iat-container")[0];
const instructions = document.getElementsByClassName("instructions")[0];
const iat_agreement = document.getElementsByClassName("instructions-agreement-text")[0];

const iat_questions = document.getElementsByClassName("iat-questions")[0];

// IAT CLASS =========================================================================================================================

// This is where all the iatData will go. It will be displayed at the end of the test
const iatList = [];

class IAT{

    constructor(prompt, section, categories){
        this.promptInput = prompt; // (ex. Student & Negative)
        this.words = categories;
        this.section = section;
        this.totalSections = 8;

        this.promptCombo = [[2, 0],[2,1],[2,0],[2,1],[2,0],[2,1],[2,0],[2,1]]; // array of arrays of numbers
    }


}

/* Multivariable Assignment Example 
   var [a,b,c] = [1,2,3];
*/

// FUNCTIONS =========================================================================================================================

// Remove the welcome and acknowedgement text and reveal how to use the IAT
function continueInstructions(){
    
    let welcome = document.getElementsByClassName("instructions-welcome-text")[0];
    let acknowledgement = document.getElementsByClassName("instructions-acknowledgement-text")[0];

    let info = document.getElementsByClassName("instructions-info-text")[0];
    let example = document.getElementsByClassName("instructions-example-text content-gone")[0];
    let start = document.getElementsByClassName("instructions-start-text")[0];

    welcome.classList.add("content-gone");
    acknowledgement.classList.add("content-gone");
    iat_agreement.classList.add("content-gone");

    info.classList.remove("content-gone");
    example.classList.remove("content-gone");
    start.classList.remove("content-gone");
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
      array[remainingValue] = currentValue; // prevent duplicaiton of values 
    }
  
    return array;  
}

// By starting the test, hide the instructions and reveal the upcoming questions
// We want the terms to be jumbled up together randomly so we use randomArray() function 
function startTest(){
    iat_questions.classList.remove("content-gone");
    instructions.classList.add("content-gone");

    let positiveTerms = ["Motivated", "Studious", "Competent", "Collaborative"];
    let negativeTerms = ["Disruptive", "Lazy", "Cheaters", "Irresponsible"];
    let studentTerms  = ["Pupil", "Learner"];
    let themTerms     = ["Them", "Other"];

    let termGroups = [positiveTerms, negativeTerms, studentTerms, themTerms].flat();
    const iatOne = new IAT("Student & Positive", 1, shuffleArray(termGroups));

    console.log(iatOne.words);
}  

// MAINSETUP =========================================================================================================================

let startedTest = false;
let agreeTerms = false;

rootElement.addEventListener("keyup", (keyboardEvent) => {
    if (keyboardEvent.key === "Enter") {
    
        // Check if the user has agreed to the terms
        if (startedTest === true) {
            return;
        } 
        if (agreeTerms === false) {
            agreeTerms = true;
            continueInstructions();
            return;
        }
        
        // Once the user understands what they need to do, start the test
        (agreeTerms === true) ? startTest() : null;
        (agreeTerms === true) ? startedTest = true : null;
    }
})