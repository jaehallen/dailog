<script lang="ts">
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import { setTheme, theme } from 'mode-watcher';
	import type { RouteProfile } from '$lib/schema';
	export let routeList: RouteProfile[] = [];
	export let curPath = '/';
	export let brand = 'Dailog';

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
</script>

<nav class="navbar" aria-label="main navigation">
	<div class="navbar-brand">
		<a class="navbar-item" href={curPath}>
			<h1 class="title">{brand}</h1>
		</a>
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
			{#each userRoute as route}
				<a class="navbar-item is-tab" class:is-active={curPath == route.path} href={route.path}>
					{route.name}
				</a>
			{/each}

			{#if adminRoute.length > 0}
				<div class="navbar-item has-dropdown is-hoverable">
					<button class="navbar-link"> Admin </button>
					<div class="navbar-dropdown">
						{#each adminRoute as route}
							<a class="navbar-item" href={route.path} class:is-selected={curPath == route.path}>
								{route.name}
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="navbar-end">
			<div class="navbar-item">
				<button class="button is-small is-ghost" on:click={userTheme}>
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
