<script lang="ts">
	export let label: null | string = null;
</script>

<div class="field">
	{#if label}
		<label for="" class="label">{label}</label>
	{/if}
	<div class="control">
		<slot />
	</div>
</div>
