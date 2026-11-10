<script lang="ts">
  import { ui } from '../etat/interface.svelte'
</script>

<div class="annonce" role="status" aria-live="polite" hidden={!ui.annonce}>{ui.annonce?.texte ?? ''}</div>

<style>
  .annonce {
    position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 50;
    background: var(--encre); color: var(--papier); padding: 10px 16px; font-weight: 700; max-width: calc(100% - 32px); text-align: center;
  }
</style>
