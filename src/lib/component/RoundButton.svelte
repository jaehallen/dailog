<script lang="ts">
	export let name = 'Button';
</script>

<p class="control">
	<button class={'button is-rounded ' + $$restProps.class || ''}>{name}</button>
</p>

