<script lang="ts">
  import Entete from '../composants/Entete.svelte'
  import { catalogue } from '../donnees'
  const familles = Object.values(catalogue.familles).filter(f => !f.reserveeAuCollectif)
</script>

<Entete surtitre="Fais tes propres cartes" titre="Éditeur" marque={'Hors ligne\net anonyme'} />
<div class="pile">
  <p>L'éditeur arrive à l'étape 1. Familles disponibles :</p>
  <p class="discret">{familles.map(f => f.libelle).join(' · ')}</p>
</div>
