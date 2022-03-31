import "./style.css";
import "./PhaserGame";
import phaserGame from "./PhaserGame";
import Bootstrap from "./scenes/Bootstrap";
// import Bootstrap from "./scenes/Bootstrap";
// import Bootstrap from "./scenes/Bootstrap";
// import phaserGame from "./PhaserGame";

// const app = document.querySelector<HTMLDivElement>("#app")!;

// app.innerHTML = `
//   <h1>Hello Vite!</h1>
//   <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
// `;

// setTimeout(() => {
//   const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
//   bootstrap.launchGame();
// }, 2000);

async function main() {
  const json = await fetch("map.json");
  // const json = await fetch("Generic_Home_Designs/map.json");
  const jsonData = await json.json();
  // const phaserGame = await import("./PhaserGame");
  console.log(phaserGame.scene);
  setTimeout(() => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
    bootstrap.launchGame(jsonData, "/");
    console.log(jsonData);
  }, 1000);
}

main();

// setTimeout(async () => {
//   await import("./PhaserGame");
// }, 2000);
//
