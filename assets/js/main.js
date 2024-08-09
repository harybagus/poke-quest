let pokemonOffset = 0;
const pokemonLimit = 30;
let currentPage = 1;

const searchInput = document.querySelector(".search-input");
const searchCloseIcon = document.querySelector(".search-close-icon");
const nameFilter = document.querySelector("#name");
const numberFilter = document.querySelector("#number");

const listWrapper = document.querySelector(".list-wrapper");
const notFoundMessage = document.querySelector("#not-found-message");

const pagination = document.querySelector("#pagination");
const nextButton = document.querySelector("#btn-next");
const pokePage = document.querySelector("#poke-page");
const previousButton = document.querySelector("#btn-previous");

let allPokemons = [];

function fetchPokemon(pokemonOffset) {
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${pokemonOffset}&limit=${pokemonLimit}`)
        .then((response) => response.json())
        .then((data) => {
            allPokemons = data.results;
            displayPokemons(allPokemons);
        });
}

fetchPokemon(pokemonOffset);

async function fetchPokemonDataBeforeRedirect(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((response) => response.json()),

            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((response) => response.json()),
        ]);

        return true;
    } catch (error) {
        console.error("Failed to fetch Pokemon data before redirect");
    }
}

function capitalizeFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function displayPokemons(pokemon) {
    listWrapper.innerHTML = "";

    pokemon.forEach((pokemon) => {
        const pokemonID = pokemon.url.split("/")[6];
        const listItem = document.createElement("div");
        const pokemonName = capitalizeFirstLetter(pokemon.name);

        listItem.className = "col-6 col-sm-4 col-md-3 col-lg-2 list-item"

        listItem.innerHTML = `
            <div class="card-custom rounded-3 shadow">
                <div class="card-custom-number">#${pokemonID.padStart(3, "0")}</div>

                <div class="card-custom-image">
                    <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemonName}">
                </div>

                <div class="card-custom-name">${pokemonName}</div>
            </div>
        `;

        listItem.addEventListener("click", async () => {
            const success = await fetchPokemonDataBeforeRedirect(pokemonID);

            if (success) {
                window.location.href = `./detail.html?id=${pokemonID}`;
            }
        });

        listWrapper.appendChild(listItem);
    });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredPokemons;

    if (nameFilter.checked) {
        filteredPokemons = allPokemons.filter((pokemon) =>
            pokemon.name.toLowerCase().startsWith(searchTerm)
        );
    } else if (numberFilter.checked) {
        filteredPokemons = allPokemons.filter((pokemon) => {
            const pokemonID = pokemon.url.split("/")[6];
            return pokemonID.startsWith(searchTerm);
        });
    } else {
        filteredPokemons = allPokemons;
    }

    displayPokemons(filteredPokemons);

    if (filteredPokemons.length === 0) {
        notFoundMessage.classList.remove("d-none");
    } else {
        notFoundMessage.classList.add("d-none");
    }

    if (searchInput.value !== "") {
        pagination.classList.add("d-none");
    } else {
        pagination.classList.remove("d-none");
    }
}

searchCloseIcon.addEventListener("click", clearSearch);

function clearSearch() {
    searchInput.value = "";
    searchCloseIcon.classList.add("d-none");
    displayPokemons(allPokemons);
    notFoundMessage.classList.add("d-none");
    pagination.classList.remove("d-none");
}

pokePage.innerHTML = `Halaman ${currentPage} dari 10`;

nextButton.addEventListener("click", handleNextButtonOnClick);
previousButton.addEventListener("click", handlePreviousButtonOnClick);

function handleNextButtonOnClick() {
    currentPage += 1;
    pokePage.innerHTML = `Halaman ${currentPage} dari 10`;

    pokemonOffset += 30;
    fetchPokemon(pokemonOffset);

    previousButton.classList.remove("d-none");

    if (currentPage === 10) {
        nextButton.classList.add("d-none");
    }
}

function handlePreviousButtonOnClick() {
    currentPage -= 1;
    pokePage.innerHTML = `Halaman ${currentPage} dari 10`;

    pokemonOffset -= 30;
    fetchPokemon(pokemonOffset);

    if (currentPage < 10) {
        nextButton.classList.remove("d-none");
    }

    if (currentPage === 1) {
        previousButton.classList.add("d-none");
    }
}