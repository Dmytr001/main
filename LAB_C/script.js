// --- 1. Inicjalizacja Leaflet ---
const map = L.map('map', {
  zoomControl: false,   // wyłącza +/-
  attributionControl: false // usuwa podpisy
}).setView([52.2297, 21.0122], 10);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19
}).addTo(map);

// wymuszenie ponownego renderowania po załadowaniu DOM
window.addEventListener('load', () => {
  setTimeout(() => {
    map.invalidateSize();
  }, 100); // małe opóźnienie, aby kontener miał już wymiary
});

let userMarker = null;

// --- 2. Lokalizacja ---
document.getElementById('locateBtn').addEventListener('click', () => {
  map.locate(); // tylko wykrywanie
});

map.on('locationfound', (e) => {
  console.log(`Moja lokalizacja: lat ${e.latitude}, lng ${e.longitude}`);
  // przesunięcie mapy i przybliżenie
  map.setView([e.latitude, e.longitude], 16); // 16 = bliższe powiększenie
});



// --- 3. Powiadomienia ---
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission().then(p => console.log("Permission:", p));
}

// --- 4. Pobranie mapy (Leaflet + leaflet-image) ---
document.getElementById("snapshotBtn").addEventListener("click", () => {
  leafletImage(map, function(err, canvas) {
    const base64 = canvas.toDataURL();
    showReferenceImage(base64);
    splitImageToTiles(base64, 4, 4);
  });
});

// --- 5. Wyświetlanie oryginału ---
function showReferenceImage(base64) {
  const refContainer = document.getElementById("reference-container");
  refContainer.innerHTML = "";
  const img = document.createElement("img");
  img.src = base64;
  refContainer.appendChild(img);
}

// --- 6. Tworzenie puzzli ---
function splitImageToTiles(base64, rows, cols) {
  const snapshotContainer = document.getElementById("snapshot-container");
  snapshotContainer.innerHTML = "";

  const img = new Image();
  img.src = base64;
  img.onload = () => {
    const tileWidth = img.width / cols;
    const tileHeight = img.height / rows;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const tiles = [];
    for (let y=0; y<rows; y++){
      for (let x=0; x<cols; x++){
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        ctx.drawImage(img, x*tileWidth, y*tileHeight, tileWidth, tileHeight, 0,0,tileWidth, tileHeight);
        const tile = document.createElement("img");
        tile.src = canvas.toDataURL();
        tile.draggable = true;
        tile.dataset.correct = `${y}-${x}`;
        tile.id = `tile-${y}-${x}`;
        addDragEvents(tile);
        tiles.push(tile);
      }
    }
    shuffleArray(tiles);
    tiles.forEach(t => snapshotContainer.appendChild(t));
    setupPuzzleBoard(rows, cols);
    enableReturnToBank(snapshotContainer);
  };
}

// --- 7. Pomocnicze funkcje ---
function shuffleArray(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
}

function setupPuzzleBoard(rows, cols){
  const puzzle = document.getElementById("puzzle");
  puzzle.innerHTML = "";

  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      const cell = document.createElement("div");
      cell.dataset.position = `${y}-${x}`;

      cell.addEventListener("dragover", e=>{
        e.preventDefault(); cell.classList.add("hovered");
      });
      cell.addEventListener("dragleave", ()=>cell.classList.remove("hovered"));
      cell.addEventListener("drop", e=>{
        e.preventDefault(); cell.classList.remove("hovered");
        const id = e.dataTransfer.getData("text");
        const newTile = document.getElementById(id);
        if(!newTile) return;

        if(cell.children.length>0){
          const oldTile = cell.children[0];
          document.getElementById("snapshot-container").appendChild(oldTile);
        }

        cell.innerHTML=""; cell.appendChild(newTile);
        checkPuzzleCompletion();
      });

      puzzle.appendChild(cell);
    }
  }
}

function enableReturnToBank(snapshotContainer){
  snapshotContainer.addEventListener("dragover", e=>{e.preventDefault();});
  snapshotContainer.addEventListener("drop", e=>{
    e.preventDefault();
    const id = e.dataTransfer.getData("text");
    const tile = document.getElementById(id);
    if(tile) snapshotContainer.appendChild(tile);
    checkPuzzleCompletion();
  });
}

function checkPuzzleCompletion(){
  const puzzle = document.getElementById("puzzle");
  for(const cell of puzzle.querySelectorAll("div")){
    const tile = cell.querySelector("img");
    if(!tile || tile.dataset.correct !== cell.dataset.position) return;
  }
  console.log("Puzzle completed!");
  if("Notification" in window && Notification.permission==="granted"){
    new Notification("Puzzle completed!", {body:"Ułożyłeś puzzle!",icon: "icon.png"});
  }
}

function addDragEvents(tile){
  tile.addEventListener("dragstart", e=>{
    e.dataTransfer.setData("text", e.target.id);
  });
}
