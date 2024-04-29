const verseContainer = document.getElementById('verseContainer');
const verseInput = document.getElementById('verseInput');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const backgroundButton = document.getElementById('backgroundButton');

let currentIndex = 0;
let backgroundIndex = 0;
const backgrounds = [
    'background1.jpg',
    'background2.jpg',
    'background3.jpg'
];

// Replace 'bible.json' with the path to your Bible JSON file
fetch('bible.json')
    .then(response => response.json())
    .then(data => {
        const verses = data.verses;

        verseInput.addEventListener('input', () => {
            const searchTerm = verseInput.value.toLowerCase();
            const filteredVerses = verses.filter(verse => verse.text.toLowerCase().includes(searchTerm));
            displayVerses(filteredVerses);
        });

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                displayVerses([verses[currentIndex]]);
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < verses.length - 1) {
                currentIndex++;
                displayVerses([verses[currentIndex]]);
            }
        });

        backgroundButton.addEventListener('click', () => {
            document.body.style.backgroundImage = `url(${backgrounds[backgroundIndex]})`;
            backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
        });

        displayVerses(verses);
    });

function displayVerses(verses) {
    verseContainer.innerHTML = '';
    verses.forEach(verse => {
        const verseElement = document.createElement('div');
        verseElement.classList.add('verse');
        verseElement.innerHTML = `
            <p class="verse-reference">${verse.reference}</p>
            <p class="verse-text">${verse.text}</p>
        `;
        verseContainer.appendChild(verseElement);
    });
}
