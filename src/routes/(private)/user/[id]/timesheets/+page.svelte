<script lang="ts">
	import { formatDateOrTime } from '$lib/utility';
	import type { PageData } from './$types';
	export let data: PageData;

	const { timeEntries, startOfDuty, date_at } = data?.userLatestTimedata || {};
	const dutydate = date_at ? formatDateOrTime(date_at) : '';
</script>

<h1 class="title">{date_at}</h1>
<h2 class="subtitle">
	{startOfDuty ? `Do you want to Clock In for ${dutydate}` : 'test'}
</h2>
