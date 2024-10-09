<script lang="ts">
	import { onMount } from 'svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    onMount(() => {
        console.log(data.usersList);
    });
</script>

<main class="container is-fluid">
    <table class="table">
        <thead>

        </thead>
    </table>
</main>