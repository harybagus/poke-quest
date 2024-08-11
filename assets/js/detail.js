let currentPokemonID = null;

document.addEventListener("DOMContentLoaded", () => {
    const maxPokemon = 300;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > maxPokemon) {
        return (window.location.href = "./index.html");
    }

    currentPokemonID = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((response) => response.json()),

            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((response) => response.json()),
        ]);

        const abilitiesWrapper = document.querySelector(".pokemon-about-wrap .pokemon-about.abilities");
        abilitiesWrapper.innerHTML = "";

        if (currentPokemonID === id) {
            displayPokemonDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".pokemon-description").textContent = flavorText;

            const [arrowLeft, arrowRight] = ["#arrow-left", "#arrow-right"].map((sel) =>
                document.querySelector(sel)
            );

            arrowLeft.removeEventListener("click", navigatePokemon);
            arrowRight.removeEventListener("click", navigatePokemon);

            if (id !== 1) {
                arrowLeft.addEventListener("click", () => {
                    navigatePokemon(id - 1);
                });
            }

            if (id !== 300) {
                arrowRight.addEventListener("click", () => {
                    navigatePokemon(id + 1);
                });
            }

            if (id === 1) {
                document.querySelector("#arrow-left").classList.add("d-none");
            } else {
                document.querySelector("#arrow-left").classList.remove("d-none");
            }

            if (id === 300) {
                document.querySelector("#arrow-right").classList.add("d-none");
            } else {
                document.querySelector("#arrow-right").classList.remove("d-none");
            }

            window.history.pushState({}, "", `./detail.html?id=${id}`);
        }

        return true;
    } catch (error) {
        console.error("An error occured while fetching Pokemon data:", error);
        return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonID = id;
    await loadPokemon(id);
}

const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    dark: "#EE99AC",
};

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1, 3), 16),
        parseInt(hexColor.slice(3, 5), 16),
        parseInt(hexColor.slice(5, 7), 16),
    ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const color = typeColors[mainType];

    if (!color) {
        console.warn(`Color not defined for type: ${mainType}`);
        return;
    }

    const body = document.querySelector("body");
    setElementStyles([body], "backgroundColor", color);

    setElementStyles(document.querySelectorAll("#types-wrapper > div"), "backgroundColor", color);
    setElementStyles(document.querySelectorAll(".pokemon-about-wrap p.abouts"), "color", color);
    setElementStyles(document.querySelectorAll(".stats-wrapper p.stats"), "color", color);
    setElementStyles(document.querySelectorAll(".stats-wrap .progress-bar"), "color", color);

    const rgbaColor = rgbaFromHex(color);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
        .stats-wrap .progress-bar::-webkit-progress-bar {
            background-color: rgba(${rgbaColor}, 0.5);
        }

        .stats-wrap .progress-bar::-webkit-progress-value {
            background-color: ${color};
        }
    `;

    document.head.appendChild(styleTag);
}

function capitalizeFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);

    Object.keys(options).forEach((key) => {
        element[key] = options[key];
    });

    parent.appendChild(element);

    return element;
}

function displayPokemonDetails(pokemon) {
    const { name, id, types, weight, height, abilities, stats } = pokemon;
    const capitalizePokemonName = capitalizeFirstLetter(name);

    document.querySelector("title").textContent = `${capitalizePokemonName} - PokéQuest`;
    document.querySelector("#header-name h4").textContent = capitalizePokemonName;
    document.querySelector("#header-id h4").textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    imageElement.alt = name;

    const typesWrapper = document.querySelector("#types-wrapper");
    typesWrapper.innerHTML = "";
    types.forEach(({ type }) => {
        createAndAppendElement(typesWrapper, "div", {
            className: "d-inline mx-1 px-3 py-1 rounded-5 text-white fw-medium",
            textContent: capitalizeFirstLetter(type.name),
        });
    });

    document.querySelector(".pokemon-about .weight").textContent = `${weight / 10} kg`;
    document.querySelector(".pokemon-about .height").textContent = `${height / 10} m`;

    const abilitiesWrapper = document.querySelector(".pokemon-about-wrap .pokemon-about.abilities");
    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, "p", {
            textContent: capitalizeFirstLetter(ability.name),
        });
    });

    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "";

    const statNameMapping = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD",
    };

    stats.forEach(({ stat, base_stat }) => {
        const statsWrap = document.createElement("div");
        statsWrap.className = "stats-wrap row gx-2"
        statsWrapper.appendChild(statsWrap);

        const statsText = document.createElement("div");
        statsText.className = "stats-text col-4 col-lg-3 d-inline";
        statsWrap.appendChild(statsText);

        const statsProgress = document.createElement("div");
        statsProgress.className = "stats-progress col-8 col-lg-9 d-inline";
        statsWrap.appendChild(statsProgress);

        createAndAppendElement(statsText, "p", {
            className: "stats caption-fonts fw-semibold d-inline",
            textContent: statNameMapping[stat.name],
        });

        createAndAppendElement(statsText, "div", {
            className: "border-right mx-2 d-inline",
        });

        createAndAppendElement(statsText, "p", {
            className: "base-stats caption-fonts d-inline-block",
            textContent: String(base_stat).padStart(3, "0"),
        });

        createAndAppendElement(statsProgress, "progress", {
            className: "progress-bar ms-1 d-inline",
            value: base_stat,
            max: 100,
        });
    });

    setTypeBackgroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries) {
        if (entry.language.name === "en") {
            let flavor = entry.flavor_text.replace(/\f/g, " ");
            return flavor;
        }
    }

    return "";
}