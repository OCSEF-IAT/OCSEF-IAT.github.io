// VARIABLES =========================================================================================================================

const rootElement = document.documentElement;

const iat_container = document.getElementsByClassName("iat-container")[0];
const instructions = document.getElementsByClassName("instructions")[0];
const iat_agreement = document.getElementsByClassName("instructions-agreement-text")[0];

const iat_questions = document.getElementsByClassName("iat-questions")[0];
const question_section = document.getElementsByClassName("question-section")[0];
const section_name = document.getElementsByClassName("question-section-name")[0];
const question_word = document.getElementsByClassName("question-word")[0];

// IAT CLASS =========================================================================================================================

// This is where all the iatData will go. It will be displayed at the end of the test
const iatList = [];

let optionChosen = false;
class IAT{

    constructor(prompt, sectionNumber, terms){
        this.sectionPrompt = prompt; // (ex. Student & Negative)
        this.terms = terms;
        this.section = sectionNumber;
        this.totalSections = 8;
    }

    async run(){
        section_name.innerHTML = "Current Section: " + "<strong>" + this.sectionPrompt + "</strong>";
        question_section.innerHTML = "Section " + this.section + " of " + this.totalSections;

        for (let i = 0; i < this.terms.length; i++){
            
            question_word.innerHTML = this.terms[i];

            let start = Date.now(); // Get the current time
            let keyChoice = await choiceSelected(); // Wait for the user to make a choice
            let end = Date.now();

            let msElapsed = end - start; // Get the time elapsed

            iatList.push(["(" + this.section, msElapsed, this.sectionPrompt, "\"" + this.terms[i] + "\"", "\"" + keyChoice + "\"" + ")"]);
            
            console.log(iatList);
        }
        
        return new Promise((resolve) => { 
            resolve();
        });
    }
}

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
      array[remainingValue] = currentValue; // keep swapping values
    }
  
    console.log(array);
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
    iat_questions.classList.remove("content-gone");
    instructions.classList.add("content-gone");

    let positiveTerms = ["Motivated", "Studious", "Competent", "Collaborative"];
    let negativeTerms = ["Disruptive", "Lazy", "Cheaters", "Irresponsible"];
    let studentTerms  = ["Pupil", "Learner"];
    let themTerms     = ["Them", "Other"];

    let termGroups = [positiveTerms, negativeTerms, studentTerms, themTerms].flat();

    const iatOne = new IAT("Student & Positive", 1, shuffleArray(termGroups));
    await iatOne.run();

    const iatTwo = new IAT("Student & Negative", 2, shuffleArray(termGroups));
    await iatTwo.run();

    const iatThr = new IAT("Student & Positive", 3, shuffleArray(termGroups));
    await iatThr.run();

    const iatFour = new IAT("Student & Negative", 4, shuffleArray(termGroups));
    await iatFour.run();

    const iatFive = new IAT("Student & Positive", 5, shuffleArray(termGroups));
    await iatFive.run();

    const iatSix = new IAT("Student & Negative", 6, shuffleArray(termGroups));
    await iatSix.run();

    const iatSeven = new IAT("Student & Positive", 7, shuffleArray(termGroups));
    await iatSeven.run();

    const iatEight = new IAT("Student & Negative", 8, shuffleArray(termGroups));
    await iatEight.run();

    endTest();
}  

function endTest(){
    let iat_finish = document.getElementsByClassName("iat-finish")[0];
    let results_text = document.getElementById("results-text");

    iat_questions.classList.add("content-gone");
    iat_finish.classList.remove("content-gone");

    results_text.innerHTML = iatList.join("<br>"); // Split each element in the arraylist by line break
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

    if (keyboardEvent.key === "e" || keyboardEvent.key === "i"){
        choiceSelected();
    }
})