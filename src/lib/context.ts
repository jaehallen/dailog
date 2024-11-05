import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

/*
 * Users Page Context for Side Popup of UserUpdate and ScheduleUpdate
 **/
interface UserUpdate {
  updateId: number;
  showType: 'sched' | 'user' | 'manysched' | 'manyuser';
  selectedId: number;
  isEdit: boolean;
}

type UserUpdateStore = ReturnType<typeof getStoreUserUpdate>;

export function setContextUpdate() {
  const editUserStore = getStoreUserUpdate();
  setContext<UserUpdateStore>('editUser', editUserStore);
  setContext<Writable<Boolean>>('isBatchUpdate', writable(false));
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
    isBatchUpdate: getContext<Writable<boolean>>('isBatchUpdate')
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
  const edit = (type: UserUpdate['showType'], id?: number) =>
    update(() => {
      const randomId = () => Math.floor(Math.random() * 10000);
      return {
        updateId: randomId(),
        showType: type,
        selectedId: id ?? 0,
        isEdit: true
      };
    });
  return { subscribe, set, update, edit, reset };
}
