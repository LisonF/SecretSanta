/* DEFINITION DES VARIABLES PARTAGEES DANS LE DOCUMENT */
const draw = document.getElementsByClassName("draw");
const currentRule = document.getElementsByClassName("currentRule");

let currentBox = draw[0];
let selectedParticipants = {reciprocal: [], unreciprocal: [] };
var participantsList = []

let validateButton = createImageButton("./Images/greenTick.png"); 
validateButton.classList.add("ruleValidation")

/* INITIALISATION DES REGLES */ 
const rules = {reciprocal: [], unreciprocal: [] }

class Rule {
    constructor(type, formName, participants) {
        this.type = type; //type de règle, réciproque ou non
        this.form = formName; //nom du form associé
        this.participants = participants; //liste des participants impliqués dans la règle
        this.ruleText = rulePhrasing(type, participants)

    }
}

/***************************/
/* NAVIGATE ACROSS THE APP */
/***************************/

/* DEFINITION DES PREREQUIS ASSOCIES A CHAQUE ETAPE */ 
class Prerequisites {
    constructor(condition, errorMessage) {
        this.condition = condition; //condition qui doit être true pour permettre de passer à la box suivante
        this.errorMessage = errorMessage; //message d'erreur affiché dans l'alert //TODO: Make it a method

    }
}

let prerequisites = {nbParticipants : [], participantsName : [], rules : []}

prerequisites.nbParticipants.push(new Prerequisites(function () {return document.getElementsByName("nbPp")[0].value>2} ,
                                                    "Veuillez sélectionner au moins 3 participants.")) 
prerequisites.participantsName.push(new Prerequisites(function(){
                                                      a = $(".participantName_input")
                                                      var condition = true
                                                      for(let i = 0; i < a.length; i++){
                                                          if($(a[i]).val() === ""){
                                                                var condition = false
                                                            }
                                                            };
                                                      return condition},
                                                    "Veuillez renseigner tous les noms des participants."))
prerequisites.participantsName.push(new Prerequisites(function(){
                                                        let a = getListOfParticipants(document.getElementsByName("participant"))
                                                        var condition = true
                                                        for(let i = 0; i < a.length; i++){
                                                            if (a.filter(elem => elem === (a[i])).length>1){
                                                                var condition = false
                                                                return condition}
                                                        }},
                                                        `Un participant apparait 2 fois, veuillez supprimer ou renommer une des deux occurences.`))

/***************************/
/* NAVIGATE ACROSS THE APP */
/***************************/

start_btn.addEventListener("click", () => { //Appui sur Start, commencer le tirage
    $("#biggerbox").show();
    for (let i =0; i < draw.length; i++){
        draw[i].style.display = "none";
    };
    $('#start_btn, #prev_btn, #validate_btn, .description').hide()
    currentBox.style.display = "block";

});

$(document).on("click", "#next_btn", () => { //Passer à la question suivante
    let error = false;
    for (let i = 0; i < prerequisites[currentBox.id].length; i++){ // Verifie les prérequis associé à chaque étape
        if (prerequisites[currentBox.id][i].condition() === false){
            error = true
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
                                elem = document.getElementsByClassName("participantImages_block"))

                break;
            case  "rules":
                initParticipantBoxes($('.participantImage'));
                for (p of participantsList){
                    let listElem = document.createElement("li")
                    listElem.classList.add("recapElem")
                    listElem.innerHTML = p
                    $('#recapParticipants').append(listElem);
                };
                for (r of rules.reciprocal){
                    listElem = document.createElement("li")
                    listElem.classList.add("recapElem")
                    listElem.innerHTML = r.ruleText
                    $('#recapRules').append(listElem);
                }                
                for (r of rules.unreciprocal){
                    listElem = document.createElement("li")
                    listElem.classList.add("recapElem")
                    listElem.innerHTML = r.ruleText
                    $('#recapRules').append(listElem);
                }
                // $('#buttons').append(validateDraw)  
                break;

            
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
            removeContent($(".participantsBlock"), $('.participantImage'))
        case "recap":
            initParticipantBoxes($('.participantImage'));
            // for (e in $(".recapSection")){
            //     console.log($(e).find($('li')))}
            removeContent($(".recapSection"), $('.recapElem'))
            selectedParticipants = {reciprocal: [], unreciprocal: [] }
            for (e of $(".currentRule")){e.innerHTML = ''};
              
            break;
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
    for (e in removeFrom){$(e).find(classToBeRemoved).not(".instructions").remove()};
};


/****************/
/* PARTICIPANTS */
/****************/

function makeInputBoxes(n){ // Crée les input boxes selon le nombre de participants 
    for (i = 1; i <= n; i++) {
        fillParticipantsName.insertAdjacentHTML('beforeend',`<span>Participant ${i} </span><input class = "participantName_input" id="participant${i}" name="participant"  type="text" /><br>`);    
    };
};

function makeNameBoxes(list, elem) {// Faire les boites avec les noms de participants saisis par l'utilisateur
    for (let j = 0; j < elem.length; j++) {
        for (i = 0; i < list.length; i++) {
            elem[j].insertAdjacentHTML('beforeend',`<div class="participantImage" >${list[i]} </div>`)
        }
    }
};

function initParticipantBoxes(elem) {// Initialise le boxes des participants et l'affichage des règles
    selectedParticipants.reciprocal, selectedParticipants.unreciprocal  = [];
    elem.removeClass("selected")
    $(".warning").hide()
    currentRule.innerHTML = "";
};

function getListOfParticipants(list) {// Récupère la liste des participants en format Array à partir d'un objet
    let participantsList = list;
    let participantsNameArray = [];
    for (i = 0; i < participantsList.length; i++) {
        participantsNameArray.push(participantsList[i].value);
    };
    return participantsNameArray;
};
/**********/
/* RULES  */
/**********/


$(document).on("click", '.participantImage',function(){// Sélectionner des participants
    let selectedParticipants = selectItem(this)
    let ruleType = $(this).parents(".rules")[0].id

    displayCurrentRule(this, $(this).parents('.rules').find('.selected').length, selectedParticipants[ruleType])

});


$(document).on("click", ".ruleValidation", function(){ //Validation de la règle en cours
    let nRules = defineRuleNumber(this) // Le numéro de la règle
    let ruleType = $(this).parents(".rules")[0].id // récupère l'info du type de règle  
    let doublon = isThisRuleADoublon(ruleType);
    $(this).parents('.rules').find('.warning').hide()

    if (doublon === true){
        alert("Cette règle existe déjà.")
    }
    else {
        let r = new Rule(ruleType, `rule${nRules}`, selectedParticipants[ruleType]) // crée une nouvelle règle
        rules[ruleType].push(r) //Ajoute la nouvelle règle à l'ensemble des règles

        // Affichage de la règle et du bouton supprimer
        $(this).parents(".rules").children(".rulesBlock").children("ol").append("<li class = 'savedRule'>").children("li:last").append(
                                                                createRuleToSave(elem = this, nRules),  
                                                                createDeleteButton(`rule${nRules}`))
    }
    $(this).parents(".rules").find(".participantImage").removeClass("selected") //réinitialisation des boxes des participants
    selectedParticipants[ruleType] = []                                         //réinitialisation de la liste de sélection
    displayCurrentRule(this, $(this).parents('.rules').find('.selected').length, selectedParticipants[ruleType]) //réinitialisation de la règle en cours
});

$(document).on("click", ".deleteButton", function(){ //Appui sur delete
    let ruleType = $(this).parents(".rules")[0].id
    let elemId = $(this).attr("form")

    rules[ruleType] = rules[ruleType].filter(function(value, index, array){ //remove the rule item from the array
        return value.form !== elemId
    })
    $(this).parents(".rules").find(`#${elemId}`).parent("ol").remove() //remove the rule and the associated remove button


});



function isThisRuleADoublon(ruleType) {//Vérifie que la règle n'existe pas
    let doublon = false;

    if (ruleType === "reciprocal") {
        for (i in rules["reciprocal"]) {
            if (rules["reciprocal"][i].participants.includes(selectedParticipants.reciprocal[0])
                && rules["reciprocal"][i].participants.includes(selectedParticipants.reciprocal[1])) {
                doublon = true;
            }
        }
    }
    else if (ruleType === "unreciprocal") {
        for (i in rules["unreciprocal"]) {
            if (rules["unreciprocal"][i].participants[0] === selectedParticipants.unreciprocal[0]
                && rules["unreciprocal"][i].participants[1] === selectedParticipants.unreciprocal[1]) {
                doublon = true;
            }
        }
    }
    return doublon;
};

function selectItem(elem){ // Sélectionner la bulle d'un participant

    let ruleType = $(elem).parents('.rules')[0].id
    let selected = $(elem).parents('.rules').find('.selected')
    
    if (selected.length <= 2){
        if(selected.length === 2 && elem.classList.contains("selected") === false){
            $(elem).parents('.rules').find('.warning').show()
        }
        else {
            $(elem).parents('.rules').find('.warning').hide();
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

function displayCurrentRule(selectedItem, n_images, selectedParticipants) { //Afficher la règle en cours de création
 
    let ruleText = document.createElement("span")
    ruleText.classList.add("ruleText")
    ruleText.innerHTML = rulePhrasing($(selectedItem).parents(".rules").attr("id"), selectedParticipants);

    currentRuleNode = $(selectedItem).parents(".rules").find(".currentRule")[0]    
    currentRuleNode.innerHTML = ``
    if (n_images === 1){ // write the first name selected 
        currentRuleNode.insertAdjacentHTML('beforeend', `<strong>${selectedParticipants[0]}</strong>`);
    }
    else if (n_images === 2){ // write the rest of the rule
        currentRuleNode.append(ruleText);
        validateButton.setAttribute("form", currentRuleNode.id)
        currentRuleNode.append(validateButton.cloneNode());
    }
    else {currentRuleNode.innerHTML = ``;} // Clear the rule

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
    ruleToBeSaved.innerHTML = $(elem).parents(".rules").find(".ruleText").text();
    return ruleToBeSaved;
};

function rulePhrasing(type, participants) {//Select the appropriate rule depending on the type of rule (reciprocal or not)
    let ruleText = "";
    console.log(type, participants)
    if (type === "reciprocal") { 
        ruleText = `<strong>${participants[0]}</strong> et <strong>${participants[1]}</strong> ne se font pas de cadeau.`;
    }
    else if (type === "unreciprocal") {
        ruleText = `<strong>${participants[0]}</strong> ne fait pas de cadeau à <strong>${participants[1]}</strong>.`;
    }
    return ruleText ;
};

function createImageButton(src) { 
    let button = document.createElement("input");
    button.setAttribute("src",src);
    button.setAttribute("type","image")
    button.classList.add("saveOrDeleteButtons")
    return button;
}

function createDeleteButton(ruleName) {
    let deleteButton = createImageButton("./Images/redCross.png");
    deleteButton.classList.add("deleteButton");
    deleteButton.setAttribute("form", ruleName);
    return deleteButton;
}

/***************/
/* VALIDATION  */
/***************/

validateButton.addEventListener("click", () => {

    // PYTHON CODE for tirage au sort
    // fin_tirage = False
    // while (fin_tirage == False) :
    // random.shuffle(recoit)
    // fin_tirage=True
    // for j in range (len(offre)):
    //     if offre[j]==recoit[j]:
    //         fin_tirage=False
    //     for k in range (len(couples)):
    //         if (offre[j]==couples[k][0] and recoit[j]==couples[k][1]) or (offre[j]==couples[k][1] and recoit[j]==couples[k][0]) :
    //             fin_tirage = False
    //     for p in range(len(paires)):
    //         if (offre[j]==paires[p][0] and recoit[j]==paires[p][1]) :
    //             fin_tirage = False

})
