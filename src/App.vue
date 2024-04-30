<template>
  <div id="app">
    <div id="baseDiv" @contextmenu="rightClickHandler($event)">
      <CustomBackground />
      <VerseDisplay @focus-controlbar-input="focusInput" />
      <ControlBar />
    </div>
  </div>
</template>

<script>

import CustomBackground from '@/components/CustomBackground.vue'
import VerseDisplay from '@/components/VerseDisplay.vue'
import ControlBar from '@/components/ControlBar.vue'

import { EventBus } from '@/utils/eventBus.js';

export default {
  name: 'App',
  components: {
    CustomBackground,
    VerseDisplay,
    ControlBar
  },
  mounted: function () {
    const handleStorageEvent = () => {
      const { dispatch } = this.$store;
      dispatch('loadStateFromStorage');
      dispatch('loadBgFromStorage');
    }
    this.$store.dispatch('loadBgFromStorage')

    window.addEventListener('storage', handleStorageEvent);

    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('storage', handleStorageEvent);
    })

    // TODO: Load Params from URL for auto size, should affect url
  },
  methods: {
    rightClickHandler: function (event) {
      event.preventDefault()
      this.focusInput()
    },
    focusInput() {
      if (this.$store.getters.isControlBarVisible) {
        EventBus.$emit('focus-controlbar-input')
      } else {
        EventBus.$emit('edit-verse-title')
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  /* background-image: url('assets/blue.jpg'); */

  /* Full height */
  height: 100%;

  /* Center and scale the image nicely */
  background-size: 100% 100%;

  margin: 0px;
}


#baseDiv {
  height: 100%;
}

body,
html {
  height: 100%;
  margin: 0;
}
</style>
