import { React, useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
//import TableIso3 from "./TableIso3.js";
import "./App.css";

function App() {

  const [APIData, setAPIData] = useState([]);
  const [isoFilter, setIsoFilter] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState({message: null,});
  const [selectedValue, setSelectedValue] = useState("");
  const [matchingIso, setMatchingIso] = useState("");

  const searchApi = (iso, indicator) => {
    fetch(`http://api.worldbank.org/v2/country/${iso}/indicator/${indicator}?format=json`)
          .then(response => response.json())
          .then((response) => {
              setAPIData(response[1]);
          })
  }

  // RENDER COMPOSANT -> INIT. COMPARATEUR
  useEffect(() => {
    fetch(`https://api.worldbank.org/v2/country?per_page=1000&format=json`)
        .then(response => response.json())
        .then((response) => {
            console.log(response[1]);
            setIsoFilter(response[1].map( ({ id, name })  => ({id, name}) ));
        })
}, [])

  const indicatorChange = (value) => {
      setSelectedValue(value);
      console.log(selectedValue);

    if (searchInput !== "" && selectedValue !== "") {
      searchApi(matchingIso, selectedValue);
      console.log(matchingIso);
      console.log(selectedValue);
    }
  }

  // FONCTION RECHERCHE DANS DATA
  // ET SET STATE 
  const searchItems = (searchValue) => {
    if (searchValue.length === 3) {
      setSearchInput(searchValue)
    }
    if (searchInput !== '') {
        const filteredData = isoFilter.filter((item) => {
            return item.id.toLowerCase().includes(searchInput.toLowerCase()) 
        })
        console.log(isoFilter);
        console.log(filteredData);
        console.log(filteredData[0].id);
        setMatchingIso(`${filteredData[0].id}`);
        //console.log(matchingIso);
    }

    if (searchInput !== "" && selectedValue !== "") {
      searchApi(matchingIso, selectedValue);
      console.log(matchingIso);
      console.log(selectedValue);
    }
}

return (
  // UNE DIV EST DEJA RENDER DANS root.render (index.js) !
  <div className="main">
      <TextField 
          id="outlined-basic"
          onChange={e => searchItems(e.target.value)}
          label="Search"
          variant="outlined"
          fullWidth
          placeholder='Search...'
          inputProps={{ maxLength: 4}}
      />

      <label htmlFor="select-indicator" hidden>Select an indicator</label>
      <select 
        value={selectedValue}
        onChange={e => indicatorChange(e.target.value)}
        name="select-indicator"
      >
        <option value="">PLACEHOLDER</option>
        <option value="NY.GDP.MKTP.CD">GDP - ... </option>
        <option value="NE.IMP.GNFS.CD">Imports of goods and services</option>
        <option value="NY.ADJ.NNTY.PC.CD">Adjusted net national income per capita</option>
      </select>

      <table>
        <tbody>
          {searchInput.length === 3 ? (
              APIData.map((item) => {
                console.log(item);
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
                      <td>{item.value}</td>
                    </tr>
                  )
                }
              })
          ) : (
              isoFilter.map((item) => {
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
)
}

export default App;