<script lang="ts">
    export let pageCount: number = 1;
    export let pageSize: number = 10;
    export let pageIndex: number = 0;
    export let hasPreviousPage: boolean = false;
    export let hasNextPage: boolean = true;
</script>

<nav class="pagination is-small" aria-label="pagination">
  <button class="pagination-previous" disabled={!hasPreviousPage}>Previous</button>
  <button class="pagination-next" disabled={!hasNextPage}>Next page</button>
  <ul class="pagination-list">
    <li><button class="pagination-link">1</button></li>
    <li><span class="pagination-ellipsis">&hellip;</span></li>
    <li><button class="pagination-link">45</button></li>
    <li>
      <button class="pagination-link is-current">46</button>
    </li>
    <li><button class="pagination-link">47</button></li>
    <li><span class="pagination-ellipsis">&hellip;</span></li>
    <li><button class="pagination-link">86</button></li>
  </ul>
</nav>
