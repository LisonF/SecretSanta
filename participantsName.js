
// Faire les input boxes selon le nombre de participants
export function makeInputBoxes(n){ // Create n input boxes 
    for (let i = 1; i <= n; i++) {
        fillParticipantsName.insertAdjacentHTML('beforeend',`<span>Participant ${i} </span><input class = "participantName_input" id="participant${i}" name="participant"  type="text" /><br>`);    
        ;
        return}
}
