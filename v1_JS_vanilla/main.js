/******** EXO BENCHMARK ************
IMPORTANT: SCREENSHOT ENONCE MAL "LU" DONC: 
FONCTION INUTILE (getIso3FromName) + REFACTOR A FAIRE 
+ erreur: quand on efface caractères du champ input -> pas d'actualisation  
***********************************/   

// Eviter trop grd nmb requêtes et "kick" api MAIS METHODES SALES !
// trop de requêtes -> TimeOut possible par Microsoft Azure (503 Bad Gateway)
// A CHANGER DANS V2 -> REFACTOR AVEC RECHERCHE PAR ISO3 PAYS (!= PAR NOM DU PAYS)

let select = document.querySelector(".select");
let input = document.querySelector(".text-input");
let table = document.querySelector(".table-body");
let form = document.querySelector(".form");
let displayUrl = document.querySelector(".url");

let aChanger1 = ""; // Méthode sale  
let aChanger2 = "NY.GDP.MKTP.CD"; // Méthode sale

form.addEventListener("submit", (event)=>{ event.preventDefault();});

input.addEventListener("keyup", (event) => {
    if (input.value !== "") {
        input.value = input.value.replace(/[^a-zA-Z0-9 ]/g, "");
            // équivalent htmlspecialchars php -> pas travaillé en détail
        getIso3FromName(input.value);
    }

    if (select.value !== "" && input.value !== "") {
        fetchFromApi(aChanger1, aChanger2);
    }
}) 

select.addEventListener("change", (event)=> {
    if (event.target.value !== "") {
        aChanger2 = event.target.value;
    }

    if (event.target.value !== "" && input.value !== "") {
        fetchFromApi(aChanger1, aChanger2);
    }
})

function appendToTable (arg) {
    let newLine = document.createElement("tr");
    let dateCell = document.createElement("td");
    let valueCell = document.createElement("td");
    
    dateCell.textContent = arg.date;

    // Formatage USD (cf. doc MDN) et gestion absence de value
    let dollarUSLocale = new Intl.NumberFormat('en-US');
    if (arg.value !== null) {
        valueCell.textContent = dollarUSLocale.format(arg.value);
    } else {
        valueCell.textContent = "No data available.";
    }

    newLine.append(dateCell, valueCell);
    table.append(newLine);
}

// syntaxe "classique" chaînage de .then
function fetchFromApi (inputValue = "fr", selectValue) {
    fetch(`http://api.worldbank.org/v2/country/${inputValue}/indicator/${selectValue}?format=json`)
    .then(response => response.json())
    .then(response => {

        table.innerHTML = "";
        displayUrl.innerText = `http://api.worldbank.org/v2/country/${inputValue}/indicator/${selectValue}?format=json`;
        displayUrl.removeAttribute("hidden");

        let tablehead = document.querySelector(".table-header");
        tablehead.innerHTML = response[1][0].country.value;
        tablehead.removeAttribute("hidden");

        for (const data of response[1]) {
            appendToTable(data);
        }
    });
}

// syntaxe async / await
async function getIso3FromName (string) {

    let fetched = await fetch(`https://api.worldbank.org/v2/country?per_page=1000&format=json`);
    let fetchedJSON = await fetched.json();

    try {
        result = fetchedJSON[1].filter(element => element.name.toLowerCase().includes(string.toLowerCase(), 0))[0].id;
        console.log(`TEST RESULTAT INTERNE -> ${result}`);
        aChanger1 = result;
    } catch (e) {
        // display erreur -> pas ergo -> gêne utilisateur
        alert("Error: no countries found with this spelling. Please try again.");
        console.error(e);
    }

}
