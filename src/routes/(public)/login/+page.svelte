<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  let disabled = false;
  let isInvalid = false;
  let notifySchedule = false;

  const handleSubmit: SubmitFunction = () => {
    disabled = true;
    return async ({ update, result }) => {
      if (result.type == 'failure') {
        if (result.data?.noSchedule) {
          notifySchedule = true;
        } else {
          isInvalid = true;
        }
        disabled = false;
      }
      update();
    };
  };
</script>

<main class="container">
  <section class="columns is-centered section">
    <div class="column is-4">
      <div class="notification" class:is-hidden={!notifySchedule}>
        <button class="delete" on:click={() => (notifySchedule = false)}></button>

        <strong>User Schedule Not Found!</strong> Please reach out to your Team Lead to setup your Schedule
      </div>
      <header>
        <p class="has-text-danger" class:is-hidden={!isInvalid}>Invalid Username or Password</p>
      </header>
      <form class="box" method="POST" use:enhance={handleSubmit}>
        <div class="field">
          <label class="label" for="id">GAID</label>
          <div class="control">
            <input
              class="input"
              type="alphanumeric"
              pattern="^[0-9]{'{'}6{'}'}$"
              placeholder="123456"
              name="id"
              id="id"
              required
              {disabled}
              on:focus={() => (isInvalid = false)}
            />
          </div>
        </div>

        <div class="field">
          <label class="label" for="password">Password</label>
          <div class="control">
            <input
              class="input"
              type="password"
              placeholder="********"
              name="password"
              id="password"
              minlength="6"
              required
              {disabled}
              on:focus={() => (isInvalid = false)}
            />
          </div>
        </div>

        <button class="button is-primary" {disabled}>Sign in</button>
      </form>
    </div>
  </section>
</main>
