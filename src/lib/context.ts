import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

/*
 * Users Page Context for Side Popup of UserUpdate and ScheduleUpdate
 **/
interface UserUpdate {
  updateId: number;
  showType: 'sched' | 'user';
  itemId: number;
  onUpdate: boolean;
}

export function setContextUpdate() {
  let updateInfo = writable<UserUpdate>({
    updateId: Math.floor(Math.random() * 10000),
    showType: 'user',
    itemId: 0,
    onUpdate: false
  });

  setContext('updateInfo', updateInfo);
}

export function getContextUpdate() {
  return getContext<Writable<UserUpdate>>('updateInfo');
}
