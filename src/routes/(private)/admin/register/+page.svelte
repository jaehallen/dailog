<script lang="ts">
  import FieldH from '$lib/component/FieldH.svelte';
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { PageData } from './$types';
  import {enhance} from '$app/forms'

  export let data: PageData;
  const leads: { id: number; region: string; name: string }[] = data?.defaultOptions?.leads ?? [];
  const reagions: string[] = data?.defaultOptions?.regions ?? [];
  
  let notify = false;
  let failed = false;
  let disabled = false;
  let message = ''

  const registerUser: SubmitFunction = () => {
      disabled = true;
      return async ({result, update}) => {
        if(result.type == 'success'){
          update({reset: true});
          notify = true
          failed = false
          message = ''
        }else{
          if(result.type == 'failure'){
            message = result.data?.message || ''
            failed = true
            notify = true
          }

          update({reset: false, invalidateAll: false})
        }
        console.log(result)
        disabled = false
      }
  }
</script>

<main class="container is-max-tablet">
  <section class="section">
    <div class={"notification is-light "+ (failed ? 'is-danger' : 'is-success')} class:is-hidden={!notify}>
      {message}
    </div>
    <form class="box" method="POST" use:enhance={registerUser}>
      <FieldH id="id" label="GAID">
        <input
          class="input"
          type="alphanumeric"
          pattern="^[0-9]{'{'}6{'}'}$"
          placeholder="123456"
          name="id"
          id="id"
          required
          {disabled}
        />
      </FieldH>
      <FieldH id="name" label="Name">
        <input type="text" name="name" class="input" placeholder="Juan Dela Curz" required />
      </FieldH>
      <FieldH id="lead_id" label="Teamlead">
        <div class="select">
          <select name="lead_id" required>
            <option value="">Select Teamlead</option>
            {#each leads as lead (lead.id)}
              <option value={lead.id}>{lead.name}</option>
            {/each}
          </select>
        </div>
      </FieldH>
      <FieldH id="region" label="Region">
        <div class="select">
          <select name="region" id="region" required>
            <option value="">Select Region</option>
            {#each reagions as optRegion}
              <option value={optRegion}>{optRegion}</option>
            {/each}
          </select>
        </div>
      </FieldH>
      <div class="field is-grouped is-grouped-right">
        <p class="control">
          <button {disabled} class="button is-primary"> Register User </button>
        </p>
      </div>
    </form>
  </section>
</main>
