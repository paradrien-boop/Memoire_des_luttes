import { mount } from 'svelte'
import '../styles/polices.css'
import '../styles/jetons.css'
import '../styles/base.css'
import Atelier from './Atelier.svelte'

export default mount(Atelier, { target: document.getElementById('app')! })
