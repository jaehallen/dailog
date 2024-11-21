<script lang="ts">
  import Modal from '$lib/component/Modal.svelte';
  import Field from '$lib/component/Field.svelte';
  import UserScheduleTable from '$lib/component/UserScheduleTable.svelte';
  import Toasts from '$lib/component/Toasts.svelte';
  import AsideContainer from '$lib/component/AsideContainer.svelte';
  import ConfigInputs from '$lib/component/ConfigInputs.svelte';
  import type { PageData } from './$types';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { enhance } from '$app/forms';
  import { browser } from '$app/environment';
  import { toasts } from '$lib/data-store';
  import { isPreference } from '$lib/data-store';

  export let data: PageData;
  const RESET_FORM_ID = 'resetform';
  let isActive = false;
  let disabled = false;
  let newPassword = '';
  let retypePassword = '';
  let oldPassword = '';
  let invalidPassword = false;

  const handleEnhance: SubmitFunction = ({ cancel }) => {
    if (data.profile?.lock_password) {
      confirm(
        'This account password is locked, please contact your team lead to reset your password.'
      );
      cancel();
      isActive = false;
      return;
    }
    disabled = true;
    return async ({ update, result }) => {
      if (result.type === 'success') {
        update({ invalidateAll: true });
        isActive = false;
        toasts.add({ message: 'Password reset successful' });
      } else if (result.type === 'failure') {
        invalidPassword = result.data?.incorrect;
        update({ reset: false });
      }
      disabled = false;
    };
  };

  const onPreference: SubmitFunction = () => {
    disabled = true;
    return async ({ update, result }) => {
      if (result.type == 'success') {
        toasts.add({ message: 'Success', type: 'success', timeout: 3000 });
        update();
        $isPreference = false;
      } else {
        console.error(result);
        toasts.add({ message: 'Something went wrong', type: 'error', timeout: 0 });
        update({ reset: false, invalidateAll: false });
      }

      disabled = false;
    };
  };
</script>

<Toasts />
{#if $isPreference && browser}
  <AsideContainer on:exit={() => ($isPreference = false)}>
    <form method="POST" action="?/update-preferences" use:enhance={onPreference}>
      <ConfigInputs user={data?.user ?? null} {disabled} />
    </form>
  </AsideContainer>
{/if}
<main class="container is-fullhd">
  <Modal {isActive}>
    <form
      action="?/password-reset"
      slot="message"
      method="post"
      id={RESET_FORM_ID}
      use:enhance={handleEnhance}
    >
      <input hidden type="text" autocomplete="username" value={data.profile?.id} />
      <Field label="Old Password" name="old">
        <input
          type="password"
          name="old"
          id="old"
          class="input"
          placeholder="Old Password"
          required
          minlength="6"
          on:focus={() => (invalidPassword = false)}
          bind:value={oldPassword}
          autocomplete="current-password"
        />
        <div class:is-hidden={!invalidPassword} class="help is-danger">Invalid Password</div>
      </Field>
      <Field label="New Password" name="new">
        <input
          type="password"
          name="new"
          id="new"
          class="input"
          placeholder="New Password"
          bind:value={newPassword}
          required
          minlength="6"
          autocomplete="new-password"
        />
        {#if oldPassword.length >= 6 && newPassword == oldPassword}
          <p class="help is-danger">New password must be different from old password</p>
        {/if}
        <p class="help is-danger"></p>
      </Field>
      <Field>
        <input
          type="password"
          class="input"
          placeholder="Confirm New Password"
          bind:value={retypePassword}
          required
          minlength="6"
          autocomplete="new-password"
        />
      </Field>
    </form>
    <button {disabled} class="button card-footer-item is-ghost" on:click={() => (isActive = false)}
      >Cancel</button
    >
    <button
      form={RESET_FORM_ID}
      class:is-loading={disabled}
      disabled={retypePassword !== newPassword || oldPassword == newPassword}
      class="button card-footer-item is-ghost">Save</button
    >
  </Modal>
  {#if data.user}
    <section class="section">
      <div class="fixed-grid has-2-cols">
        <div class="grid">
          <div class="cell">
            <h2 class="title is-4">{data.profile?.name || 'No User'}</h2>
            <p class="subtitle is-6">
              {data.profile?.id || 'No ID'}
              {#if !data.profile?.lock_password}
                <br />
                <button class="button is-ghost p-0 m-0" on:click={() => (isActive = true)}
                  >Reset Password</button
                >
              {/if}
            </p>
          </div>
          <div class="cell">
            <div class="level">
              <div class="level-item">
                <p class="heading">Team Lead:&emsp;</p>
                <p class="title is-5">
                  {data.profile?.teamlead || '-'}
                </p>
              </div>
              <div class="level-item">
                <p class="heading">Region:&emsp;</p>
                <p class="title is-5">
                  {data.profile?.region || '-'}
                </p>
              </div>
            </div>
          </div>
          <div class="cell"></div>
        </div>
      </div>
    </section>
    <section>
      {#if data.schedules.length && browser}
        <UserScheduleTable schedules={data.schedules} />
      {/if}
    </section>
  {/if}
</main>
