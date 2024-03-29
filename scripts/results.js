/*FIREBASE initialisation*/
// Import the functions you need from the SDKs you need
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const db = getFirestore();

// const resultRef = localStorage.getItem("resultRef")
var resultRef = document.location.search.substring(1);

const docRef = doc(db, "result", resultRef);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  getDoc(doc(collection(db, "result"), resultRef)).then((doc) => {
    for (let pair of doc.data().participantsPairs) {
      addResultToTheList(pair);
    }
  });
} else {
  displayResultDontExist();
}

function displayResultDontExist() {
  $("#resultList").append(
    "<h3> Erreur 404 </h3>" + "Ces résultats n'existent pas."
  );
}

function addResultToTheList(pair) {
  $("#resultList").append(
    "<li><strong>" +
      pair.giver +
      "</strong> fait un cadeau à <strong>" +
      pair.receiver +
      "</strong></li>"
  );
}

// Share

const shareBtn = document.querySelector(".share-btn"),
  clipboardBtn = document.querySelector(".clipboard");

if (!navigator.share) {
  shareBtn.style.display = "none";
  clipboardBtn.style.display = "block";
} else {
  shareBtn.style.display = "block";
  clipboardBtn.style.display = "none";
}

shareBtn.addEventListener("click", () => {
  if (navigator.share) {
    navigator
      .share({
        title: "Secret Santa",
        text: "Voici les résultats du tirage !",
        url: document.location.href,
      })
      .then(() => {
        console.log("Thanks for sharing!");
        $(".shared-result").text("Partagé !");
      })
      .catch((err) => {
        console.log(`Couldn't share because of`, err.message);
      });
  } else {
    $(".share-btn").hide();
    console.log("web share not supported");
  }
});

//Restart
$(document).on("click", "#restart-btn", () => {
  document.location.assign(
    document.location.origin +
      document.location.pathname.substring(
        0,
        document.location.pathname.lastIndexOf("/")
      )
  );
});

//Copy to clipboard
$(".clipboard").on("click", function () {
  navigator.clipboard.writeText(document.location.href);
  $(".shared-result").text("Lien copié !");
});
