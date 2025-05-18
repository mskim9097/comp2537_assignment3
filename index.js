let clickCount = 0;
let matchedPairs = 0;
let totalPairs = 3;
let timer = 20;
let timerInterval = null;
let gameOver = false;

// This is function to load pokemon card from API.
async function loadPokemonPairs(totalPairsInput, timerInput) {
    clearInterval(timerInterval);
    clickCount = 0;
    matchedPairs = 0;
    gameOver = false;
    timer = timerInput;
    totalPairs = totalPairsInput;
    updateStatus();

    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1500`);
    let jsonObj = await response.json();
    let allPokemon = jsonObj.results;

    let selected = new Set();
    while (selected.size < totalPairsInput) {
        let randomIndex = Math.floor(Math.random() * allPokemon.length);
        selected.add(allPokemon[randomIndex].name);
    }

    let pairs = [...selected, ...selected];
    pairs.sort(() => Math.random() - 0.5);

    let gameGrid = document.getElementById("game_grid");
    gameGrid.innerHTML = "";

    let idCounter = 1;

    for (let name of pairs) {
        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const pokeData = await pokeRes.json();
        const imgSrc = pokeData.sprites.other["official-artwork"].front_default;

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <img id="img${idCounter}" class="front_face" src="${imgSrc}" alt="${name}">
        <img class="back_face" src="back.webp" alt="back">
        `;
        gameGrid.appendChild(card);
        idCounter++;
    }
    setup();
    applyGridLayout(totalPairsInput);
    startTimer();
}

//This is setup function to flip and check if the cards are fair or not.
function setup() {
    let firstCard = undefined;
    let secondCard = undefined;
    let isFlipping = false;

    $(".card").on(("click"), function () {
        if (gameOver) return;
        if (isFlipping) return;
        if ($(this).hasClass("flip")) return;
        $(this).toggleClass("flip");

        clickCount++;
        updateStatus();

        if (!firstCard) {
            firstCard = $(this).find(".front_face")[0];
        }
        else {
            isFlipping = true;
            secondCard = $(this).find(".front_face")[0];
            if (firstCard === secondCard) return;

            if (firstCard.src == secondCard.src) {
                $(`#${firstCard.id}`).parent().off("click");
                $(`#${secondCard.id}`).parent().off("click");
                $(`#${firstCard.id}`).parent().addClass("matched");
                $(`#${secondCard.id}`).parent().addClass("matched");

                matchedPairs++;
                updateStatus();
                if (matchedPairs === totalPairs) {
                    clearInterval(timerInterval);
                    document.getElementById("status_message").textContent = "🎉 You Win!";
                }

                firstCard = undefined;
                secondCard = undefined;
                isFlipping = false;
            } else {
                setTimeout(() => {
                    $(`#${firstCard.id}`).parent().toggleClass("flip");
                    $(`#${secondCard.id}`).parent().toggleClass("flip");

                    firstCard = undefined;
                    secondCard = undefined;
                    isFlipping = false;
                }, 1000)
            }

        }
    });
}

// This is function to update status when clicked or matched.
function updateStatus() {
    document.getElementById("clicks").textContent = clickCount;
    document.getElementById("matched").textContent = matchedPairs;
    document.getElementById("left").textContent = totalPairs - matchedPairs;
    document.getElementById("total").textContent = totalPairs;
}

// This is timer function
function startTimer() {
    document.getElementById("timer").textContent = timer;

    timerInterval = setInterval(() => {
        timer--;

        document.getElementById("timer").textContent = timer;

        if (timer <= 0) {
            clearInterval(timerInterval);
            gameOver = true;
            document.getElementById("status_message").textContent = "⏰ Game Over!";
            $(".card").off("click");
        }
    }, 1000);
}

// This is function for start button
document.getElementById("start_button").addEventListener("click", () => {
    document.getElementById("status_message").textContent = "";
    document.getElementById("start_button").style.display = "none";
    document.getElementById("powerup_button").style.display = "inline";
    const settings = getDifficultySettings();
    loadPokemonPairs(settings.pairs, settings.time);
});

// This is function for reset button
document.getElementById("reset_button").addEventListener("click", () => {
    clickCount = 0;
    matchedPairs = 0;
    gameOver = false;
    clearInterval(timerInterval);

    document.getElementById("status_message").textContent = "";
    updateStatus();
    document.getElementById("start_button").style.display = "inline";
    document.getElementById("powerup_button").style.display = "inline";
    loadPokemonPairs();
    const settings = getDifficultySettings();
    document.getElementById("total").textContent = settings.pairs;
    document.getElementById("left").textContent = settings.pairs;
    document.getElementById("timer").textContent = settings.time;

});

// This is function to set difficulty
function getDifficultySettings() {
    const difficulty = document.getElementById("difficulty").value;

    switch (difficulty) {
        case "easy":
            return { pairs: 3, time: 20 };
        case "medium":
            return { pairs: 6, time: 60 };
        case "hard":
            return { pairs: 10, time: 120 };
    }
}
// This is event light/dark mode theme.
document.getElementById("light_mode_button").addEventListener("click", () => {
    document.getElementById("game_grid").style.backgroundColor = "white";
});

document.getElementById("dark_mode_button").addEventListener("click", () => {
    document.getElementById("game_grid").style.backgroundColor = "black";
});

// This is layout function to change size of container.
function applyGridLayout(pairs) {
    const grid = document.getElementById("game_grid");
    const cards = document.querySelectorAll(".card");

    if (pairs === 3) {
        grid.style.width = "600px";
        grid.style.height = "400px"
        cards.forEach(card => card.style.width = "33.33%");
    } else if (pairs === 6) {
        grid.style.width = "800px";
        grid.style.height = "600px";
        cards.forEach(card => card.style.width = "25%");
    } else if (pairs === 10) {
        grid.style.width = "1000px";
        grid.style.height = "800px";
        cards.forEach(card => card.style.width = "20%");
    }
}

// This is powerup function to reveal all card for 5 second.
document.getElementById("powerup_button").addEventListener("click", () => {
    if (gameOver) return;
    document.getElementById("powerup_button").style.display = "none";
    document.querySelectorAll(".card").forEach(card => {
        card.classList.add("flip");
    });
    setTimeout(() => {
        document.querySelectorAll(".card").forEach(card => {
            if (!card.classList.contains("matched")) {
                card.classList.remove("flip");
            }
        });
    }, 5000);
});