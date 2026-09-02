/* =========================================
   TINY WORLD
   Cozy Life Simulator
========================================= */

const SAVE_KEY = "tinyWorldSave";


/* =========================================
   DEFAULT DATA
========================================= */

const DEFAULT_GAME = {
  name: "Mimi",
  avatar: "🧑🏻‍🌾",

  coins: 120,
  wood: 20,
  gems: 5,

  level: 1,
  xp: 0,

  happiness: 80,

  day: 1,

  isNight: false,

  weather: "Sunny",

  inventory: {
    carrot: 2,
    flower: 1,
    wood: 5
  },

  quests: {
    water: 0,
    feed: 0,
    explore: 0
  },

  purchased: {
    tree: 0,
    flower: 0,
    decoration: 0,
    chick: 0
  }
};


/* =========================================
   GAME STATE
========================================= */

let game = loadGame();


function loadGame() {

  try {

    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_GAME);
    }

    const data = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_GAME),
      ...data,

      inventory: {
        ...DEFAULT_GAME.inventory,
        ...(data.inventory || {})
      },

      quests: {
        ...DEFAULT_GAME.quests,
        ...(data.quests || {})
      },

      purchased: {
        ...DEFAULT_GAME.purchased,
        ...(data.purchased || {})
      }
    };

  } catch (error) {

    console.error(error);

    return structuredClone(DEFAULT_GAME);
  }
}


function saveGame() {

  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify(game)
  );

  showToast(
    "💾",
    "Your Tiny World has been saved!"
  );
}


/* =========================================
   HELPERS
========================================= */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


function addXP(amount) {

  game.xp += amount;

  let needed = 100 + (game.level - 1) * 40;

  while (game.xp >= needed) {

    game.xp -= needed;

    game.level++;

    game.coins += 50;

    showToast(
      "🎉",
      `Level up! You are now level ${game.level}!`
    );

    needed = 100 + (game.level - 1) * 40;
  }
}


function updateUI() {

  document.getElementById("coins").textContent =
    game.coins;

  document.getElementById("wood").textContent =
    game.wood;

  document.getElementById("gems").textContent =
    game.gems;

  document.getElementById("level").textContent =
    game.level;

  document.getElementById("xp").textContent =
    game.xp;


  const needed =
    100 + (game.level - 1) * 40;

  const percent =
    (game.xp / needed) * 100;

  document.getElementById("xpBar").style.width =
    `${percent}%`;


  document.getElementById("playerName").textContent =
    game.name;

  document.getElementById("welcomeName").textContent =
    game.name;

  document.getElementById("playerAvatar").textContent =
    game.avatar;

  document.getElementById("player").querySelector("span").textContent =
    game.avatar;

  document.getElementById("player").querySelector("small").textContent =
    game.name;


  updateWeather();

  updateInventory();

  updateQuests();

  updateMood();
}


/* =========================================
   MOOD
========================================= */

function updateMood() {

  const mood = document.getElementById("playerMood");

  if (game.happiness >= 90) {

    mood.textContent =
      "Super happy! ✨";

  } else if (game.happiness >= 70) {

    mood.textContent =
      "Feeling cozy ☁️";

  } else if (game.happiness >= 40) {

    mood.textContent =
      "A little tired... 🌧️";

  } else {

    mood.textContent =
      "Needs some love 🥺";
  }
}


/* =========================================
   WEATHER
========================================= */

const weatherTypes = [
  {
    name: "Sunny",
    icon: "☀️",
    temp: "24°C"
  },
  {
    name: "Cloudy",
    icon: "☁️",
    temp: "21°C"
  },
  {
    name: "Rainy",
    icon: "🌧️",
    temp: "19°C"
  },
  {
    name: "Rainbow",
    icon: "🌈",
    temp: "23°C"
  }
];


function updateWeather() {

  const weather =
    weatherTypes.find(
      w => w.name === game.weather
    ) || weatherTypes[0];


  document.getElementById("weatherIcon").textContent =
    weather.icon;

  document.getElementById("bigWeather").textContent =
    weather.icon;

  document.getElementById("weatherName").textContent =
    weather.name;

  document.getElementById("temperature").textContent =
    weather.temp;

  document.getElementById("timeText").textContent =
    game.isNight ? "Peaceful Night" : `${weather.name} Day`;

  document.getElementById("dayText").textContent =
    `Day ${game.day}`;

  document.getElementById("celestial").textContent =
    game.isNight ? "🌙" : "☀️";

  document.body.classList.toggle(
    "night",
    game.isNight
  );
}


/* =========================================
   NAVIGATION
========================================= */

document.querySelectorAll(".menu-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      const target =
        button.dataset.panel;

      document.querySelectorAll(".menu-btn")
        .forEach(btn =>
          btn.classList.remove("active")
        );

      button.classList.add("active");


      document.querySelectorAll(".panel")
        .forEach(panel =>
          panel.classList.remove("active")
        );


      document.getElementById(
        `${target}Panel`
      ).classList.add("active");

    });

  });


/* =========================================
   WORLD OBJECT INTERACTIONS
========================================= */

document.querySelectorAll(".world-object")
  .forEach(object => {

    object.addEventListener("click", () => {

      const type =
        object.dataset.object;

      interactWithWorld(type);

    });

  });


function interactWithWorld(type) {

  switch (type) {

    case "house":

      openDialog(
        "🏠",
        "Your Cozy Home",
        "It's warm, cute and completely yours. You can imagine a tiny kitchen, a soft bed and lots of plants inside. 🪴"
      );

      break;


    case "tree":

      game.wood += 2;

      game.inventory.wood =
        (game.inventory.wood || 0) + 2;

      addXP(5);

      showToast(
        "🌳",
        "You collected 2 pieces of wood!"
      );

      break;


    case "flower":

      game.inventory.flower =
        (game.inventory.flower || 0) + 1;

      game.happiness =
        clamp(game.happiness + 2, 0, 100);

      addXP(4);

      showToast(
        "🌸",
        "You picked a pretty flower!"
      );

      break;


    case "farm":

      waterGarden();

      break;


    case "pet":

      feedBunny();

      break;


    case "well":

      game.happiness =
        clamp(game.happiness + 5, 0, 100);

      showToast(
        "💧",
        "You took a refreshing sip from the well."
      );

      addXP(3);

      break;


    case "bridge":

      explore();

      break;
  }

  updateUI();
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}


/* =========================================
   ACTION BUTTONS
========================================= */

document.querySelectorAll(".action-card")
  .forEach(button => {

    button.addEventListener("click", () => {

      const action =
        button.dataset.action;

      if (action === "water") {
        waterGarden();
      }

      if (action === "harvest") {
        harvest();
      }

      if (action === "feed") {
        feedBunny();
      }

      if (action === "explore") {
        explore();
      }

      updateUI();

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
      );
    });

  });


/* =========================================
   WATER GARDEN
========================================= */

function waterGarden() {

  game.quests.water =
    clamp(game.quests.water + 1, 0, 3);

  game.happiness =
    clamp(game.happiness + 7, 0, 100);

  addXP(10);

  showToast(
    "💧",
    "Your garden looks so fresh! 🌱"
  );

  if (game.quests.water === 3) {

    game.coins += 40;

    showToast(
      "🎉",
      "Garden quest complete! +40 coins"
    );
  }
}


/* =========================================
   HARVEST
========================================= */

function harvest() {

  const amount =
    Math.floor(Math.random() * 3) + 1;

  game.coins += amount * 8;

  game.inventory.carrot =
    (game.inventory.carrot || 0) + amount;

  addXP(12);

  showToast(
    "🥕",
    `You harvested ${amount} carrot${amount > 1 ? "s" : ""}!`
  );
}


/* =========================================
   BUNNY
========================================= */

function feedBunny() {

  if ((game.inventory.carrot || 0) <= 0) {

    showToast(
      "🥺",
      "You need a carrot to feed your bunny!"
    );

    return;
  }


  game.inventory.carrot--;

  game.quests.feed =
    clamp(game.quests.feed + 1, 0, 2);

  game.happiness =
    clamp(game.happiness + 10, 0, 100);

  addXP(8);


  if (game.quests.feed === 2) {

    game.gems += 1;

    showToast(
      "💎",
      "Bunny quest complete! +1 gem"
    );

  } else {

    showToast(
      "🐰",
      "Your bunny is very happy! ♡"
    );
  }
}


/* =========================================
   EXPLORE
========================================= */

function explore() {

  game.quests.explore =
    clamp(game.quests.explore + 1, 0, 2);


  const rewards = [
    {
      icon: "🌲",
      text: "You found some wood!",
      type: "wood"
    },
    {
      icon: "🌸",
      text: "You found a flower!",
      type: "flower"
    },
    {
      icon: "🪙",
      text: "You found some coins!",
      type: "coins"
    },
    {
      icon: "💎",
      text: "OMG! You found a gem!",
      type: "gem"
    }
  ];


  const reward =
    rewards[Math.floor(Math.random() * rewards.length)];


  if (reward.type === "wood") {

    game.wood += 3;

    game.inventory.wood =
      (game.inventory.wood || 0) + 3;

  }


  if (reward.type === "flower") {

    game.inventory.flower =
      (game.inventory.flower || 0) + 1;

  }


  if (reward.type === "coins") {

    game.coins += 25;

  }


  if (reward.type === "gem") {

    game.gems += 1;

  }


  addXP(15);


  if (game.quests.explore === 2) {

    game.coins += 50;

    showToast(
      "🎉",
      `${reward.text} Quest complete! +50 coins`
    );

  } else {

    showToast(
      reward.icon,
      reward.text
    );
  }
}


/* =========================================
   DAY / NIGHT
========================================= */

document.getElementById("dayNightBtn")
  .addEventListener("click", () => {

    game.isNight =
      !game.isNight;

    updateWeather();

    showToast(
      game.isNight ? "🌙" : "☀️",
      game.isNight
        ? "The tiny world is sleeping..."
        : "Good morning, Tiny World!"
    );

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );
  });


/* =========================================
   WEATHER CHANGE
========================================= */

document.getElementById("weatherBtn")
  .addEventListener("click", () => {

    const current =
      weatherTypes.findIndex(
        weather => weather.name === game.weather
      );

    const next =
      (current + 1) % weatherTypes.length;

    game.weather =
      weatherTypes[next].name;

    updateWeather();

    showToast(
      weatherTypes[next].icon,
      `Weather changed to ${weatherTypes[next].name}!`
    );

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );
  });


/* =========================================
   SHOP
========================================= */

document.querySelectorAll("[data-buy]")
  .forEach(button => {

    button.addEventListener("click", () => {

      const item =
        button.dataset.buy;

      const price =
        Number(button.dataset.price);


      if (game.coins < price) {

        showToast(
          "🥺",
          "You don't have enough coins!"
        );

        return;
      }


      game.coins -= price;

      game.purchased[item] =
        (game.purchased[item] || 0) + 1;


      if (item === "tree") {

        game.inventory.tree =
          (game.inventory.tree || 0) + 1;
      }

      if (item === "flower") {

        game.inventory.flower =
          (game.inventory.flower || 0) + 3;
      }

      if (item === "decoration") {

        game.inventory.decoration =
          (game.inventory.decoration || 0) + 1;
      }

      if (item === "chick") {

        game.inventory.chick =
          (game.inventory.chick || 0) + 1;
      }


      addXP(10);

      showToast(
        "🛍️",
        "Purchase complete! Added to inventory."
      );


      updateUI();

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
      );

    });

  });


/* =========================================
   INVENTORY
========================================= */

const itemData = {

  carrot: {
    icon: "🥕",
    name: "Carrot"
  },

  flower: {
    icon: "🌸",
    name: "Flower"
  },

  wood: {
    icon: "🪵",
    name: "Wood"
  },

  tree: {
    icon: "🌳",
    name: "Little Tree"
  },

  decoration: {
    icon: "🪴",
    name: "Decoration"
  },

  chick: {
    icon: "🐥",
    name: "Little Chick"
  }
};


function updateInventory() {

  const grid =
    document.getElementById("inventoryGrid");

  grid.innerHTML = "";


  let hasItem = false;


  Object.entries(game.inventory)
    .forEach(([key, amount]) => {

      if (!amount || amount <= 0) {
        return;
      }

      hasItem = true;


      const data =
        itemData[key] || {
          icon: "📦",
          name: key
        };


      const div =
        document.createElement("div");

      div.className =
        "inventory-item";


      div.innerHTML = `
        <div class="item-icon">${data.icon}</div>
        <strong>${data.name}</strong>
        <small>x${amount}</small>
      `;


      grid.appendChild(div);
    });


  if (!hasItem) {

    grid.innerHTML = `
      <div class="inventory-item">
        <div class="item-icon">🫧</div>
        <strong>Empty</strong>
        <small>Go explore!</small>
      </div>
    `;
  }
}


/* =========================================
   QUEST UI
========================================= */

function updateQuests() {

  const water =
    game.quests.water;

  const feed =
    game.quests.feed;

  const explore =
    game.quests.explore;


  document.getElementById("waterQuestText")
    .textContent = `${water} / 3`;

  document.getElementById("feedQuestText")
    .textContent = `${feed} / 2`;

  document.getElementById("exploreQuestText")
    .textContent = `${explore} / 2`;


  document.getElementById("waterQuestBar")
    .style.width =
      `${(water / 3) * 100}%`;


  document.getElementById("feedQuestBar")
    .style.width =
      `${(feed / 2) * 100}%`;


  document.getElementById("exploreQuestBar")
    .style.width =
      `${(explore / 2) * 100}%`;
}


/* =========================================
   CHARACTER
========================================= */

document.querySelectorAll("[data-character]")
  .forEach(button => {

    button.addEventListener("click", () => {

      game.avatar =
        button.dataset.character;

      updateUI();

      showToast(
        "✨",
        "Your character looks adorable!"
      );

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(game)
      );
    });

  });


/* =========================================
   NAME
========================================= */

document.getElementById("nameInput")
  .addEventListener("change", event => {

    const name =
      event.target.value.trim();

    if (!name) {
      event.target.value = game.name;
      return;
    }


    game.name = name;

    updateUI();

    showToast(
      "💗",
      `Hello, ${game.name}!`
    );

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );
  });


/* =========================================
   DIALOG
========================================= */

function openDialog(icon, title, text) {

  document.getElementById("dialogCharacter")
    .textContent = icon;

  document.getElementById("dialogTitle")
    .textContent = title;

  document.getElementById("dialogText")
    .textContent = text;

  document.getElementById("dialogOverlay")
    .classList.add("show");
}


function closeDialog() {

  document.getElementById("dialogOverlay")
    .classList.remove("show");
}


document.getElementById("closeDialog")
  .addEventListener("click", closeDialog);

document.getElementById("dialogOk")
  .addEventListener("click", closeDialog);

document.getElementById("dialogOverlay")
  .addEventListener("click", event => {

    if (
      event.target.id === "dialogOverlay"
    ) {
      closeDialog();
    }
  });


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(icon, text) {

  const toast =
    document.getElementById("toast");

  document.getElementById("toastIcon")
    .textContent = icon;

  document.getElementById("toastText")
    .textContent = text;


  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 2600);
}


/* =========================================
   SAVE BUTTON
========================================= */

document.getElementById("saveBtn")
  .addEventListener("click", () => {

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(game)
    );

    showToast(
      "💾",
      "Tiny World saved successfully!"
    );
  });


/* =========================================
   RESET
========================================= */

document.getElementById("resetBtn")
  .addEventListener("click", () => {

    const confirmReset =
      confirm(
        "Are you sure you want to reset your Tiny World?"
      );


    if (!confirmReset) {
      return;
    }


    game =
      structuredClone(DEFAULT_GAME);


    localStorage.removeItem(
      SAVE_KEY
    );


    document.getElementById("nameInput")
      .value = game.name;


    updateUI();


    showToast(
      "🌱",
      "Your Tiny World has been restarted!"
    );
  });


/* =========================================
   PLAYER INTERACTION
========================================= */

document.getElementById("player")
  .addEventListener("click", () => {

    const messages = [

      `Hi! I'm ${game.name}! 🌱`,

      "I think my tiny world is getting prettier!",

      "Maybe I'll go explore later... 👀",

      "I love living here! ♡",

      "Don't forget to take care of the garden!"
    ];


    const message =
      messages[
        Math.floor(
          Math.random() * messages.length
        )
      ];


    openDialog(
      game.avatar,
      game.name,
      message
    );
  });


/* =========================================
   PET RANDOM MOVEMENT
========================================= */

function moveBunny() {

  const bunny =
    document.querySelector(".pet");

  const positions = [
    {
      right: "39%",
      bottom: "27%"
    },
    {
      right: "32%",
      bottom: "22%"
    },
    {
      right: "45%",
      bottom: "25%"
    },
    {
      right: "26%",
      bottom: "31%"
    }
  ];


  const pos =
    positions[
      Math.floor(
        Math.random() * positions.length
      )
    ];


  bunny.style.right =
    pos.right;

  bunny.style.bottom =
    pos.bottom;
}


setInterval(moveBunny, 5000);


/* =========================================
   RANDOM WORLD SPARKLE
========================================= */

function randomSparkle() {

  const world =
    document.getElementById("world");

  const sparkle =
    document.createElement("div");

  sparkle.textContent =
    Math.random() > .5 ? "✦" : "✧";

  sparkle.style.position =
    "absolute";

  sparkle.style.left =
    `${Math.random() * 90 + 5}%`;

  sparkle.style.top =
    `${Math.random() * 70 + 10}%`;

  sparkle.style.color =
    "white";

  sparkle.style.fontSize =
    "15px";

  sparkle.style.pointerEvents =
    "none";

  sparkle.style.zIndex =
    "30";

  world.appendChild(sparkle);


  sparkle.animate(
    [
      {
        opacity: 0,
        transform: "translateY(10px) scale(.5)"
      },
      {
        opacity: 1,
        transform: "translateY(0) scale(1)"
      },
      {
        opacity: 0,
        transform: "translateY(-15px) scale(.5)"
      }
    ],
    {
      duration: 1500,
      easing: "ease-out"
    }
  );


  setTimeout(
    () => sparkle.remove(),
    1500
  );
}


setInterval(randomSparkle, 2200);


/* =========================================
   AUTOMATIC DAY CHANGE
========================================= */

const today =
  new Date().toDateString();

const lastDate =
  localStorage.getItem("tinyWorldDate");


if (
  lastDate &&
  lastDate !== today
) {

  game.day++;

  game.quests = {
    water: 0,
    feed: 0,
    explore: 0
  };

  game.coins += 30;

  showToast(
    "🌅",
    "A new day has arrived! +30 coins"
  );
}


localStorage.setItem(
  "tinyWorldDate",
  today
);


/* =========================================
   INITIALIZE
========================================= */

document.getElementById("nameInput")
  .value = game.name;

updateUI();


setTimeout(() => {

  showToast(
    "🌱",
    `Welcome back to Tiny World, ${game.name}!`
  );

}, 700);
