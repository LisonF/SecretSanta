/*FIREBASE initialisation*/
// Import the functions you need from the SDKs you need
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCjePvAVzrjKLK78EipUGZ7O9EBVBFq_mU',
    authDomain: 'my-secret-santa-d581b.firebaseapp.com',
    projectId: 'my-secret-santa-d581b',
    storageBucket: 'my-secret-santa-d581b.appspot.com',
    messagingSenderId: '803053895148',
    appId: '1:803053895148:web:ae2a35dfc53d80bea214c9',
};

// Initialize Firebase & services
const app = initializeApp(firebaseConfig);
const db = getFirestore();

/* DEFINITION DES VARIABLES PARTAGEES DANS LE DOCUMENT */
const draw = document.getElementsByClassName('draw');
const currentRule = document.getElementsByClassName('currentRule');
const optionsPerParticipant = {};

let currentBox = draw[0];
var participantsList = [];

/* INITIALISATION DES REGLES */
// const rules = {reciprocal: [], unreciprocal: [] };
const rules = [];

/***************************/
/* NAVIGATE ACROSS THE APP */
/***************************/

/* DEFINITION DES PREREQUIS ASSOCIES A CHAQUE ETAPE */
class Prerequisites {
    constructor(condition, errorMessage) {
        this.condition = condition; //condition qui doit être true pour permettre de passer à la box suivante
        this.errorMessage = errorMessage; //message d'erreur affiché dans l'alert
    }
}

let prerequisites = { nbParticipants: [], participantsName: [], rules: [] };

prerequisites.nbParticipants.push(
    new Prerequisites(
        function () {
            return document.getElementsByName('nbPp')[0].value > 2;
        },
        function () {
            return 'Sélectionnez au moins 3 participants.';
        }
    )
);
prerequisites.participantsName.push(
    new Prerequisites(
        function () {
            return isThereAMissingParticipant()[0];
        },
        function () {
            return 'Renseignez le nom du ' + isThereAMissingParticipant()[1];
        }
    )
);

prerequisites.participantsName.push(
    new Prerequisites(
        function () {
            return isThereADoublonInParticipants()[0];
        },
        function () {
            return (
                isThereADoublonInParticipants()[1] +
                ` apparait 2 fois, supprimez une des deux occurences.`
            );
        }
    )
);

function isThereAMissingParticipant() {
    let nameInputs = $('.participantName-input');
    var condition = true;
    for (let i = 0; i < nameInputs.length; i++) {
        if ($(nameInputs[i]).val() === '') {
            var condition = false;
            var participantMissing = $(nameInputs[i]).attr('placeholder');
            break;
        }
    }
    return [condition, participantMissing];
}
function isThereADoublonInParticipants() {
    let listOfParticipants = getListOfParticipants(
        document.getElementsByName('participant')
    );
    var condition = true;
    for (let i = 0; i < listOfParticipants.length; i++) {
        if (
            listOfParticipants.filter((elem) => elem === listOfParticipants[i])
                .length > 1
        ) {
            var condition = false;
            var participantDoublon = listOfParticipants[i];
        }
    }
    console.log(condition, participantDoublon);
    return [condition, participantDoublon];
}

/***************************/
/* NAVIGATE ACROSS THE APP */
/***************************/

currentBox.style.display = 'grid';

$(document).on('click', '.next-btn', () => {
    //Passer à la question suivante
    let error = false;
    for (let i = 0; i < prerequisites[currentBox.id].length; i++) {
        // Verifie les prérequis associé à chaque étape
        if (prerequisites[currentBox.id][i].condition() === false) {
            error = true;
            alert(prerequisites[currentBox.id][i].errorMessage());
            break;
        }
    }

    if (error === false) {
        switch (currentBox.id) {
            case 'nbParticipants':
                makeInputBoxes(document.getElementsByName('nbPp')[0].value);
                break;
            case 'participantsName':
                participantsList = getListOfParticipants(
                    document.getElementsByName('participant')
                );
                participantsToSelect(
                    (participantsList = participantsList),
                    document.getElementsByClassName('select')
                );
                $('.new-rule-container, .reciprocal-rule').hide();
                $('.rules-list-container').show();
                break;
            default:
                break;
        }
        $(currentBox).hide();
        currentBox = currentBox.nextElementSibling;
        currentBox.style.display = 'grid';
    }
});

$(document).on('click', '.prev-btn', () => {
    //Retour à la question précédente
    $(currentBox).hide();
    $(currentBox.previousElementSibling).show();
    switch (currentBox.id) {
        case 'participantsName':
            $('#fillParticipantsName').children().not('.instructions').remove();
            break;
        case 'rules':
            removeContent($('.select'), $('option'));
        default:
            break;
    }
    currentBox = currentBox.previousElementSibling;
});

function removeContent(removeFrom, classToBeRemoved) {
    //remove all content of a DOM element except for the instructions
    for (let e in removeFrom) {
        $(e).find(classToBeRemoved).not('.instructions').remove();
    }
}

/****************/
/* PARTICIPANTS */
/****************/

function makeInputBoxes(n) {
    // Crée les input boxes selon le nombre de participants
    for (let i = 1; i <= n; i++) {
        fillParticipantsName.insertAdjacentHTML(
            'beforeend',
            `<input class = "participantName-input" id="participant${i}" name="participant"  type="text" placeholder= "Participant ${i}"/><br>`
        );
    }
}

function getListOfParticipants(list) {
    // Récupère la liste des participants en format Array à partir d'un objet
    let participantsList = list;
    let participantsNameArray = [];
    for (let i = 0; i < participantsList.length; i++) {
        participantsNameArray.push(participantsList[i].value);
    }
    return participantsNameArray;
}

/**********/
/* RULES  */
/**********/

$('#results').hide();
$('.new-rule-container, .reciprocal-rule').hide();

//Open "Add a new rule" window and reset the default values
$(document).on('click', '#create-rule', () => {
    openNewRuleWindow();
    resetNewRuleWindow();
});

//Participants name's in the list
// Get names from user inputs
$(document).ready(function () {
    $('#reciprocal, #participant1-select, #participant2-select').change(
        function () {
            // Add participants names in the reciprocal rule
            document.getElementById(
                'participant1-reciprocal'
            ).innerHTML = `<strong>${$('#participant2-select')
                .find(':selected')
                .text()}</strong>`;
            document.getElementById(
                'participant2-reciprocal'
            ).innerHTML = `<strong>${$('#participant1-select')
                .find(':selected')
                .text()}</strong>`;
        }
    );
});

// Remove participant selected as Participant1 from participant2 available options
$('#participant1-select').change(function () {
    $('.select').not(this).find(`option`).show();
    $('.select')
        .not(this)
        .find(`#${$(this).find(':selected').text()}`)
        .hide();
    //Go back to "..." if participant1 is the same as participant2
    if (this.value === document.getElementById('participant2-select').value) {
        document.getElementById('participant2-select').value = '...';
    }
});

// Toggle reciprocal rule depending on reciprocal status
$(document).ready(function () {
    //set initial state.
    $('#reciprocal').change(function () {
        if ($(this).is(':checked')) {
            $('.reciprocal-rule').show();
        } else {
            $('.reciprocal-rule').hide();
        }
    });
});

// Save
$(document).on('click', '#add-rule', () => {
    let participant1 = document.getElementById('participant1-select').value,
        participant2 = document.getElementById('participant2-select').value;
    if (participant1 === '...' || participant2 === '...') {
        alert('Sélectionnez deux participants avant de valider');
    } else if (thisRuleExists(participant1, participant2)) {
        goBackToRulesList();
    } else {
        //If the user is changing a rule
        if (document.getElementById('toModify')) {
            //get the node of the rule to be modifed
            let elemToModify = document.getElementById('toModify');
            //get the 2 participants to be modified
            let participant1ToModify =
                    elemToModify.querySelector('.participant1').innerHTML,
                participant2ToModify =
                    elemToModify.querySelector('.participant2').innerHTML;
            //remove their rule from the Rules Array
            removeRuleFromArray(participant1ToModify, participant2ToModify);
            //Save the new rule in the rule Array
            saveTheRule(participant1, participant2);
            // Replace their names by the new participants in the rules list
            elemToModify.querySelector('.participant1').innerHTML =
                document.getElementById('participant1-select').value;
            elemToModify.querySelector('.participant2').innerHTML =
                document.getElementById('participant2-select').value;
            //remove the 'toModify Id'
            elemToModify.removeAttribute('id');
            goBackToRulesList();
        }
        //else, it is a new rule so save it
        else {
            saveTheRule(participant1, participant2);
            writeTheRule(participant1, participant2);
        }
        // Save the reciprocal if required
        if (document.getElementById('reciprocal').checked === true) {
            if (thisRuleExists(participant2, participant1)) {
            } else {
                saveTheRule(participant2, participant1);
                writeTheRule(participant2, participant1);
            }
        }
        goBackToRulesList();
        resetNewRuleWindow();
    }
});

//Cancel
$(document).on('click', '#cancel-rule', () => {
    if (document.getElementById('toModify')) {
        document.getElementById('toModify').removeAttribute('id');
    }
    goBackToRulesList();
    resetNewRuleWindow();
});

// Remove a rule
$(document).on('click', '.remove-rule', function () {
    removeRuleFromArray(
        $(this).parents('li').find('.participant1').text(),
        $(this).parents('li').find('.participant2').text()
    );
    $(this).parents('li').remove();
});

// Modify a rule
$(document).on('click', '.modify-rule', function () {
    //add 'toModify id to the HTML element to modify
    $(this).parents('li').attr('id', 'toModify');
    // pre-set the dropdown buttons with the participants names
    document.getElementById('participant1-select').value = $(this)
        .parents('li')
        .find('.participant1')
        .text();
    document.getElementById('participant2-select').value = $(this)
        .parents('li')
        .find('.participant2')
        .text();

    openNewRuleWindow();
});

function openNewRuleWindow() {
    $('.new-rule-container').show();
    $('.rules-list-container').hide();
    $('#validate-btn, .prev-btn').hide();
    document.getElementById('rules').style.gridTemplateRows =
        '[title] 60px [main] 1fr [btn] 1px';
}

function writeTheRule(participant1, participant2) {
    const icons = `<i class="fi fi-sr-trash remove-rule"></i><i class="fi fi-sr-pencil modify-rule"></i>`;
    let rulePhrasing = `<li>${icons}<span class="participant1">${participant1}</span> ne peut pas faire de cadeau à <span class="participant2">${participant2}</span>.</li>`;
    document
        .getElementById('rules-list')
        .insertAdjacentHTML('beforeend', rulePhrasing);
}

function removeRuleFromArray(p1, p2) {
    for (var i = 0; i < rules.length; i++) {
        if (rules[i][0] === p1 && rules[i][1] === p2) {
            rules.splice(i, 1);
            i--;
        }
    }
}

function saveTheRule(participant1, participant2) {
    rules.push([participant1, participant2]);
}

function resetNewRuleWindow() {
    $('.reciprocal-rule').hide();
    document.getElementById('reciprocal').checked = false;
    document.getElementById('participant1-select').value = '...';
    document.getElementById('participant2-select').value = '...';
}

function thisRuleExists(participant1, participant2) {
    //Vérifie que la règle n'existe pas
    let existing = false;
    for (let i in rules) {
        if (rules[i][0] === participant1 && rules[i][1] === participant2) {
            existing = true;
        }
    }
    return existing;
}

function participantsToSelect(list, elem) {
    // Create the list of the participnats in the dropdown buttons
    for (let j = 0; j < elem.length; j++) {
        for (let i = 0; i < list.length; i++) {
            elem[j].insertAdjacentHTML(
                'beforeend',
                `<option id='${list[i]}'>${list[i]}</option>`
            );
        }
    }
}

/*********************/
/* VALIDATION & DRAW */
/*********************/

//FIREBASE: Collection reference
const collectionRef = collection(db, 'results');

$(document).on('click', '#validate-btn', () => {
    $('.draw').hide();
    document.getElementById('loading').style.display = 'grid';

    /** GET ALL AVAILABLE OPTIONS FOR EACH PARTICIPANT */
    //Get all the options for each participant based on the participants list and the rules
    const options_per_participant = getParticipantsOptions();
    /** EXECUTE THE DRAW */
    const nbMaxLoop = 10; // Number of times the loop will iterate without success
    let n_loop = 0;

    // Try drawing a certain amount (= nbMaxLoop) of times
    while (n_loop < nbMaxLoop) {
        // Make an object with participantName as key and its options as content
        participantsList.forEach(
            (participant, i) =>
                (optionsPerParticipant[participant] =
                    options_per_participant[i])
        );
        console.log(n_loop);
        // Initialise the draw variables at the beginning of the draw
        let ppWithTheLessOptions = '',
            assignedPp = '',
            minNbOptions = participantsList.length,
            participantsPairs = [];

        // Loop until no more participants
        loopOverParticipants: while (
            Object.keys(optionsPerParticipant).length > 0
        ) {
            // get the participant with the least options
            ({ minNbOptions, ppWithTheLessOptions } =
                getTheParticipantWithTheLessOptions(
                    minNbOptions,
                    ppWithTheLessOptions
                ));
            // Break loop if at least one participant has no option, else continue the draw
            if (minNbOptions === 0) {
                displayErrorPage();
                break loopOverParticipants;
            } else {
                //Randomly assign one of the option to the participant with the least
                assignedPp =
                    optionsPerParticipant[ppWithTheLessOptions][
                        Math.floor(Math.random() * minNbOptions)
                    ];
                participantsPairs.push({
                    giver: ppWithTheLessOptions,
                    receiver: assignedPp,
                });
                // Remove the assigned option from the other participants options' list
                for (let p in optionsPerParticipant) {
                    optionsPerParticipant[p] = optionsPerParticipant[p].filter(
                        (value) => value !== assignedPp
                    );
                }
                // Remove the participant with the least options from the list
                delete optionsPerParticipant[ppWithTheLessOptions];
                minNbOptions = Object.keys(optionsPerParticipant).length;
            }
        }

        // if we draw everybody (ie, there is the same number of pairs as the number of participants), the draw is done
        if (participantsPairs.length === participantsList.length) {
            //Save the result list into Firebase
            // const newResultRef = saveToFirestore(participantsPairs);
            saveToFirestore(participantsPairs);

            break;
        }

        n_loop++;
    }

    if (n_loop === nbMaxLoop) {
        displayErrorPage();
    }
});

function saveToFirestore(participantsPairs) {
    const newResultRef = doc(collection(db, 'result'));
    setDoc(newResultRef, { participantsPairs }).then(() => {
        goToResultsPage(newResultRef);
    });
}

function goToResultsPage(newResultRef) {
    let resultUrl =
        document.location.origin +
        document.location.pathname.substring(
            0,
            document.location.pathname.lastIndexOf('/')
        ) +
        '/results.html?' +
        newResultRef.id;

    document.location.assign(resultUrl);
}

function getTheParticipantWithTheLessOptions(
    minNbOptions,
    ppWithTheLessOptions
) {
    Object.values(optionsPerParticipant).map((elem, index) => {
        if (elem.length <= minNbOptions) {
            // Get the minimum of options across participants
            minNbOptions = elem.length;
            //Get the name of the participant with the least options
            ppWithTheLessOptions = Object.keys(optionsPerParticipant)[index];
        }
    });
    return { minNbOptions, ppWithTheLessOptions };
}

function getParticipantsOptions() {
    //from the list of participant
    return participantsList.map(function (p, _index, options) {
        // set available_options to all participants (i.e., options)
        var available_options = options;
        //remove the participant itself from the options
        available_options = available_options.filter((value) => value !== p);
        // go through each rule involving the participant and remove the other perticipant involved in the rule
        for (let r of rules) {
            if (r[0] === p) {
                available_options = removeTheOtherParticipant(
                    r,
                    p,
                    available_options
                );
            }
        }
        return available_options;
    });
}

// Remove the participant who is also part of the rule
function removeTheOtherParticipant(rule, participant, available_options) {
    let other_p = rule.filter((value) => value !== participant);
    available_options = available_options.filter(
        (value) => value !== other_p[0]
    );
    return available_options;
}

function goBackToRulesList() {
    $('.new-rule-container').hide();
    $('.rules-list-container').show();
    $('#validate-btn, #prev-btn').show();
    document.getElementById('rules').style.gridTemplateRows =
        '[title] 60px [main] 1fr [btn] 100px';
}

function displayErrorPage() {
    $('.draw').hide();
    $('#error').show();
}

/*************/
/** RESULTS **/
/*************/

// Restart = reload the page
$(document).on('click', '#restart-btn', () => {
    window.location.reload();
});

// Go back to the rules
$(document).on('click', '.backtorules-btn', function () {
    $('.draw').hide();
    $('#rules').show();
    goBackToRulesList();
});
