import { mount } from 'svelte'
import './styles/polices.css'
import './styles/jetons.css'
import './styles/base.css'
import App from './App.svelte'

const app = mount(App, { target: document.getElementById('app')! })

export default app
