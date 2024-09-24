<script lang="ts">
	import { readable } from 'svelte/store';

	const f = (v: number) => String(v).padStart(2, '0');
	export let timestamp: number;

	const time = readable(0, (set) => {
		const interval = setInterval(() => {
			set(Math.floor(Date.now() / 1000 - timestamp));
		}, 1000);

		return () => clearInterval(interval);
	});

	$: hh = Math.floor($time / 3600);
	$: mm = Math.floor(($time - hh * 3600) / 60);
	$: ss = $time - hh * 3600 - mm * 60;
</script>

<span>
	<span>{f(hh)}</span>:
	<span>{f(mm)}</span>:
	<span>{f(ss)}</span>
</span>
