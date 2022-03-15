// const participantsList = [ "A", "Z", "E"
// ,"R", "T", "Y", "U", "I", "O", "P"
//  ]
// const rules = {
//     "reciprocal": [
//       {
//         "type": "reciprocal",
//         "form": "rule0",
//         "participants": [
//           "A ",
//           "E "
//         ],
//         "ruleText": "<strong>A </strong> et <strong>E </strong> ne se font pas de cadeau."
//       },
//       {
//         "type": "reciprocal",
//         "form": "rule1",
//         "participants": [
//           "E ",
//           "T "
//         ],
//         "ruleText": "<strong>E </strong> et <strong>T </strong> ne se font pas de cadeau."
//       },
//       {
//         "type": "reciprocal",
//         "form": "rule2",
//         "participants": [
//           "T ",
//           "U "
//         ],
//         "ruleText": "<strong>T </strong> et <strong>U </strong> ne se font pas de cadeau."
//       }
//     ],
//     "unreciprocal": [
//       {
//         "type": "unreciprocal",
//         "form": "rule0",
//         "participants": [
//           "P ",
//           "O "
//         ],
//         "ruleText": "<strong>P </strong> ne fait pas de cadeau à <strong>O </strong>."
//       },
//       {
//         "type": "unreciprocal",
//         "form": "rule1",
//         "participants": [
//           "O ",
//           "I "
//         ],
//         "ruleText": "<strong>O </strong> ne fait pas de cadeau à <strong>I </strong>."
//       },
//       {
//         "type": "unreciprocal",
//         "form": "rule2",
//         "participants": [
//           "I ",
//           "U "
//         ],
//         "ruleText": "<strong>I </strong> ne fait pas de cadeau à <strong>U </strong>."
//       }
//     ]
//   }



/*INIT DES REGLES*/

let rulesList = {reciprocal: [], unreciprocal: []}
// console.log(rules[type])
//put the rules content to lists and remove the spaces from the strings 
for (let type in rules){
  for (let r of rules[type]) { //put the rules content to a list and remove 
    let rule = r.participants.map(element => {return element.trim();})
    rulesList[type].push(rule)
  }  
} 


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

const optionsPerParticipant = {}, 
  nbMaxLoop = 10 // Number of times the loop will iterate without success


let n_loop = 0

// TRy to do the draw a certain amount (= nbMaxLoop) of times 
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
        alert(`Tirage au sort impossible,${ppWithTheLessOptions}ne peut faire de cadeau à personne.`)
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
    alert("Success !")
    break;
  }
  n_loop++;
}

if (n_loop === nbMaxLoop){
  alert("Le tirage au sort n'a pas pu aboutir, l'algorithme ne trouve pas de solution :(")
}


// FUNCTION: Remove the participant who is also part of the rule
function removeTheOtherParticipant(rule, participant, available_options) { 
  let other_p = rule.filter(value => value !== participant)
  available_options = available_options.filter(value => value !== other_p[0])
  return available_options
}
