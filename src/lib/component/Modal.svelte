<script lang="ts">
	export let isActive = false;
</script>

<div class="modal" class:is-active={isActive}>
	<div class="modal-background"></div>
	<div class="modal-content">
		<div class="card">
			<div class="card-content">
				<div class="content subtitle">
					<slot name="message" />
				</div>
			</div>
			<footer class="card-footer">
				<slot />
			</footer>
		</div>
	</div>
</div>
