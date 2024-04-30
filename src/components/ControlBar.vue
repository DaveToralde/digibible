<template>
    <div id="controlBar" style="display: flex; align-items: flex-end; justify-content: flex-start;">
        <button id="controlsToggle" @click="isControlBarVisible = !isControlBarVisible">
            »
        </button>
        <div id="controls">
            <input v-model="verseAddressInput" v-on:keyup.enter="onClickGo" v-on:keyup.up="showNextVerse(false)"
                v-on:keyup.down="showNextVerse(true)" v-on:keyup.page-up="showNextVerse(false)"
                v-on:keyup.page-down="showNextVerse(true)" id="verseInput" ref="verseInput"
                @paste="onPasteVerseAddress" />
            <select name="translation" id="translationInput" class="selector" v-model="controlVersion">
                <option v-for="version in versions" :value="version.key" :key="version.key">{{ version.name }}</option>
            </select>
            <a class="button" style="margin-right: 15px; width: 40px;" @click="onClickGo">Go</a>
            <span style="margin-right: 15px;">
                <a class="button" @click="showNextVerse(false)">&lt; Prev</a>
                <a class="button" @click="showNextVerse(true)">Next &gt;</a>
            </span>
            <span style="margin-right: 15px;">
                <a class="button" @click="increaseFontSize(false)">−</a>
                <a class="button" @click="increaseFontSize(true)">+</a>
            </span>
            <select id="bgSelector" class="selector" v-model="selectedBg">
                <option v-for="(value, key) in backgrounds" :value="value" v-bind:key="key">{{ key }}</option>
            </select>
            <input id="bgImgCustomUrlInput" v-model="bgImageCustomUrl" />
            <label id="addTextBgToggle" class="toggle">
                <input type="checkbox" v-model="isAddTextBg">
                <span class="labels" data-on="With Shade" data-off="No Shade"></span>
            </label>
            <span id="errorDisplay">
                {{ errorDisplay }}
            </span>
        </div>
    </div>
</template>

<script>
import BibleService from '@/services/BibleService.js'
import { EventBus } from '@/utils/eventBus.js';
import { mapState } from 'vuex';
import { utils } from '@/utils/utils.js'
import { backgroundService } from '../services/BackgroundService';

const BG_CUSTOM_URL = backgroundService.BG_CUSTOM_URL
const defaultBg = 'blue.jpg'

export { defaultBg }; // Workaround

export default {
    name: 'ControlBar',
    props: [''],
    data: function () {
        return {
            verseAddressInput: '',
            backgrounds: { // TODO: Move these to Vuex store and apply defaulting logic there to avoid bugs
                'Blue': defaultBg,
                'Brown': 'brown.jpg',
                'Orange': 'orange.jpg',
                'White': 'white.jpg',
                'Image URL': BG_CUSTOM_URL
            },
        }
    },
    created() {
        EventBus.$on('focus-controlbar-input', this.focusInput);
    },
    beforeDestroy() {
        EventBus.$off('focus-controlbar-input', this.focusInput);
    },
    mounted: function () {
        this.showCustomUrlInput(this.selectedBg == BG_CUSTOM_URL)

        if (this.selectedBg == BG_CUSTOM_URL && utils.isEmpty(this.bgImageCustomUrl)) {
            this.selectedBg = defaultBg
        }
    },
    computed: {
        ...mapState(['verseDetails', 'verseAddress', 'versions', 'errorDisplay', 'isControlBarVisible']),
        selectedBg: {
            get() {
                return this.$store.state.selectedBg
            },
            set(value) {
                this.$store.dispatch('setSelectedBg', value)
            }
        },
        bgImageCustomUrl: {
            get() {
                return this.$store.state.bgImageCustomUrl
            },
            set(value) {
                this.$store.dispatch('setBgImageCustomUrl', value)
            }
        },
        isAddTextBg: {
            get() {
                return this.$store.state.isAddTextBg
            },
            set(value) {
                this.$store.dispatch('setIsAddTextBg', value)
            }
        },
        controlVersion: {
            get() {
                return this.$store.state.controlVersion
            },
            set(value) {
                this.$store.dispatch('controlVersionChanged', value)
            }
        },
        isControlBarVisible: {
            get() {
                return this.$store.state.isControlBarVisible
            },
            set(value) {
                this.$store.dispatch('updateIsControlBarVisible', value)
            }
        },
    },
    watch: {
        controlVersion: function (newVal, oldVal) {
            if (utils.isNotEmpty(oldVal)) {
                this.$store.dispatch('versionChanged', { version: newVal })
            }
        },
        selectedBg: function (newVal) {
            this.showCustomUrlInput(newVal == BG_CUSTOM_URL)
            if (utils.isEmpty(newVal)) {
                this.selectedBg = defaultBg
            }
            if (this.selectedBg == BG_CUSTOM_URL) {
                document.getElementById('addTextBgToggle').style.display = 'inline-block'
            } else {
                document.getElementById('addTextBgToggle').style.display = 'none'
            }
        },
        errorDisplay: function (newVal) {
            let display = document.getElementById("errorDisplay")
            if (utils.isNotEmpty(newVal)) {
                display.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
                display.style.borderRadius = '5px';
                display.style.padding = '1px 8px';
            } else {
                display.style.backgroundColor = ''
            }
        },
        isControlBarVisible: function (isVisible) {
            var controls = document.getElementById('controls');
            var toggleButton = document.getElementById('controlsToggle');
            toggleButton.style.transition = "transform 0.3s ease";

            if (isVisible) {
                controls.style.display = ''; // Reset display to default or block if necessary
                setTimeout(function () { // Delay to allow display change to render
                    controls.classList.remove('controls-hidden');
                    toggleButton.style.transform = 'rotateY(0deg)';
                    toggleButton.style.color = 'rgba(255, 255, 255, 0.8)';
                }, 10); // Short delay to re-enable transitions if display was none
            } else {
                controls.classList.add('controls-hidden');
                toggleButton.style.transform = 'rotateY(180deg)';
                toggleButton.style.color = 'rgba(255, 255, 255, 0.4)';
                setTimeout(function () {
                    controls.style.display = 'none'; // Apply display none after transitions
                }, 300); // Delay to match transition duration
            }
        }

    },
    methods: {
        onClickGo() {
            this.$store.dispatch('verseEntered', { verseInput: this.verseAddressInput, version: this.controlVersion })
        },
        onPasteVerseAddress(event) {
            let pasted = event.clipboardData.getData('text')
            if (pasted.match(BibleService.verseAddressRegex)) {
                this.$store.dispatch('verseEntered', { verseInput: pasted, version: this.controlVersion })
            }
        },
        increaseFontSize(isIncrease) {
            this.$store.dispatch('increaseFontSize', isIncrease)
        },
        focusInput() {
            let verseInput = this.$refs.verseInput
            verseInput.focus()
            verseInput.select()
        },
        showNextVerse(isNextVerse) {
            this.$store.dispatch('showNextVerse', { isNextVerse: isNextVerse })
        },
        showCustomUrlInput(isShow) {
            const bgImgCustomUrlInput = document.getElementById('bgImgCustomUrlInput')

            if (isShow) {
                bgImgCustomUrlInput.style.display = 'inline'
            } else {
                bgImgCustomUrlInput.style.display = 'none'
            }
        },
    }
}
</script>


<style>
#controlBar {
    padding: 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}

#controls {
    transition: transform 0.3s ease;
}

.controls-hidden {
    transform: translateY(150%);
}

#controlsToggle {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    height: 33px;
    width: 33px;
    font-size: 30px;
    rotate: 90deg;
}

.button {
    background-color: #e7e7e7;
    /* Gray */
    color: black;
    border: none;
    padding: 5px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 12px;
    border-radius: 2px;
    margin: 1px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    cursor: pointer;
    user-select: none;
    font-weight: bold;
}


input {
    margin: 1px;
    display: inline-block;
    font-size: 12px;
    border-radius: 2px;
    padding: 5px 15px;
    font-weight: bold;
}

#verseInput {
    width: 100px;
}

.selector {
    display: inline-block;
    font-size: 11px;
    border-radius: 2px;
    padding: 5px 5px;
    font-weight: bold;
    text-transform: uppercase;
    background-color: rgb(226, 226, 226);
}

#translationInput {
    width: 150px;
}

.button:hover {
    background-color: #b4b4b4
}

.button:active {
    background-color: #919191;
}

#bgImgCustomUrlInput {
    width: 100px;
}

/* START Toggle */

.toggle {
    --width: 80px;
    --height: calc(var(--width) / 3.3);

    position: relative;
    display: inline-block;
    width: var(--width);
    height: var(--height);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    margin-bottom: -8px;
    font-weight: bold;
    margin-left: 3px;
}

.toggle input {
    display: none;
}

.toggle .labels {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-size: 12px;
    font-family: sans-serif;
    transition: all 0.4s ease-in-out;
    overflow: hidden;
}

.toggle .labels::after {
    content: attr(data-off);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    color: #4d4d4d;
    background-color: rgb(226, 226, 226);
    transition: all 0.1s ease-in-out;
}

.toggle .labels::before {
    content: attr(data-on);
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: calc(var(--width) * -1);
    height: 100%;
    width: 100%;
    color: #ffffff;
    background-color: #585858;
    text-align: center;
    transition: all 0.1s ease-in-out;
}

.toggle input:checked~.labels::after {
    transform: translateX(var(--width));
}

.toggle input:checked~.labels::before {
    transform: translateX(var(--width));
}

#errorDisplay {
    color: rgb(255, 65, 65);
    margin-left: 10px;
    font-weight: bold;
}

/* END Toggle */
</style>
