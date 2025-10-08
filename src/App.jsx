import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const apiKey = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    console.log(apiKey);

    fetch("https://v3.football.api-sports.io/leagues", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": apiKey,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <h1>Hello</h1>
      <p>asdasdasd</p>
    </>
  );
}

export default App;
