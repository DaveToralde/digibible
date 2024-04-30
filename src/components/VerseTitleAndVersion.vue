<template>
  <div id="verseTitleTranslationContainer">
    <span class="verse-container" ref="verseTitleContainer">
      <span class="arrow left unselectable" v-on:click="onClickLeft()">◄</span>
      <span class="arrow right unselectable" v-on:click="onClickRight()">►</span>
      <span id="verseTitle" ref="verseTitle" v-on:click="onClickTitle" @blur="onBlurTitle" @keydown.enter="onEnterTitle"
        @keydown="handleKeyDown" @paste="onPasteVerseAddress">
        {{ verseDetails.title }}
      </span>
    </span>
    <div></div>
    <span id="verseVersion" ref="verseVersion" v-on:click="onClickVersion" @blur="onBlurVersion"
      @keydown="handleKeyDown">
      {{ verseDetails.version }}
    </span>
    <div id="versionsDropdown" ref="versionsDropdown" v-if="isDropdownVisible" class="dropdown-menu"
      @mouseenter="onHoverDropdown" @mouseleave="onLeaveDropdown">
      <ul>
        <li v-for="version in versions" :value="version.key" :key="version.key" @click="onSelectVersion(version)">
          {{ version.name }}
        </li>
      </ul>
    </div>
  </div>
</template>


<script>
import { mapState } from 'vuex';
import { uiMixin } from "@/mixins/uiMixin.js"
import { EventBus } from '@/utils/eventBus.js';
import BibleService from '@/services/BibleService.js'

export default {
  name: 'VerseTitleAndVersion',
  mixins: [uiMixin],
  props: ['verseDetails'],
  data: function () {
    return {
      isSelectingVersion: false,
      isDropdownVisible: false,
    }
  },
  created() {
    EventBus.$on('edit-verse-title', this.onClickTitle);
  },
  beforeDestroy() {
    EventBus.$off('edit-verse-title', this.onClickTitle);
  },
  mounted() {
    this.makeOtherRefEditable(this.$refs.verseTitleContainer, this.$refs.verseTitle)
    this.makeEditable(this.$refs.verseVersion)
  },
  computed: {
    ...mapState(['versions']),
  },
  watch: {
    verseDetails(value) {
      this.$refs.verseTitle.innerText = value.title
      this.$refs.verseTitle.blur()
      this.$refs.verseVersion.innerText = value.version
    }
  },
  methods: {
    onHoverDropdown() {
      this.isSelectingVersion = true
    },
    onLeaveDropdown() {
      this.isSelectingVersion = false
    },
    onSelectVersion(version) {
      this.isDropdownVisible = false;
      this.isSelectingVersion = false

      this.$store.dispatch('versionChanged', { version: version.key, isSync: false })
    },
    onClickTitle() {
      this.setEditMode(this.$refs.verseTitle, true)
    },
    onClickVersion() {
      let verseVersion = this.$refs.verseVersion
      verseVersion.setAttribute('tabindex', 0) // make sure it's focusable
      verseVersion.focus()
      this.isDropdownVisible = true

      this.$nextTick(() => {
        // Style the custom dropdown
        const verseVersion = this.$refs.verseVersion;
        const versionsDropdown = this.$refs.versionsDropdown;

        if (verseVersion && versionsDropdown) {
          const width = verseVersion.offsetWidth;
          const style = window.getComputedStyle(verseVersion);
          const marginLeft = style.marginLeft;
          const fontFamily = style.fontFamily;
          let fontSize = parseFloat(style.fontSize);
          fontSize = fontSize * 0.85; // Adjust the scaling factor as needed

          versionsDropdown.style.width = `${width}px`;
          versionsDropdown.style.marginLeft = marginLeft;
          versionsDropdown.style.fontSize = `${fontSize}px`; // Apply adjusted fontSize
          versionsDropdown.style.fontFamily = fontFamily; // Apply fontFamily
          versionsDropdown.style.fontStyle = "normal";
        }
      });
    },
    onBlurTitle() {
      this.setEditMode(this.$refs.verseTitle, false)
      this.$refs.verseTitle.innerText = this.verseDetails.title
    },
    onBlurVersion() {
      this.setEditMode(this.$refs.verseVersion, false)
      if (!this.isSelectingVersion) {
        // prevent hiding the dropdown before it gets clicked
        this.isDropdownVisible = false
      }
      this.$refs.verseVersion.innerText = this.verseDetails.version
    },
    onEnterTitle(event) {
      event.preventDefault()
      this.$store.dispatch('verseEnteredNoVersion', event.target.innerText)
      this.setEditMode(this.$refs.verseTitle, false)
    },
    onClickLeft() {
      this.$store.dispatch('showNextVerse', { isNextVerse: false, isSync: false })
    },
    onClickRight() {
      this.$store.dispatch('showNextVerse', { isNextVerse: true, isSync: false })
    },
    handleKeyDown(event) {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          event.stopPropagation()
          break
      }
    },
    onPasteVerseAddress(e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      const selection = window.getSelection();
      const range = selection.getRangeAt(0) || document.createRange();
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      if (text.match(BibleService.verseAddressRegex)) {
        this.$store.dispatch('verseEnteredNoVersion', text)
      }
    },
  }
}

</script>


<style>
#verseTitleTranslationContainer {
  position: relative;
  white-space: nowrap;
}

#verseTitle {
  color: white;
  text-transform: uppercase;
  font-size: clamp(0.1rem, 2.3vw + 2.3vh, 3.6rem);
}

.verse-container {
  position: relative;
  display: inline-block;
  /* Or 'block' depending on your layout */
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  color: rgba(255, 255, 255, 0.4);
  font-size: clamp(0.8rem, 0.7vw + 2.0vh, 1.5rem);
  border-radius: 15px;
  padding: 12px 16px;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.4);
}

.arrow:active {
  background-color: rgba(0, 0, 0, 0.5);
  /* Darker background on click */
}

.verse-container:hover .arrow {
  opacity: 1;
}

.left {
  left: 0;
  /* Aligns to the left edge of the container's padding */
  transform: translateX(-130%) translateY(-50%);
  /* Moves it fully outside and centers vertically */

}

.right {
  right: 0;
  /* Aligns to the right edge of the container's padding */
  transform: translateX(130%) translateY(-50%);
  /* Moves it fully outside and centers vertically */

}

.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

#verseVersion {
  color: yellow;
  display: inline-block;
  font-style: oblique;
  text-transform: uppercase;
  margin-bottom: 10px;
  margin-top: clamp(0.2rem, 0.6vw + 1.2vh, 0.8rem);
  font-size: clamp(0.1rem, 1.8vw + 1.8vh, 2.7rem);
  cursor: pointer;
}

#versionsDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
}

#versionsDropdown ul {
  list-style: none;
  padding: 12px;
  margin: 0;
  background: #f0f0f0;
  box-shadow: 0 2px 4px rgba(56, 56, 56, 0.1);
  border-radius: 16px;
  background-color: rgb(240, 240, 240);
  color: black;
}

#versionsDropdown li {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

#versionsDropdown li:hover {
  background-color: #e0e0e0;
  color: rgb(32, 32, 32);
}

#versionsDropdown li:active {
  background-color: #d0d0d0;
}
</style>
