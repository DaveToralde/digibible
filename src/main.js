import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

function initStore() {
  store.dispatch('initStore')
}

new Vue({
  store,
  created() {
    initStore()
  },
  render: h => h(App),
}).$mount('#app')
