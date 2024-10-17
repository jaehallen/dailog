<script lang="ts">
  import Sun from 'lucide-svelte/icons/sun';
  import Moon from 'lucide-svelte/icons/moon';
  import { setTheme, theme } from 'mode-watcher';
  import type { RouteProfile, UserRecord } from '$lib/types/schema';
  import { AVATAR_SRC } from '$lib/defaults';
  import { onMount } from 'svelte';
  export let routeList: RouteProfile[] = [];
  export let curPath = '/';
  export let user: Partial<UserRecord> | undefined;

  let url = new URL(AVATAR_SRC);
  url.searchParams.set('seed', user?.name ?? 'dailog');

  let userRoute: RouteProfile[] = [];
  let adminRoute: RouteProfile[] = [];
  let isActive = false;

  routeList.forEach((route) => {
    if (!route.role.includes('user')) {
      adminRoute.push(route);
    } else {
      userRoute.push(route);
    }
  });

  const userTheme = () => {
    if ($theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  onMount(() => {
    try {
      if (user?.preferences?.avatar_src) {
        url = new URL(user.preferences.avatar_src);
      }
    } catch (err) {
      console.error('Invalid Avatar url');
    }
  });
</script>

<nav class="navbar" aria-label="main navigation">
  <div class="navbar-brand">
    <button class="button is-ghost py-0 pr-0">
      <figure class="image is-48x48">
        <img class="is-rounded" src={url.href} alt="avatar" />
      </figure>
    </button>
    <button
      class="navbar-burger"
      class:is-active={isActive}
      aria-label="menu"
      aria-expanded="false"
      on:click={() => (isActive = !isActive)}
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>
  </div>

  <div class="navbar-menu" class:is-active={isActive}>
    <div class="navbar-start">
      {#if adminRoute.length > 0}
        <div class="navbar-item has-dropdown is-hoverable">
          <button class="navbar-link"> Admin </button>
          <div class="navbar-dropdown">
            {#each adminRoute as route}
              <a
                data-sveltekit-reload
                class="navbar-item"
                href={route.path}
                class:is-selected={curPath == route.path}
              >
                {route.name}
              </a>
            {/each}
          </div>
        </div>
      {/if}
      {#each userRoute as route}
        <a class="navbar-item is-tab" class:is-active={curPath == route.path} href={route.path}>
          {route.name}
        </a>
      {/each}
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <button class="button is-small is-text" on:click={userTheme}>
          <span class="icon">
            {#if $theme === 'light'}
              <Sun />
            {:else}
              <Moon />
            {/if}
          </span>
        </button>
      </div>
      <div class="navbar-item">
        <form action="/api/logout" method="POST">
          <button class="button outline">Logout</button>
        </form>
      </div>
    </div>
  </div>
</nav>
