<svelte:options immutable={true} />

<script lang="ts">
  import { base } from '$app/paths';
  import PhoenixIcon from '../../assets/aerie-phoenix-logo.svg?component';
  import Nav from '../../components/app/Nav.svelte';
  import CssGrid from '../../components/ui/CssGrid.svelte';
  import { userStore } from '../../lib/stores/auth';
  import { getWorkspacesUrl } from '../../utilities/routes';
</script>

<CssGrid rows="var(--nav-header-height) calc(100vh - var(--nav-header-height))">
  <Nav user={$userStore}>
    <div class="workspace-title" slot="title">
      <a class="app-icon link flex flex-nowrap" href={getWorkspacesUrl(base)}>
        <PhoenixIcon height={16} />Sequence Workspaces
      </a>
    </div>
  </Nav>

  <slot />
</CssGrid>

<style>
  .workspace-title {
    align-items: center;
    display: flex;
    gap: 6px;
  }
</style>
