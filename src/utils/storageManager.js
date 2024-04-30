import { utils } from '@/utils/utils.js'


const KEY_VERSE_ADDRESS = "KEY_VERSE_ADDRESS"
const KEY_VERSE_FONT_SIZE = "KEY_VERSE_FONT_SIZE"
const KEY_IS_ADD_TEXT_BG = "KEY_IS_ADD_TEXT_BG"
const KEY_BG_IMAGE = "KEY_BG_IMAGE"
const KEY_BG_IMAGE_CUSTOM_URL = "KEY_BG_IMAGE_CUSTOM_URL"

export const storageManager = {

    saveVerseToLocalStorage: function (verseAddress) {
        localStorage.setItem(KEY_VERSE_ADDRESS, JSON.stringify(verseAddress))
    },
    saveFontSizeToLocalStorage: function (fontSize) {
        localStorage.setItem(KEY_VERSE_FONT_SIZE, fontSize)
    },
    saveTextBgToLocalStorage: function (isAddTextBg) {
        localStorage.setItem(KEY_IS_ADD_TEXT_BG, isAddTextBg)
    },
    saveBgImageToLocalStorage: function (bgImage) {
        localStorage.setItem(KEY_BG_IMAGE, bgImage)
    },
    saveBgImageCustomUrlToLocalStorage: function (bgCustomUrl) {
        localStorage.setItem(KEY_BG_IMAGE_CUSTOM_URL, bgCustomUrl)
    },
    loadState: function () {
        return {
            'verseAddress': utils.parseJson(localStorage.getItem(KEY_VERSE_ADDRESS)),
            'verseFontSize': parseFloat(localStorage.getItem(KEY_VERSE_FONT_SIZE)) || 0.0,
            'isAddTextBg': localStorage.getItem(KEY_IS_ADD_TEXT_BG) == 'true',
            'bgCustomImgUrl': localStorage.getItem(KEY_BG_IMAGE_CUSTOM_URL),
            'selectedBg': localStorage.getItem(KEY_BG_IMAGE)
        }
    }

}
