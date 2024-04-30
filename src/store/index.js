import Vue from 'vue';
import Vuex from 'vuex';

import BibleService from '@/services/BibleService.js'
import { storageManager } from '@/utils/storageManager.js'


// Tell Vue to use Vuex
Vue.use(Vuex);


// TODO: Break down into modules
export default new Vuex.Store({

    state: {
        verseDetails: {
            'title': '',
            'version': '',
            'content': ''
        },
        verseAddress: {},
        controlVersion: '',
        verseFontSize: 0.0,
        versions: [],
        isAddTextBg: false,
        selectedBg: '',
        bgImageCustomUrl: null,
        errorDisplay: '',
        isControlBarVisible: true,
        syncVerse: true,
        syncVersion: true,
    },
    mutations: {
        setVerseDetails(state, details) {
            state.verseDetails = details
        },
        setVerseAddress(state, verseAddress) {
            state.verseAddress = verseAddress
        },
        setVerseFontSize(state, size) {
            state.verseFontSize = size
        },
        setVersions(state, versions) {
            state.versions = versions
        },
        setControlVersion(state, controlVersion) {
            state.controlVersion = controlVersion
        },
        setIsAddTextBg(state, isAddTextBg) {
            state.isAddTextBg = isAddTextBg
        },
        setSelectedBg(state, selectedBg) {
            state.selectedBg = selectedBg
        },
        setBgImageCustomUrl(state, bgImageCustomUrl) {
            state.bgImageCustomUrl = bgImageCustomUrl
        },
        setErrorDisplay(state, errorDisplay) {
            state.errorDisplay = errorDisplay
        },
        setSyncVerse(state, syncVerse) {
            state.syncVerse = syncVerse
        },
        setSyncVersion(state, syncVersion) {
            state.syncVersion = syncVersion
        },
        setIsControlBarVisible(state, isControlBarVisible) {
            state.isControlBarVisible = isControlBarVisible
        },
    },
    actions: {
        initStore({ commit, dispatch }) {
            BibleService.init().then(() => {
                let versionList = BibleService.bible.versionList
                commit('setVersions', versionList)

                dispatch('loadStateFromStorage', true);
            })

        },
        loadBibleVersions({ commit }) {
            BibleService.init().then(() => {
                commit('setVersions', BibleService.bible.versionList)
            })
        },
        async verseEntered({ dispatch }, { verseInput, version }) {
            try {
                let verseAddress = await BibleService.parseVerseInput(verseInput, version)
                dispatch('fetchVerseDetails', verseAddress)
                dispatch('updateErrorDisplay', '') // clear error message
            } catch (error) {
                dispatch('updateErrorDisplay', error)
            }
        },
        async verseEnteredNoVersion({ commit, getters, dispatch }, verseInput) {
            let verseAddress = getters.verseAddress
            commit('setSyncVerse', false)
            dispatch('verseEntered', { verseInput: verseInput, version: verseAddress.version })
        },
        async versionChanged({ commit, dispatch }, { version, isSync = true }) {
            commit('setSyncVerse', isSync)

            let verseAddress = BibleService.getDiffVersionVerseAddress(version)
            dispatch('fetchVerseDetails', verseAddress)
        },
        async controlVersionChanged({ commit, dispatch }, version) {
            commit('setControlVersion', version)

            let verseAddress = BibleService.getDiffVersionVerseAddress(version)
            dispatch('fetchVerseDetails', verseAddress)
        },
        async showNextVerse({ commit, dispatch }, { isNextVerse, isSync = true }) {
            commit('setSyncVerse', isSync)

            let nextVerseAddress = await BibleService.getNextVerseAddress(isNextVerse)
            dispatch('fetchVerseDetails', nextVerseAddress)
        },
        async fetchVerseDetails({ commit, dispatch, getters }, verseAddress) {
            let verseDetails
            try {
                verseDetails = await BibleService.fetchVerse(verseAddress)

                commit('setVerseAddress', verseAddress)
                commit('setVerseDetails', verseDetails)
                dispatch('updateErrorDisplay', '') // clear error message
            } catch (error) {
                dispatch('updateErrorDisplay', error.message)
            }
            if (getters.syncVerse) {
                storageManager.saveVerseToLocalStorage(verseAddress)
            }
            commit('setSyncVerse', true)
        },
        increaseFontSize({ commit, getters }, isIncrease) {
            let newFontSize = getters.verseFontSize + 0.2 * (isIncrease ? 1 : -1)

            commit('setVerseFontSize', newFontSize)
            storageManager.saveFontSizeToLocalStorage(newFontSize)
        },
        setIsAddTextBg({ commit }, isAddTextBg) {
            storageManager.saveTextBgToLocalStorage(isAddTextBg)
            commit('setIsAddTextBg', isAddTextBg)
        },
        setSelectedBg({ commit }, selectedBg) {
            storageManager.saveBgImageToLocalStorage(selectedBg)
            commit('setSelectedBg', selectedBg)
        },
        setBgImageCustomUrl({ commit }, bgImageCustomUrl) {
            commit('setBgImageCustomUrl', bgImageCustomUrl)
        },
        saveBgImageCustomUrl(context, bgImageCustomUrl) {
            storageManager.saveBgImageCustomUrlToLocalStorage(bgImageCustomUrl)
        },
        async loadStateFromStorage({ commit, dispatch }, isLoadFromInit = false) { // TODO: Merge with loadBgFromStorage
            let savedState = storageManager.loadState()
            let verseAddress = savedState.verseAddress

            let isVerseAddressValid = await BibleService.isValidVerseAddress(savedState.verseAddress)

            if (isVerseAddressValid) {
                dispatch('fetchVerseDetails', verseAddress)
                commit('setControlVersion', verseAddress.version)
            } else {
                // Default verse and version
                dispatch('verseEntered', { verseInput: "Gen 1:1", version: this.getters.versions[0].key })
                commit('setControlVersion', this.getters.versions[0].key)
            }

            if (isLoadFromInit) {
                // Always use default font size on init
                commit('setVerseFontSize', 0.0)
                storageManager.saveFontSizeToLocalStorage(0.0)
            } else {
                commit('setVerseFontSize', parseFloat(savedState.verseFontSize))
            }
        },
        loadBgFromStorage({ commit }) {
            let savedState = storageManager.loadState()

            commit('setIsAddTextBg', savedState.isAddTextBg)
            commit('setSelectedBg', savedState.selectedBg)
            commit('setBgImageCustomUrl', savedState.bgCustomImgUrl)
        },
        updateErrorDisplay({ commit }, errorMessage) {
            commit('setErrorDisplay', errorMessage)
        },
        updateIsControlBarVisible({ commit }, value) {
            commit('setIsControlBarVisible', value)
        }
    },
    getters: {
        verseDetails: state => state.verseDetails,
        verseFontSize: state => state.verseFontSize,
        versions: state => state.versions,
        controlVersion: state => state.controlVersion,
        verseAddress: state => state.verseAddress,
        isAddTextBg: state => state.isAddTextBg,
        selectedBg: state => state.selectedBg,
        syncVerse: state => state.syncVerse,
        syncVersion: state => state.syncVersion,
        isControlBarVisible: state => state.isControlBarVisible,
    },
})
