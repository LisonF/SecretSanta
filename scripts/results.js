
/*FIREBASE initialisation*/
// Import the functions you need from the SDKs you need
import{ 
    getFirestore, collection,
    addDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js"


const db = getFirestore();

// const resultRef = localStorage.getItem("resultRef")
var resultRef = window.location.search.substring(1)
console.log(resultRef, typeof resultRef)


const docRef = doc(db, "result", resultRef);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  getDoc(doc(collection(db, "result"), resultRef))
    .then((doc) => {
        for(let pair of doc.data().participantsPairs){
            addResultToTheList(pair); 
          }
    })
} else {
  displayResultDontExist(); 
}





function displayResultDontExist() {
  $("#resultList").append("<h3> Erreur 404 </h3>" +
    "Ces résultats n'existent pas.");
}

function addResultToTheList(pair) {
  $("#resultList").append('<li><strong>' + pair.giver + "</strong> fait un cadeau à <strong>" + pair.receiver + "</strong></li>");
}




// Share

const shareBtn = document.querySelector('.share-btn');

if (!navigator.share) {
  shareBtn.style.display = "none";
} else {
  shareBtn.style.display = "block";
}

shareBtn.addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'My Secret Santa',
      text: 'Voici les résultats du tirage !',
      url: window.location.href
    }).then(() => {
      console.log('Thanks for sharing!');
    })
    .catch(err => {
      console.log(`Couldn't share because of`, err.message);
    });
  } else {
    $('.share-btn').hide();
    console.log('web share not supported');
  }
});

//Restart
$(document).on("click", "#restart-btn", () => {
  window.location.assign(window.location.origin);
})

//Copy to clipboard
$('.clipboard').on('click', function() {
  navigator.clipboard.writeText(document.location.href);
  $('.shared-result').text("Lien copié !")
})
