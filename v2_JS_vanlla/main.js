/**** V2 -> RECHERCHE PAR CODE ISO 3 ****/
/***** ET NOUVELLES FONCTIONNALITES *****/


let select = document.querySelector(".select");
let input = document.querySelector(".text-input");
let fullTable = document.querySelector(".table");
let tableBody = document.querySelector(".table-body");
let tablehead = document.querySelector(".table-header");
let form = document.querySelector(".form");
let displayUrl = document.querySelector(".url");
let displayInvalidInput = document.querySelector(".message-input-invalide");
let apiIso3Codes = [];

// FETCH ISO 3 -> APPELE AU CHARGEMENT PAGE
async function fetchIso3Codes () {
    let testFetch = await fetch(`https://api.worldbank.org/v2/country?per_page=1000&format=json`);
    let test = await testFetch.json();
    for (const t of test[1]) {
        apiIso3Codes.push(t.id);
    }
}

fullTable.hidden = true;
input.setAttribute('size', input.getAttribute('placeholder').length);

/* EVENT LISTENERS */

form.addEventListener("submit", (event)=>{ event.preventDefault();});
input.addEventListener("keyup", (event) => {
    
    form.querySelector(".message-input-invalide").setAttribute("hidden", "hidden");

    if (event.target.value.length >= 3) {
        event.preventDefault();
    } 
    
    if (event.target.value.length !== 3) {
        fullTable.hidden = true;
        displayUrl.hidden = true;
    }

    if (input.value !== "") {
        input.value = input.value.replace(/[^a-zA-Z0-9 ]/g, "");
        // -> input.value = input.value.replace(/[^a-zA-Z0-9 ]/g, "").toUpperCase();
        // -> Permet de passer directement la valeur en UpperCase, mais changement visible à l'écran
        }
    
    if (select.value !== "" && input.value !== "") {
    
        if (apiIso3Codes.includes(input.value.toUpperCase())) {
            fetchFromApi(input.value, select.value);

        } else if (input.value.length === 3) {
            displayInvalidInput.hidden = false;
            fullTable.hidden = true;
            displayUrl.hidden = true;
        }
    }
})

select.addEventListener("change", (event)=> {
    if (select.value !== "" && input.value !== "" && input.value.length === 3) {
        fetchFromApi(input.value, event.target.value);
    }
})

/* FONCTIONS DOM */

function appendToTableBody (arg) {
    let newLine = document.createElement("tr");
    let dateCell = document.createElement("td");
    let valueCell = document.createElement("td");
    
    dateCell.textContent = arg.date;

    // Formatage USD poussé (cf. doc MDN) et gestion absence de value
    let dollarUSLocale = new Intl.NumberFormat('en-US', {
        style: "currency",
        currency: "USD",
        currencydisplay: "symbol",
    });

    if (arg.value !== null) {
        valueCell.textContent = `${dollarUSLocale.format(arg.value)}`;
    } else {
        valueCell.textContent = "No data available.";
    }

    newLine.append(dateCell, valueCell);
    tableBody.append(newLine);
}

function setUrlDisplay (inputValue, selectValue, content) {

    displayUrl.innerText = `http://api.worldbank.org/v2/country/${inputValue.toUpperCase()}/indicator/${selectValue}?format=json`;
    displayUrl.removeAttribute("hidden");


    // VERIF SI LA PEINE D'ENLEVER HIDDEN ETC 
    tablehead.textContent = content;
    tablehead.hidden = false;
}

/* REQUETES APIs SI VALEUR INPUT DANS TABLEAU ISO3 */

async function fetchFromApi (inputValue, selectValue) {
    let fetched = await fetch(`http://api.worldbank.org/v2/country/${inputValue.toUpperCase()}/indicator/${selectValue}?format=json`)
    let fetchedJSON = await fetched.json();
    try {
        tableBody.innerHTML = "";
        setUrlDisplay (inputValue, selectValue, fetchedJSON[1][0].country.value);
        
        for (const data of fetchedJSON[1]) {
            appendToTableBody(data);
        }

        fullTable.hidden = false;

    } catch (e) {
        if (e instanceof TypeError) {
                // log l'erreur dans un fichier log.txt? 
                console.error(`Input invalide mais tentative fetch effectuée, erreur: ${e}`);
                
                fullTable.hidden = true;
                displayInvalidInput.hidden = false;
        }
    }
}

document.addEventListener("load", fetchIso3Codes());