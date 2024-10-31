import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';
import type { UsersList } from './types/schema';
import { UserPlus } from 'lucide-svelte';

/*
 * Users Page Context for Side Popup of UserUpdate and ScheduleUpdate
 **/
interface UserUpdate {
  updateId: number;
  showType: 'sched' | 'user';
  data: UsersList | null;
  schedules: UsersList['schedules'];
  id: number;
  onUpdate: boolean;
}

export function setContextUpdate() {
  let info: UserUpdate = {
    updateId: 0,
    data: null,
    schedules: [],
    showType: 'user',
    id: 0,
    onUpdate: false
  };

  const {set, update, subscribe} = writable<UserUpdate>({...info})
  const reset = () => set({...info})
  setContext('editUser', { set, update, subscribe, reset });
}


export function getContextUpdate() {
  return getContext<Writable<UserUpdate>>('editUser');
}

export function setContextSchedBatch() {
  const isBatchSched = writable(false)
  setContext('isBatchSched', isBatchSched)
}

export function getContextSchedBatch() {
  return getContext<Writable<boolean>>('isBatchSched')
}

