<svelte:options immutable={true} />

<script lang="ts">
  import PageTitle from '../../components/app/PageTitle.svelte';
  import Workspaces from '../../components/workspace/Workspaces.svelte';
  import { userStore } from '../../lib/stores/auth';
</script>

<PageTitle title="Workspaces" />

<Workspaces user={$userStore} />
