import { mount } from 'svelte'
import '../../app/src/styles/polices.css'
import '../../app/src/styles/jetons.css'
import '../../app/src/styles/base.css'
import Site from './Site.svelte'

export default mount(Site, { target: document.getElementById('site')! })
