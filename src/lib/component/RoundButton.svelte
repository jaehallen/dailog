<script lang="ts">
	export let name = 'Button';
	export let disabled = false;
</script>

<p class="control">
	<button class={'button is-rounded ' + $$restProps.class || ''} on:click {disabled}>{name}</button>
</p>
