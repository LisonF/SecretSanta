
// Faire les input boxes selon le nombre de participants
function makeInputBoxes(n){ // Create n input boxes 
    for (i = 1; i <= n; i++) {
        fillParticipantsName.insertAdjacentHTML('beforeend',`<span>Participant ${i} </span><input class = "participantName_input" id="participant${i}" name="participant"  type="text" /><br>`);    
    };
};

export {makeInputBoxes};
