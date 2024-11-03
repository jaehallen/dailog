import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

/*
 * Users Page Context for Side Popup of UserUpdate and ScheduleUpdate
 **/
interface UserUpdate {
  updateId: number;
  showType: 'sched' | 'user' | 'manysched';
  selectedId: number;
  isEdit: boolean;
}

type UserUpdateStore = ReturnType<typeof getStoreUserUpdate>;

export function setContextUpdate() {
  const editUserStore = getStoreUserUpdate();
  setContext<UserUpdateStore>('editUser', editUserStore);
  setContext<Writable<Boolean>>('isBatchSched', writable(false));
}

export function setContextProfile() {
  setContext<Writable<Boolean>>('isPreference', writable(false));
}

export function getContextProfile() {
  return getContext<Writable<boolean>>('isPreference');
}

export function getContextUpdate() {
  return {
    editUser: getContext<UserUpdateStore>('editUser'),
    isBatchSched: getContext<Writable<boolean>>('isBatchSched')
  };
}

function getStoreUserUpdate() {
  let info: UserUpdate = {
    updateId: 0,
    showType: 'user',
    selectedId: 0,
    isEdit: false
  };

  const { set, update, subscribe } = writable<UserUpdate>({ ...info });
  const reset = () => set({ ...info });
  return { subscribe, set, update, reset };
}
