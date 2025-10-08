import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [leagues, setLeagues] = useState([]);
  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    fetch("https://v3.football.api-sports.io/leagues?season=2026", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setLeagues(data.response);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  console.log(leagues);

  return (
    <>
      <h1>Hello</h1>
      <p>asdasdasd</p>
    </>
  );
}

export default App;
