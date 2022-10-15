import { React, useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import "./App.css";

function App() {

  const [APIData, setAPIData] = useState([]);
  const [isoFilter, setIsoFilter] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isoHint, setIsoHint] = useState([]);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [matchingIso, setMatchingIso] = useState("");
  const [tableClassSwitcher, setTableClassSwitcher] = useState("");

  // FONCTIONS  

  // GESTION CHANGEMENT INDICATOR
  const indicatorChange = (value) => {
    setSelectedValue(value);
    console.log(selectedValue);
  }

  // VERIF CARACS SPECIAUX 
  const noSpecialChars = (searchValue) => {
    setInputValue(searchValue.replace(/[^a-zA-Z0-9]/g, ""))
  }

  // FORMATAGE USD 
  const dollarUSLocale = new Intl.NumberFormat('en-US', {
    style: "currency",
    currency: "USD",
    currencydisplay: "symbol",
  });

  // USEEFFECTS
  // RENDER COMPOSANT (()=> {...} ,[]) -> INIT. COMPARATEUR
  useEffect(() => {
    fetch(`https://api.worldbank.org/v2/country?per_page=1000&format=json`)
        .then(response => response.json())
        .then((response) => {
            //console.log(response[1]);
            setIsoFilter(response[1].map( ({ id, name })  => ({id, name}) ));
        })
  }, [])

  // USEEFFECT RESOUT LE PB DE DESYNCHRO, QD CONDITION
  // REMPLIE, MAJ AFFICHAGE 
  useEffect(()=> {
    // REQUETE API AVEC ISO MATCHE + INDICATOR SELECTIONNE
    const searchApi = (iso, indicator) => {
      try {
        fetch(`http://api.worldbank.org/v2/country/${iso}/indicator/${indicator}?format=json`)
        .then(response => response.json())
        .then((response) => {
            setAPIData(response[1]);
        })
      } catch (error) {
        setError(error)
      }

      if (error) {
        console.dir(error);
      }
    }

    if (matchingIso !== "" && selectedValue !== "") {
      searchApi(matchingIso, selectedValue);

      // AFFICHAGE "LONG" SI REQUETE EFFECTUEE 
      setTableClassSwitcher("table-display-data");
      console.log(matchingIso);
      console.log(selectedValue);
    }
  }, [matchingIso, selectedValue, /*error*/]);

  useEffect(()=> {
    if (searchInput !== '') {
      const filteredData = isoFilter.filter((item) => {
          return item.id.toLowerCase().includes(searchInput.toLowerCase()) 
      })
      console.log(filteredData[0].id);

      // ICI !!! FIX SI AUCUN MATCH TROUVE
      setMatchingIso(`${filteredData[0].id}`); 
      // ICI !!! FIX SI AUCUN MATCH TROUVE

      //console.log(matchingIso);
  }
  }, [searchInput]);

  // SET STATE setSearchInput SI LENGTH INPUT === 3
  useEffect(()=> {
    if (inputValue.length === 3) {
      //setTableClassSwitcher("table-display-data");
      setSearchInput(inputValue);
    }
    else {
      //setTableClassSwitcher("table-display-hint");
      const filteredIsoHint = 
      isoFilter.filter(el => {
        if (inputValue === "") {
          return el;
        }
        else {
          return el.id.toLowerCase().includes(inputValue.toLowerCase());
        }
    });
    setTableClassSwitcher("table-display-hint");
    setIsoHint(filteredIsoHint);
    }
  }, [inputValue]);

return (
  <section className="app-section">
      <TextField 
          value={inputValue}
          id="outlined-basic"
          className="search"
          onChange={e => noSpecialChars(e.target.value)}
          variant="outlined"
          placeholder='Enter ISO 3 code'
          inputProps={{ maxLength: 3, style: {fontSize: 20, height: 10} }}
      />

      <label htmlFor="select-indicator" hidden>Select an indicator</label>
      <select 
        value={selectedValue}
        onChange={e => indicatorChange(e.target.value)}
        name="select-indicator"
      >
        <option value="">Please select an indicator :</option>
        <option value="NY.GDP.MKTP.CD">GDP - ... </option>
        <option value="NE.IMP.GNFS.CD">Imports of goods and services</option>
        <option value="NY.ADJ.NNTY.PC.CD">Adjusted net national income per capita</option>
      </select>

      <div className="testClass">
      <table className={tableClassSwitcher}>
        <tbody>
          {searchInput.length === 3 ? (
              APIData.map((item) => {
                console.log(item.countryiso3code);
                if (item.value === "" || item.value === null) {
                  return (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td>No data available.</td>
                    </tr>
                    
                )
                }
                else {
                  return (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td>{dollarUSLocale.format(item.value)}</td>
                    </tr>
                  )
                }
              })
          ) : (
              isoHint.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                    </tr>
                  )
              })
          )}
        </tbody>
      </table>
      </div>
    </section>
)
}

export default App;
