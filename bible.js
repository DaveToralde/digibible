const verseContainer = document.getElementById('verseContainer');
const searchInput = document.getElementById('searchInput');

// Replace 'bible.json' with the path to your Bible JSON file
fetch('bible.json')
    .then(response => response.json())
    .then(data => {
        const verses = data.verses;

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredVerses = verses.filter(verse => verse.text.toLowerCase().includes(searchTerm));
            displayVerses(filteredVerses);
        });

        displayVerses(verses);
    });

function displayVerses(verses) {
    verseContainer.innerHTML = '';
    verses.forEach(verse => {
        const verseElement = document.createElement('div');
        verseElement.classList.add('verse');
        verseElement.innerHTML = `<strong>${verse.reference}</strong> ${verse.text}`;
        verseContainer.appendChild(verseElement);
    });
}
