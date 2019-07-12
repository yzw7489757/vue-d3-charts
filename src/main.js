import Vue from 'vue';
import d3Chart from 'packages'
import App from './App';
import '@/styles/reset.css'

Vue.use(d3Chart)
Vue.config.productionTip = false;
// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: h => h(App),
});
