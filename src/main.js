import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import * as DataV from '@dataview/datav-vue3'
import DataVVue3 from '@kjgl77/datav-vue3'

const app = createApp(App)

// app.use(DataV)
// export default function (app) {
//     const components = Object.keys(DataV)
//     components.forEach(component => {
//         app.component(component.name, component);
//     });
// }
app.use(DataVVue3)

app.mount('#app')