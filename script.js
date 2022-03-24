/* DEFINITION DES VARIABLES PARTAGEES DANS LE DOCUMENT */
const draw = document.getElementsByClassName("draw");
const currentRule = document.getElementsByClassName("currentRule");
const optionsPerParticipant = {}, 
    nbMaxLoop = 10 // Number of times the loop will iterate without success

let currentBox = draw[0];
let selectedParticipants = {reciprocal: [], unreciprocal: [] };
var participantsList = [];


/* INITIALISATION DES REGLES */ 
const rules = {reciprocal: [], unreciprocal: [] };

class Rule {
    constructor(type, formName, participants) {
        this.type = type; //type de règle, réciproque ou non
        this.form = formName; //nom du form associé
        this.participants = participants; //liste des participants impliqués dans la règle
        this.ruleText = rulePhrasing(type, participants);

    }
};



/***************************/
/* NAVIGATE ACROSS THE APP */
/***************************/

/* DEFINITION DES PREREQUIS ASSOCIES A CHAQUE ETAPE */ 
class Prerequisites {
    constructor(condition, errorMessage) {
        this.condition = condition; //condition qui doit être true pour permettre de passer à la box suivante
        this.errorMessage = errorMessage; //message d'erreur affiché dans l'alert //TODO: Make it a method

    }
};

let prerequisites = {nbParticipants : [], participantsName : [], rules : []};

prerequisites
    .nbParticipants
    .push(new Prerequisites(function () {
        return document.getElementsByName("nbPp")[0].value>2;},
        "Veuillez sélectionner au moins 3 participants.")) ;
prerequisites
    .participantsName
    .push(new Prerequisites(function(){
        let a = $(".participantName_input")
        var condition = true
        for(let i = 0; i < a.length; i++){
            if($(a[i]).val() === ""){
                var condition = false;
            }
        };
        return condition},
    "Veuillez renseigner tous les noms des participants."));
prerequisites
    .participantsName
    .push(new Prerequisites(function(){
        let a = getListOfParticipants(document.getElementsByName("participant"))
        var condition = true
        for(let i = 0; i < a.length; i++){
            if (a.filter(elem => elem === (a[i])).length>1){
                var condition = false
                return condition}
        }},
        `Un participant apparait 2 fois, veuillez supprimer ou renommer une des deux occurences.`));

/***************************/
/* NAVIGATE ACROSS THE APP */
/***************************/
$("#biggerbox").hide();

start_btn.addEventListener("click", () => { //Appui sur Start, commencer le tirage
    $("#biggerbox").show();
    for (let i =0; i < draw.length; i++){
        draw[i].style.display = "none";
    };
    $('#start_btn, #prev_btn, #validate_btn, .description').hide()
    currentBox.style.display = "flex";

});

$(document).on("click", "#next_btn", () => { //Passer à la question suivante
    let error = false;
    for (let i = 0; i < prerequisites[currentBox.id].length; i++){ // Verifie les prérequis associé à chaque étape
        if (prerequisites[currentBox.id][i].condition() === false){
            error = true;
            alert(prerequisites[currentBox.id][i].errorMessage)
            break;
        }
    }

    if (error === false){ 
        switch(currentBox.id){
            case "nbParticipants":
                makeInputBoxes(document.getElementsByName("nbPp")[0].value);
                break; 
            case "participantsName":
                participantsList = getListOfParticipants(document.getElementsByName("participant"));
                makeNameBoxes(  participantsList = participantsList, 
                                document.getElementsByClassName("participantImages_block"))

                break;
            default : 
                break;
        }
        $(currentBox).hide(); 
        $(currentBox.nextElementSibling).show();
        currentBox = currentBox.nextElementSibling ; 
        hideOrShowPrevNextButtons(currentBox);
    }
});

$(document).on("click", "#prev_btn", () => {//Retour à la question précédente
    $(currentBox).hide(); 
    $(currentBox.previousElementSibling).show();
    switch(currentBox.id){
        case "participantsName":
            $("#fillParticipantsName").children().not(".instructions").remove();
            initParticipantBoxes($('.participantImage'));
            break;
        case "rules":
            initParticipantBoxes($('.participantImage'));
            removeContent($(".participantsBlock"), $('.participantImage'))
            removeContent($(".rules"), $(".savedRule"))
        default:
            
            break;
    }
    currentBox = currentBox.previousElementSibling ;
    hideOrShowPrevNextButtons(currentBox);
});


function hideOrShowPrevNextButtons(currentBox) { //Montre ou cache les boutons suivant et précédent selon leur pertinence

    if ($('.draw:last')[0] === currentBox) { //Cacher le bouton suivant cette boite est la dernière
        $("#next_btn").hide();
        $("#validate_btn").show();
    }
    else if ($('.draw:first')[0] === currentBox){//Cacher le bouton Précédent si c'est la premiere box
        $("#prev_btn").hide();
        $("#validate_btn").hide();
    }
    else {
        $("#prev_btn").show();
        $("#next_btn").show();
        $("#validate_btn").hide();
    }
};

function removeContent(removeFrom, classToBeRemoved){//remove all content of a DOM element except for the instructions
    for (let e in removeFrom){$(e).find(classToBeRemoved).not(".instructions").remove()};
};


/****************/
/* PARTICIPANTS */
/****************/

function makeInputBoxes(n){ // Crée les input boxes selon le nombre de participants 
    for (let i = 1; i <= n; i++) {
        fillParticipantsName.insertAdjacentHTML('beforeend',`<input class = "participantName_input" id="participant${i}" name="participant"  type="text" placeholder= "Participant ${i}"/><br>`);    
    };
};

function makeNameBoxes(list, elem) {// Faire les boites avec les noms de participants
    for (let j = 0; j < elem.length; j++) {
        for (let i = 0; i < list.length; i++) {
            elem[j].insertAdjacentHTML('beforeend',`<div class="participantImage" >${list[i]} </div>`)
        }
    }
};

function initParticipantBoxes(elem) {// Initialise le boxes des participants et l'affichage des règles
    selectedParticipants.reciprocal, selectedParticipants.unreciprocal  = [];
    elem.removeClass("selected")
    // $(".warning").hide()
    currentRule.innerHTML = "";
};

function getListOfParticipants(list) {// Récupère la liste des participants en format Array à partir d'un objet
    let participantsList = list;
    let participantsNameArray = [];
    for (let i = 0; i < participantsList.length; i++) {
        participantsNameArray.push(participantsList[i].value);
    };
    return participantsNameArray;
};


/**********/
/* RULES  */
/**********/


$(".ruleValidation").hide();
$("#results").hide();

$(document).on("click", '.participantImage',function(){// Sélectionner des participants
    let selectedParticipants = selectItem(this)
    let ruleType = $(this).parents(".rules")[0].id
    displayCurrentRule(this, $(this).parents('.rules').find('.selected').length, selectedParticipants[ruleType])

});

$(document).on("click", ".ruleValidation", function(){ //Validation de la règle en cours
    let nRules = defineRuleNumber(this) // Le numéro de la règle
    let ruleType = $(this).parents(".rules")[0].id // récupère l'info du type de règle  
    let doublon = isThisRuleExisting(ruleType);
    // $(this).parents('.rules').find('.warning').hide()

    if (doublon === true){
        alert("Cette règle existe déjà.")
    }
    else {
        let r = new Rule(ruleType, `rule${nRules}`, selectedParticipants[ruleType]) // crée une nouvelle règle
        rules[ruleType].push(r) //Ajoute la nouvelle règle à l'ensemble des règles

        // Affichage de la règle et du bouton supprimer
        $(this).parents(".rules").children(".rulesBlock").children("ol").append("<li class = 'savedRule'>").children("li:last").append(
                                                                createRuleToSave(this, nRules),  
                                                                createDeleteButton(`rule${nRules}`))
    }
    $(this).parents(".rules").find(".participantImage").removeClass("selected") //réinitialisation des boxes des participants
    selectedParticipants[ruleType] = []                                         //réinitialisation de la liste de sélection
    displayCurrentRule(this, $(this).parents('.rules').find('.selected').length, selectedParticipants[ruleType]) //réinitialisation de la règle en cours
});

$(document).on("click", ".deleteButton", function(){ //Appui sur delete
    let ruleType = $(this).parents(".rules")[0].id
    let elemId = $(this).attr("alt")

    rules[ruleType] = rules[ruleType].filter(function(value, index, array){ //remove the rule item from the array
        return value.form !== elemId
    })
    $(this).parents(".rules").find(`#${elemId}`).parent("li").remove() //remove the rule and the associated remove button


});



function isThisRuleExisting(ruleType) {//Vérifie que la règle n'existe pas
    let existing = false;

    if (ruleType === "reciprocal") {
        for (let i in rules["reciprocal"]) {
            if (rules["reciprocal"][i].participants.includes(selectedParticipants.reciprocal[0])
                && rules["reciprocal"][i].participants.includes(selectedParticipants.reciprocal[1])) {
                existing = true;
            }
        }
    }
    else if (ruleType === "unreciprocal") {
        for (let i in rules["unreciprocal"]) {
            if (rules["unreciprocal"][i].participants[0] === selectedParticipants.unreciprocal[0]
                && rules["unreciprocal"][i].participants[1] === selectedParticipants.unreciprocal[1]) {
                existing = true;
            }
        }
    }
    return existing;
};

function selectItem(elem){ // Sélectionner la bulle d'un participant

    let ruleType = $(elem).parents('.rules')[0].id
    let selected = $(elem).parents('.rules').find('.selected')
    
    if (selected.length <= 2){
        if(selected.length === 2 && elem.classList.contains("selected") === false){
            // $(elem).parents('.rules').find('.warning').show()
        }
        else {
            // $(elem).parents('.rules').find('.warning').hide();
            elem.classList.toggle("selected")
            if (elem.classList.contains("selected")){
                selectedParticipants[ruleType].push(elem.textContent)
            }
            else {
                selectedParticipants[ruleType].splice(selectedParticipants[ruleType].indexOf(elem.textContent), 1) }
        }
    }
    return selectedParticipants;
};

function displayCurrentRule(selectedItem, nbParticipantSelected, selectedParticipants) { //Afficher la règle en cours de création
    let currentRuleNode = $(selectedItem).parents(".rules").find(".currentRule") 
    if (nbParticipantSelected === 1){ // write the first name selected 
        currentRuleNode.find('.participant1')[0].innerHTML = `${selectedParticipants[0]}`;
        currentRuleNode.find('.participant2')[0].innerHTML = ``;
        $(selectedItem).parents(".rules").find(".ruleValidation").hide()
    }
    else if (nbParticipantSelected === 2){ // write the rest of the rule
        currentRuleNode.find('.participant1')[0].innerHTML = `${selectedParticipants[0]}`;
        currentRuleNode.find('.participant2')[0].innerHTML = `${selectedParticipants[1]}`;
        currentRuleNode.find(".ruleValidation").show()
    }
    else {
        currentRuleNode.find('.participant1')[0].innerHTML = ``;
        currentRuleNode.find('.participant2')[0].innerHTML = ``;
        $(selectedItem).parents(".rules").find(".ruleValidation").hide()

        } // Clear the rule

};

function defineRuleNumber(elem) { //Définit le numéro de la règle
    let n = $(elem).parents(".rules").find(".savedRules").length;
    while($(elem).parents(".rules").find(`#rule${n}`).length){n+=1}
    return n
};

function createRuleToSave(elem, nRules) { //crée le HTML de la règle à sauvegarder
    let ruleToBeSaved = document.createElement("form");
    ruleToBeSaved.classList.add("savedRules");
    ruleToBeSaved.setAttribute("id",`rule${nRules}`)
    ruleToBeSaved.innerHTML = rulePhrasing(
        $(elem).parents(".rules")[0].id, 
        [$(elem)
            .parents(".rules")
            .find(".currentRule")
            .find(".participant1")
            .text(),
        $(elem)
            .parents(".rules")
            .find(".currentRule")
            .find(".participant2")
            .text()
        ]);
    return ruleToBeSaved;
};

function rulePhrasing(type, participants) {//Select the appropriate rule depending on the type of rule (reciprocal or not)
    let ruleText = "";
    if (type === "reciprocal") { 
        ruleText = `<strong>${participants[0]}</strong> et <strong>${participants[1]}</strong> ne se font pas de cadeau.`;
    }
    else if (type === "unreciprocal") {
        ruleText = `<strong>${participants[0]}</strong> ne fait pas de cadeau à <strong>${participants[1]}</strong>.`;
    }
    return ruleText ;
};


function createDeleteButton(ruleName) { 
    let button = document.createElement("img");
    button.setAttribute("src","./Images/redCross.png");
    button.setAttribute("alt", ruleName);
    button.classList.add("saveOrDeleteButtons", "deleteButton");
    return button;
}

/*********************/
/* VALIDATION & DRAW */
/*********************/


$(document).on("click", "#validate_btn", () => {

    let rulesList = {reciprocal: [], unreciprocal: []}
    //put the rules content to lists and remove the spaces from the strings 
    for (let type in rules){
      for (let r of rules[type]) { //put the rules content to a list and remove 
        let rule = r.participants.map(element => {return element.trim();})
        rulesList[type].push(rule)
      }  
    } ;

    /** GET ALL AVAILABLE OPTIONS FOR EACH PARTICIPANT */
    
    //Get all the options for each participant based on the participants list and the rules
    const options_per_participant = participantsList.map(function(p, index, options) {
        // trim the options based on the rules
        var available_options = options
        available_options = available_options.filter(value => value !== p) //remove the participant itself from the options
            // for reciprocal rules
            for (let r of rulesList.reciprocal){
              if (r.includes(p)) {available_options = removeTheOtherParticipant(r, p, available_options)}        } 
            // for unreciprocal rules
            for (let r of rulesList.unreciprocal){
              if (r[0] === p) {available_options = removeTheOtherParticipant(r, p, available_options)}        }
        return available_options
    })

    /** EXECUTE THE DRAW */   
    let n_loop = 0
    
    // Try drawing a certain amount (= nbMaxLoop) of times 
    while (n_loop<nbMaxLoop){
      // Make an object with participantName as key and its options as content
      participantsList.forEach(
        (participant, i) => optionsPerParticipant[participant] = options_per_participant[i]);
    
    
    // Initialise the draw variables at the beginning of the draw
      let ppWithTheLessOptions = "", 
          assignedPp = "",
          minNbOptions = participantsList.length, 
          participantsPairs = []
      loopOverParticipants: while (Object.keys(optionsPerParticipant).length > 0){ // Loop until no more participants
        // get the participant with the least options
        Object.values(optionsPerParticipant).map((elem, index) => {
          if (elem.length <= minNbOptions){
            minNbOptions = elem.length // Minimum of options across participants
            ppWithTheLessOptions = Object.keys(optionsPerParticipant)[index] //Name of the participant with the least options
          }
        })
        // Break loop if at least one participant has no option
        if (minNbOptions === 0){
            alert(`Tirage au sort impossible, ${ppWithTheLessOptions} ne peut faire de cadeau à personne.`)
            //TODO: Offer to restart or go back to the rules

      break loopOverParticipants;
        } else {     
          //Randomly assign one of the option to the participant with the least 
          assignedPp = optionsPerParticipant[ppWithTheLessOptions][Math.floor(Math.random() * minNbOptions)]
          participantsPairs.push([ppWithTheLessOptions, assignedPp])
          
          // Remove the assigned option from the other participants options' list
          for(let p in optionsPerParticipant){
            optionsPerParticipant[p] = optionsPerParticipant[p].filter(value => value !== assignedPp)
          }
          // Remove the participant with the least options from the list 
          delete optionsPerParticipant[ppWithTheLessOptions]
        }
      }
    
      // if we draw everybody (ie, there is the same number of pairs as the number of participants), the draw is done
      if (participantsPairs.length === participantsList.length){
        displayResults(participantsPairs)
        // alert("Success !" + participantsPairs)
        break;
      }
      n_loop++;
    }
    
    if (n_loop === nbMaxLoop){
      alert("Le tirage au sort n'a pas pu aboutir, l'algorithme ne trouve pas de solution :(")
      //TODO: Offer to restart or go back to the rules
    }
    
    
    // FUNCTION: Remove the participant who is also part of the rule
    function removeTheOtherParticipant(rule, participant, available_options) { 
      let other_p = rule.filter(value => value !== participant)
      available_options = available_options.filter(value => value !== other_p[0])
      return available_options
    }

    $('#buttons').hide()

})

function displayResults(participantsPairs){
    for(let pair of participantsPairs){
        $("#resultList").append('<strong>'+pair[0]+"</strong> fait un cadeau à <strong>"+pair[1] + "</strong><br>"); 
    }
    $("#results").show();
    $(".draw").hide()
    


}

$(document).on("click", "#restart_btn", () => {
    window.location.reload();
})

//TODO: Add waiting item
//TODO: Add status/progress bar
//TODO: Share button





