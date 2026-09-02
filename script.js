```javascript
/* =========================================================
   TINY LAND
   Cozy Island Simulator
   ========================================================= */


/* =========================
   GAME DATA
========================= */

const ITEMS = {

  flower: {
    name: "Flower",
    icon: "🌷",
    price: 20,
    type: "decor",
    xp: 5
  },

  tree: {
    name: "Tree",
    icon: "🌳",
    price: 45,
    type: "decor",
    xp: 8
  },

  rock: {
    name: "Rock",
    icon: "🪨",
    price: 15,
    type: "decor",
    xp: 3
  },

  bush: {
    name: "Bush",
    icon: "🌿",
    price: 25,
    type: "decor",
    xp: 5
  },

  house: {
    name: "Tiny House",
    icon: "🏡",
    price: 180,
    type: "building",
    xp: 25
  },

  cafe: {
    name: "Café",
    icon: "☕",
    price: 250,
    type: "building",
    xp: 35
  },

  fountain: {
    name: "Fountain",
    icon: "⛲",
    price: 140,
    type: "decor",
    xp: 20
  },

  bench: {
    name: "Bench",
    icon: "🪑",
    price: 70,
    type: "decor",
    xp: 12
  },

  garden: {
    name: "Garden",
    icon: "🌱",
    price: 100,
    type: "building",
    xp: 18
  },

  pumpkin: {
    name: "Pumpkin",
    icon: "🎃",
    price: 30,
    type: "decor",
    xp: 6
  },

  mushroom: {
    name: "Mushroom",
    icon: "🍄",
    price: 35,
    type: "decor",
    xp: 6
  },

  lantern: {
    name: "Lantern",
    icon: "🏮",
    price: 60,
    type: "decor",
    xp: 10
  }

};


const SHOP_ITEMS = [

  {
    id: "seed",
    name: "Flower Seeds",
    icon: "🌱",
    price: 15,
    description: "Plant something tiny."
  },

  {
    id: "apple",
    name: "Apple",
    icon: "🍎",
    price: 10,
    description: "A sweet little snack."
  },

  {
    id: "cookie",
    name: "Cookie",
    icon: "🍪",
    price: 18,
    description: "Made with love."
  },

  {
    id: "star",
    name: "Star Fragment",
    icon: "⭐",
    price: 75,
    description: "A piece of the night sky."
  },

  {
    id: "pet",
    name: "Tiny Bunny",
    icon: "🐰",
    price: 300,
    description: "Your new little friend."
  }

];


/* =========================
   DEFAULT GAME
========================= */

const DEFAULT_GAME = {

  coins: 500,

  level: 1,

  xp: 0,

  happiness: 100,

  day: 1,

  weather: "Sunny",

  time: "Morning",

  selected: "flower",

  removeMode: false,

  pet: false,

  inventory: {
    seed: 3,
    apple: 0,
    cookie: 0,
    star: 0
  },

  island: {},

  quests: {

    decorate: {
      progress: 0,
      goal: 5,
      claimed: false
    },

    collect: {
      progress: 0,
      goal: 3,
      claimed: false
    },

    earn: {
      progress: 0,
      goal: 300,
      claimed: false
    }

  }

};


/* =========================
   LOAD / SAVE
========================= */

let game = loadGame();


function loadGame() {

  try {

    const saved = localStorage.getItem("tinyLandSave");

    if (!saved) {
      return structuredClone(DEFAULT_GAME);
    }

    return {
      ...structuredClone(DEFAULT_GAME),
      ...JSON.parse(saved)
    };

  } catch (error) {

    console.warn("Save data could not be loaded.");

    return structuredClone(DEFAULT_GAME);

  }

}


function saveGame(showMessage = false) {

  localStorage.setItem(
    "tinyLandSave",
    JSON.stringify(game)
  );

  if (showMessage) {
    showToast("💾", "Island saved!");
  }

  updateUI();
}


/* =========================
   DOM
========================= */

const grid = document.getElementById("islandGrid");

const coinsEl = document.getElementById("coins");
const levelEl = document.getElementById("level");
const happinessEl = document.getElementById("happiness");

const levelText = document.getElementById("levelText");
const xpText = document.getElementById("xpText");
const xpFill = document.getElementById("xpFill");

const dayLabel = document.getElementById("dayLabel");

const weatherIcon = document.getElementById("weatherIcon");
const weatherName = document.getElementById("weatherName");
const timeLabel = document.getElementById("timeLabel");

const selectedIcon = document.getElementById("selectedIcon");
const selectedName = document.getElementById("selectedName");

const buildList = document.getElementById("buildList");

const shopList = document.getElementById("shopList");
const inventoryList = document.getElementById("inventoryList");
const questList = document.getElementById("questList");

const toast = document.getElementById("toast");
const toastIcon = document.getElementById("toastIcon");
const toastText = document.getElementById("toastText");


/* =========================
   GRID
========================= */

const GRID_WIDTH = 9;
const GRID_HEIGHT = 7;
const TOTAL_TILES = GRID_WIDTH * GRID_HEIGHT;


function createGrid() {

  grid.innerHTML = "";

  for (let i = 0; i < TOTAL_TILES; i++) {

    const tile = document.createElement("div");

    tile.className = "tile";

    tile.dataset.index = i;

    tile.addEventListener("click", () => {

      handleTileClick(i);

    });

    grid.appendChild(tile);

  }

  renderIsland();

}


function renderIsland() {

  const tiles = grid.querySelectorAll(".tile");

  tiles.forEach((tile, index) => {

    tile.innerHTML = "";

    const itemId = game.island[index];

    if (itemId && ITEMS[itemId]) {

      tile.classList.add("occupied");

      const content = document.createElement("div");

      content.className = "tile-content";

      content.textContent = ITEMS[itemId].icon;

      tile.appendChild(content);

    } else {

      tile.classList.remove("occupied");

    }

  });

}


/* =========================
   TILE CLICK
========================= */

function handleTileClick(index) {

  const currentItem = game.island[index];

  /* REMOVE */

  if (game.removeMode) {

    if (!currentItem) {

      showToast("🌱", "There's nothing here!");

      return;

    }

    const removed = ITEMS[currentItem];

    delete game.island[index];

    game.happiness = Math.min(
      100,
      game.happiness + 1
    );

    saveGame();

    renderIsland();

    showToast(
      "🗑️",
      `${removed.name} removed.`
    );

    return;
  }


  /* OCCUPIED */

  if (currentItem) {

    showToast(
      ITEMS[currentItem].icon,
      "This spot is already occupied!"
    );

    return;
  }


  /* PLACE ITEM */

  const itemId = game.selected;
  const item = ITEMS[itemId];

  if (!item) return;


  if (game.coins < item.price) {

    showToast(
      "💸",
      "Not enough Tiny Coins!"
    );

    return;
  }


  game.coins -= item.price;

  game.island[index] = itemId;

  game.happiness = Math.min(
    100,
    game.happiness + 2
  );

  addXP(item.xp);

  game.quests.decorate.progress =
    Math.min(
      game.quests.decorate.goal,
      game.quests.decorate.progress + 1
    );

  saveGame();

  renderIsland();

  showToast(
    item.icon,
    `${item.name} placed!`
  );

}


/* =========================
   BUILD MENU
========================= */

function renderBuildItems() {

  buildList.innerHTML = "";

  Object.entries(ITEMS).forEach(
    ([id, item]) => {

      const button = document.createElement("button");

      button.className =
        "build-item" +
        (game.selected === id && !game.removeMode
          ? " selected"
          : "");

      button.innerHTML = `
        <span class="item-icon">${item.icon}</span>
        <span class="item-name">${item.name}</span>
        <span class="item-price">🪙 ${item.price}</span>
      `;

      button.addEventListener("click", () => {

        game.selected = id;

        game.removeMode = false;

        updateSelectedInfo();

        renderBuildItems();

        document
          .getElementById("removeButton")
          .classList.remove("active");

      });

      buildList.appendChild(button);

    }
  );

}


/* =========================
   SELECTED ITEM
========================= */

function updateSelectedInfo() {

  const item = ITEMS[game.selected];

  if (!item) return;

  selectedIcon.textContent = item.icon;

  selectedName.textContent =
    game.removeMode
      ? "Remove"
      : item.name;

}


/* =========================
   REMOVE MODE
========================= */

document
  .getElementById("removeButton")
  .addEventListener("click", () => {

    game.removeMode = !game.removeMode;

    const button =
      document.getElementById("removeButton");

    button.classList.toggle(
      "active",
      game.removeMode
    );

    updateSelectedInfo();

    renderBuildItems();

    showToast(
      game.removeMode ? "🗑️" : "🌱",
      game.removeMode
        ? "Remove mode on."
        : "Build mode on."
    );

  });


/* =========================
   XP / LEVEL
========================= */

function addXP(amount) {

  game.xp += amount;

  const xpNeeded =
    100 + (game.level - 1) * 50;


  while (game.xp >= xpNeededForLevel()) {

    game.xp -= xpNeededForLevel();

    game.level++;

    game.coins += 100;

    game.happiness = Math.min(
      100,
      game.happiness + 10
    );

    showToast(
      "⭐",
      `Level ${game.level}! +100 coins`
    );

  }

}


function xpNeededForLevel() {

  return 100 + (game.level - 1) * 50;

}


/* =========================
   WEATHER
========================= */

const WEATHER = [

  {
    name: "Sunny",
    icon: "☀️"
  },

  {
    name: "Cloudy",
    icon: "☁️"
  },

  {
    name: "Rainy",
    icon: "🌧️"
  },

  {
    name: "Rainbow",
    icon: "🌈"
  },

  {
    name: "Starry",
    icon: "🌟"
  }

];


function randomWeather() {

  const weather =
    WEATHER[
      Math.floor(
        Math.random() * WEATHER.length
      )
    ];

  game.weather = weather.name;

  weatherIcon.textContent = weather.icon;
  weatherName.textContent = weather.name;

}


/* =========================
   TIME
========================= */

function updateTime() {

  const hour = new Date().getHours();

  let time;

  if (hour >= 5 && hour < 11) {
    time = "Morning";
  } else if (hour >= 11 && hour < 17) {
    time = "Afternoon";
  } else if (hour >= 17 && hour < 21) {
    time = "Sunset";
  } else {
    time = "Night";
  }

  game.time = time;

  timeLabel.textContent = time;

  if (time === "Night") {

    document.querySelector(".world-wrapper").style.background =
      "linear-gradient(#55557d 0 57%, #4d7791 57% 100%)";

  } else if (time === "Sunset") {

    document.querySelector(".world-wrapper").style.background =
      "linear-gradient(#f2c8b6 0 57%, #9ac6d8 57% 100%)";

  } else {

    document.querySelector(".world-wrapper").style.background =
      "linear-gradient(#cfeef9 0 57%, #b5e2f2 57% 100%)";

  }

}


/* =========================
   SHOP
========================= */

function renderShop() {

  shopList.innerHTML = "";

  SHOP_ITEMS.forEach(item => {

    const owned =
      item.id === "pet"
        ? game.pet
        : game.inventory[item.id] || 0;

    const buttonText =
      item.id === "pet" && game.pet
        ? "Owned"
        : `Buy · 🪙 ${item.price}`;

    const card =
      document.createElement("div");

    card.className = "shop-item";

    card.innerHTML = `
      <div class="shop-item-icon">${item.icon}</div>

      <h3>${item.name}</h3>

      <p>${item.description}</p>

      <button
        class="buy-button"
        ${game.coins < item.price || (item.id === "pet" && game.pet)
          ? "disabled"
          : ""}
      >
        ${buttonText}
      </button>
    `;

    card
      .querySelector(".buy-button")
      .addEventListener("click", () => {

        buyShopItem(item);

      });

    shopList.appendChild(card);

  });

}


function buyShopItem(item) {

  if (game.coins < item.price) {

    showToast(
      "💸",
      "Not enough coins!"
    );

    return;
  }


  if (item.id === "pet" && game.pet) {

    return;

  }


  game.coins -= item.price;


  if (item.id === "pet") {

    game.pet = true;

    game.happiness = 100;

    document.querySelector(".avatar").textContent = "🐰";

    addXP(30);

    showToast(
      "🐰",
      "You adopted a Tiny Bunny!"
    );

  } else {

    game.inventory[item.id] =
      (game.inventory[item.id] || 0) + 1;

    showToast(
      item.icon,
      `${item.name} added to inventory.`
    );

  }


  saveGame();

  renderShop();

  renderInventory();

}


/* =========================
   INVENTORY
========================= */

function renderInventory() {

  inventoryList.innerHTML = "";

  const inventory = game.inventory;

  Object.entries(inventory).forEach(
    ([id, quantity]) => {

      const item =
        SHOP_ITEMS.find(
          item => item.id === id
        );

      if (!item) return;

      const card =
        document.createElement("div");

      card.className = "inventory-item";

      card.innerHTML = `
        <div class="inventory-item-icon">
          ${item.icon}
        </div>

        <strong>${item.name}</strong>

        <span>× ${quantity}</span>
      `;

      inventoryList.appendChild(card);

    }
  );


  const petCard =
    document.createElement("div");

  petCard.className = "inventory-item";

  petCard.innerHTML = `
    <div class="inventory-item-icon">
      ${game.pet ? "🐰" : "🥚"}
    </div>

    <strong>Pet</strong>

    <span>
      ${game.pet ? "Tiny Bunny" : "None"}
    </span>
  `;

  inventoryList.appendChild(petCard);

}


/* =========================
   QUESTS
========================= */

function renderQuests() {

  questList.innerHTML = "";

  const quests = [

    {
      id: "decorate",
      icon: "🌷",
      title: "Make It Pretty",
      description: "Place 5 decorations on your island.",
      reward: 100
    },

    {
      id: "collect",
      icon: "🎁",
      title: "Little Collector",
      description: "Buy 3 things from the Tiny Shop.",
      reward: 120
    },

    {
      id: "earn",
      icon: "🪙",
      title: "Tiny Business",
      description: "Earn 300 Tiny Coins.",
      reward: 180
    }

  ];


  quests.forEach(quest => {

    const data = game.quests[quest.id];

    const percent =
      Math.min(
        100,
        (data.progress / quest.goal) * 100
      );


    const card =
      document.createElement("div");

    card.className = "quest";

    const completed =
      data.progress >= quest.goal;

    card.innerHTML = `
      <div class="quest-top">

        <div>
          <h3>
            ${quest.icon} ${quest.title}
          </h3>

          <p>
            ${quest.description}
          </p>
        </div>

        <span class="quest-reward">
          +${quest.reward} 🪙
        </span>

      </div>

      <div class="quest-progress">
        <div style="width:${percent}%"></div>
      </div>

      <p>
        ${Math.min(data.progress, quest.goal)}
        / ${quest.goal}
      </p>

      ${
        completed && !data.claimed
          ? `<button class="claim-button">
              Claim Reward
            </button>`
          : data.claimed
            ? `<button class="claim-button" disabled>
                ✓ Completed
              </button>`
            : ""
      }
    `;


    const claimButton =
      card.querySelector(".claim-button");


    if (claimButton && !data.claimed) {

      claimButton.addEventListener(
        "click",
        () => {

          game.coins += quest.reward;

          data.claimed = true;

          addXP(20);

          saveGame();

          renderQuests();

          showToast(
            "🎁",
            `+${quest.reward} coins!`
          );

        }
      );

    }


    questList.appendChild(card);

  });

}


/* =========================
   MODALS
========================= */

function openModal(id) {

  document
    .getElementById(id)
    .classList.add("show");

}


function closeModal(id) {

  document
    .getElementById(id)
    .classList.remove("show");

}


document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        closeModal(button.dataset.close);

      }
    );

  });


document
  .querySelectorAll(".modal-overlay")
  .forEach(overlay => {

    overlay.addEventListener(
      "click",
      event => {

        if (event.target === overlay) {

          overlay.classList.remove("show");

        }

      }
    );

  });


/* =========================
   NAVIGATION
========================= */

function handlePanel(panel) {

  document
    .querySelectorAll(".menu-button, .mobile-nav-button")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.panel === panel
      );

    });


  if (panel === "shop") {

    renderShop();

    openModal("shopModal");

  }

  if (panel === "inventory") {

    renderInventory();

    openModal("inventoryModal");

  }

  if (panel === "quests") {

    renderQuests();

    openModal("questsModal");

  }

}


document
  .querySelectorAll(".menu-button, .mobile-nav-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        handlePanel(
          button.dataset.panel
        );

      }
    );

  });


/* =========================
   SAVE BUTTON
========================= */

document
  .getElementById("saveButton")
  .addEventListener(
    "click",
    () => {

      saveGame(true);

    }
  );


/* =========================
   SOUND
========================= */

let soundOn = true;

document
  .getElementById("soundButton")
  .addEventListener(
    "click",
    () => {

      soundOn = !soundOn;

      document.getElementById(
        "soundButton"
      ).textContent =
        soundOn ? "🔊" : "🔇";

      showToast(
        soundOn ? "🔊" : "🔇",
        soundOn
          ? "Sound on."
          : "Sound off."
      );

    }
  );


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(icon, message) {

  toastIcon.textContent = icon;
  toastText.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2200);

}


/* =========================
   RESET
========================= */

document
  .getElementById("resetButton")
  .addEventListener(
    "click",
    () => {

      const confirmReset =
        confirm(
          "Reset your Tiny Land? All progress will be deleted."
        );

      if (!confirmReset) return;

      localStorage.removeItem(
        "tinyLandSave"
      );

      game =
        structuredClone(DEFAULT_GAME);

      createGrid();

      renderBuildItems();

      updateUI();

      showToast(
        "🌱",
        "A new Tiny Land has begun!"
      );

    }
  );


/* =========================
   UI UPDATE
========================= */

function updateUI() {

  coinsEl.textContent =
    game.coins.toLocaleString();

  levelEl.textContent =
    game.level;

  happinessEl.textContent =
    game.happiness;

  levelText.textContent =
    game.level;

  const needed =
    xpNeededForLevel();

  xpText.textContent =
    `${game.xp} / ${needed} XP`;

  xpFill.style.width =
    `${Math.min(100, (game.xp / needed) * 100)}%`;

  dayLabel.textContent =
    `Day ${game.day}`;

  updateSelectedInfo();

  updateTime();

  const weather =
    WEATHER.find(
      w => w.name === game.weather
    ) || WEATHER[0];

  weatherIcon.textContent =
    weather.icon;

  weatherName.textContent =
    game.weather;

  document.querySelector(
    ".avatar"
  ).textContent =
    game.pet ? "🐰" : "🌱";

}


/* =========================
   DAILY PROGRESSION
========================= */

let lastDay =
  localStorage.getItem(
    "tinyLandLastDay"
  );


const today =
  new Date().toDateString();


if (lastDay !== today) {

  if (lastDay !== null) {

    game.day++;

    game.coins += 50;

    game.happiness =
      Math.min(
        100,
        game.happiness + 5
      );

    randomWeather();

    showToast(
      "🌅",
      "A new day in Tiny Land!"
    );

  }

  localStorage.setItem(
    "tinyLandLastDay",
    today
  );

  saveGame();

}


/* =========================
   PASSIVE COINS
========================= */

setInterval(() => {

  game.coins += 2;

  game.quests.earn.progress =
    Math.min(
      game.quests.earn.goal,
      game.quests.earn.progress + 2
    );

  saveGame();

}, 30000);


/* =========================
   INITIALIZE
========================= */

createGrid();

renderBuildItems();

renderShop();

renderInventory();

renderQuests();

updateUI();

setTimeout(() => {

  showToast(
    "🌱",
    "Welcome to your Tiny Land!"
  );

}, 700);
```
