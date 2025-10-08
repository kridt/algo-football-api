import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api-football/leagues", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": import.meta.env.VITE_API_KEY, // 👈 korrekt i Vite
      },
    })
      .then((res) => res.json())
      .then((data) => console.log("Data:", data))
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <>
      <h1>Hello</h1>
      <p>asdasdasd</p>
    </>
  );
}

export default App;
