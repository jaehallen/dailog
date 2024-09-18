<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import type { LayoutData } from './$types';
	import LayoutHeader from '$lib/component/LayoutHeader.svelte';
	import { page } from '$app/stores';
	export let data: LayoutData;
</script>

<svelte:head>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css" />
</svelte:head>

<svelte:body />

<div>
	<ModeWatcher />
	<LayoutHeader brand={data.userInitial} routeList={data.routeList || []} curPath={$page.url.pathname} />
	<main>
		<slot />
	</main>
</div>
