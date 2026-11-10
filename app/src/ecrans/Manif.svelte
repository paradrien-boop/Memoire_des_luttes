<script lang="ts">
  import Entete from '../composants/Entete.svelte'
  import { catalogue } from '../donnees'
</script>

<Entete surtitre="Pack de départ · Commune 1871" titre="Mémoire des luttes" marque={'Tout reste\nsur ton\ntéléphone'} />
<div class="pile">
  <p>Le compteur de manif et les boosters arrivent à l'étape 1.</p>
  <p class="discret">{catalogue.officielles.length} cartes officielles chargées depuis data/.</p>
</div>
