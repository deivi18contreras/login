import { createApp } from 'vue'
import { router } from './router/routes'
import { Quasar } from 'quasar'
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
// Import Quasar css
import 'quasar/src/css/index.sass'
import './style.css'

import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

.mount('#app')
