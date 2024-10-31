import { writable, derived, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import { usersData } from './table-users';

/*
 * Users Page Context for Side Popup of UserUpdate and ScheduleUpdate
 **/
interface UserUpdate {
  updateId: number;
  showType: 'sched' | 'user';
  selectedId: number;
  onUpdate: boolean;
}

type UserUpdateStore = ReturnType<typeof getStoreUserUpdate>;

const editUserStore = getStoreUserUpdate();
const selectedUser = derived([editUserStore, usersData], ([$editUserStore, $usersData]) => {
  return $usersData.find((user) => user.id == $editUserStore.selectedId) ?? null;
});

const userSchedules = derived(selectedUser, ($selectedUser) => {
  return $selectedUser?.schedules || [];
});

export function setContextUpdate() {
  setContext<UserUpdateStore>('editUser', editUserStore);
  setContext<Writable<Boolean>>('isBatchSched', writable(false));
}

export function getContextUpdate() {
  return {
    selectedUser,
    userSchedules,
    editUser: getContext<UserUpdateStore>('editUser'),
    isBatchSched: getContext<Writable<boolean>>('isBatchSched')
  };
}

function getStoreUserUpdate() {
  let info: UserUpdate = {
    updateId: 0,
    showType: 'user',
    selectedId: 0,
    onUpdate: false
  };

  const { set, update, subscribe } = writable<UserUpdate>({ ...info });
  const reset = () => set({ ...info });
  return { subscribe, set, update, reset };
}
