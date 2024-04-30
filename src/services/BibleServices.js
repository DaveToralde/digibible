import axios from 'axios'
import { utils } from '@/utils/utils.js'

const baseUrl = `${process.env.BASE_URL}verses`
const versionsFilename = 'versions.json'
const sourceFileExt = '.json'
const bookNamesFilename = 'books.json'

const versions = 'versions'
const versionList = 'versionList'

const maxBookCount = 66
const MAX_VERSE_CHAPTER_INDICATOR = -1

const verseAddressRegex =
    ("(?:([iI]{1,3}|\\d+)\\s+)?" // number before book
        + "([a-zA-Z]+(?: [a-zA-Z]+)*)" // book
        + "\\s+"      // space after book
        + "(\\d+)"  // chapter
        + "(?:\\.|:|\\s+)" // chapter-verse separator
        + "(\\d+)") // verse


class BibleService {
    static instance = null

    currentVerseAddress = {}
    defaultBibleVersionKey = 'adb'

    bible = { // here's a sample data for reference
        versionList: [],
        versions: [
            {
                name: 'Ang Dating Biblia',
                key: 'adb',
                bookNames: ['Genesis', 'Exodo'],
                content: {
                    '1': { // Book
                        '1': { // Chapter
                            '1': 'Nang pasimula' // Verse
                        }
                    }
                }
            }
        ],
    }

    constructor() {
        if (!BibleService.instance) {
            BibleService.instance = this
        }
        this.bible = {}
        this.verseAddressRegex = verseAddressRegex
        return BibleService.instance
    }

    async init() {
        this.bible[versionList] = await this.loadBibleVersions()
    }

    async loadBibleVersions() {
        let fetchUrl = `${baseUrl}/${versionsFilename}`
        let bibleVersions = await this.fetch(fetchUrl)

        if (utils.isEmptyObject(this.bible)) {
            this.bible[versions] = utils.cloneObjArray(bibleVersions)
        }

        return bibleVersions
    }

    async parseVerseInput(verseInput, bibleVersionKey) {
        let matchGroups = verseInput.match(verseAddressRegex)

        if (!matchGroups) {
            throw 'Invalid input'
        }

        let bookInput = matchGroups[2]

        // special shorthand
        if (bookInput.toLowerCase() == 'jn') {
            bookInput = "juan"
        }

        if (matchGroups[1]) { // Number before book e.g. the "2" in "2 Hari"
            bookInput = matchGroups[1] + ' ' + bookInput
        }

        let bookMatch = await this.findBookMatch(bookInput, bibleVersionKey)

        return this.createVerseAddress(
            bibleVersionKey,
            bookMatch,
            matchGroups[3] + '',
            matchGroups[4] + ''
        )
    }
    createVerseAddress(version, book, chapter, verse) {
        return {
            'version': version,
            'book': book,
            'chapter': chapter,
            'verse': verse
        }
    }
    getBibleVersion(bibleVersionKey) {
        for (const vIndex in this.bible.versions) {
            let version = this.bible.versions[vIndex]

            if (version.key == bibleVersionKey) {
                return version
            }
        }
        return {}
    }
    async loadBookNames(bibleVersion) {
        if (utils.isEmpty(bibleVersion.bookNames)) {
            // Fetch book names for requested bible version
            let fetchUrl = `${baseUrl}/${bibleVersion.key}/${bookNamesFilename}`
            bibleVersion.bookNames = await this.fetch(fetchUrl)
        }
    }
    async findBookMatch(bookName, bibleVersionKey) {
        try {
            return await this.findBookMatchInVersion(bookName, bibleVersionKey)
        } catch (error) {
            // Find book in all other versions
            for (let versionIndex in this.bible.versions) {
                try {
                    let versionKey = this.bible.versions[versionIndex].key
                    if (bibleVersionKey != versionKey) { // Skip the version that's tried first already
                        return await this.findBookMatchInVersion(bookName, versionKey)
                    }
                } catch {
                    // do nothing
                }
            }
            throw `Book not found: ${bookName}` // TODO: Add hint for possible matches, or apply if has match close enough

        }
    }
    async findBookMatchInVersion(bookName, bibleVersionKey) {
        let bookMatches = []

        let bibleVersion = this.getBibleVersion(bibleVersionKey)
        await this.loadBookNames(bibleVersion)

        for (let i = 0; i < bibleVersion.bookNames.length; i++) {
            if (bibleVersion.bookNames[i].substring(0, bookName.length).toLowerCase() == bookName.toLowerCase()) {
                bookMatches.push(i)
            }
        }

        if (bookMatches.length == 1) {
            return bookMatches[0] + 1 // offset of 1 since book number starts with 1
        } else if (bookMatches.length == 2) {
            let match1 = bibleVersion.bookNames[bookMatches[0]]
            let match2 = bibleVersion.bookNames[bookMatches[1]]
            if (utils.isSubstringOfOther(match1, match2)) {
                return 1 + (match1.length < match2.length ? bookMatches[0] : bookMatches[1])
            } else {
                return bookMatches[0] + 1 // return the first match
            }
        } else if (bookMatches.length > 2) {
            return bookMatches[0] + 1 // return the first match
        } else {
            throw 'Book not found'
        }
    }
    async isValidVerseAddress(verseAddress) {
        if (utils.isEmptyObject(verseAddress)) {
            return false
        }
        try {
            await this.fetchVerse(verseAddress)
            return true
        } catch (error) {
            return false
        }
    }
    async fetchVerse(verseAddress) {
        let bibleVersion = this.getBibleVersion(verseAddress.version)

        // If bible version is not initialized yet
        if (utils.isEmpty(bibleVersion.content)) {
            bibleVersion.content = {}
        }

        // Make sure booknames are loaded
        await this.loadBookNames(bibleVersion)

        // If book is not loaded yet
        if (utils.isEmpty(bibleVersion.content[verseAddress.book])) {
            // load and cache the fetched book content
            let fetchUrl = `${baseUrl}/${bibleVersion.key}/${verseAddress.book}${sourceFileExt}`
            bibleVersion.content[verseAddress.book] = await this.fetch(fetchUrl)
        }

        // fetch and Return verse info
        let verseInfo = this.getVerseInfo(verseAddress)
        this.currentVerseAddress = verseAddress // take note of the validated verse address

        return verseInfo
    }
    getDiffVersionVerseAddress(bibleVersionKey) {
        let diffVersionVerseAddress = this.currentVerseAddress
        diffVersionVerseAddress.version = bibleVersionKey

        return diffVersionVerseAddress
    }
    getVerseInfo(verseAddress) {
        let bibleVersion = this.getBibleVersion(verseAddress.version)
        let bookContent = bibleVersion.content[verseAddress.book]


        // MAX_VERSE_CHAPTER_INDICATOR is set as value of chapter/verse when next/previous button is tapped and bounds are reached
        if (verseAddress.chapter == MAX_VERSE_CHAPTER_INDICATOR) {
            verseAddress.chapter = Object.keys(bookContent).length
        }

        let chapterContent = bookContent[verseAddress.chapter]
        if (utils.isEmpty(chapterContent)) {
            throw new Error('Chapter not found: ' + verseAddress.chapter)
        }

        if (verseAddress.verse == MAX_VERSE_CHAPTER_INDICATOR) {
            verseAddress.verse = Object.keys(chapterContent).length
        }


        let verseContent = chapterContent[verseAddress.verse]
        if (utils.isEmpty(verseContent)) {
            throw new Error('Verse not found: ' + verseAddress.verse)
        }

        // verse address is validated
        let verseInfo = {
            'title': bibleVersion.bookNames[verseAddress.book - 1] + ' ' + verseAddress.chapter + ':' + verseAddress.verse,
            'content': verseContent,
            'version': bibleVersion.name
        }
        return verseInfo
    }
    getNextVerseAddress(isNextVerse) {
        let version = this.currentVerseAddress.version
        let book = this.currentVerseAddress.book
        let chapter = this.currentVerseAddress.chapter
        let verse = this.currentVerseAddress.verse

        if (isNextVerse) {
            verse++
        } else {
            verse--
        }

        let bibleVersion = this.getBibleVersion(version)

        // if reached the end of the chapter
        if (verse > Object.keys(bibleVersion.content[book][chapter]).length) {
            chapter++
            verse = 1
        } else if (verse < 1) { // if at start of chapter
            chapter--
            verse = MAX_VERSE_CHAPTER_INDICATOR
        }

        // if reached the end of the book
        if (chapter > Object.keys(bibleVersion.content[book]).length) {
            book++
            chapter = 1
        } else if (chapter < 1) {
            book--
            chapter = MAX_VERSE_CHAPTER_INDICATOR
        }

        // if reached end of the bible
        if (book > maxBookCount) {
            book = 1
        } else if (book < 1) {
            book = maxBookCount
        }

        return this.createVerseAddress(
            version,
            book,
            chapter,
            verse
        )
    }

    loadVerseParamQuery() {
        var url = new URL(window.location.href);
        let verseParam = url.searchParams.get('v')
        if (verseParam) {
            this.verseAddressInput = verseParam
        }

        this.processVerseInput(this.verseAddressInput)
        this.focusInput()
    }

    async fetch(resourceUrl) {
        try {
            const response = await axios.get(resourceUrl);
            return response.data;
        } catch (error) {
            console.error('There was an error fetching a resource:', error);
            throw new Error("An error occurred")
        }
    }

    increaseFontSize(isIncrease) {
        this.verseFontSize += (3 * (isIncrease ? 1 : -1))
    }
}

export default new BibleService()
