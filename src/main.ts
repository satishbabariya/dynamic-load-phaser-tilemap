import "./style.css";
import "./PhaserGame";
import phaserGame from "./PhaserGame";
import Bootstrap from "./scenes/Bootstrap";

async function main() {
  const json = await fetch("map.json");
  const jsonData = await json.json();
  console.log(phaserGame.scene);
  setTimeout(() => {
    const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap;
    bootstrap.launchGame(jsonData, "/");
    console.log(jsonData);
  }, 1000);
}

main();
