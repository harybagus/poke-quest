const inputElement = document.querySelector(".search-input");
const closeIcon = document.querySelector(".search-close-icon");
const sortWrapper = document.querySelector(".sort-wrapper");
const filterWrapper = document.querySelector(".filter-wrapper");

inputElement.addEventListener("input", () => {
    handleInputChange(inputElement);
});

function handleInputChange(inputElement) {
    const inputValue = inputElement.value;

    if (inputValue !== "") {
        closeIcon.classList.remove("d-none");
    } else {
        closeIcon.classList.add("d-none");
    }
}

sortWrapper.addEventListener("click", handleSortIconOnClick);

function handleSortIconOnClick() {
    filterWrapper.classList.toggle("d-none");
}