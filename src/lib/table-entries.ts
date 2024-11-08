import {writable} from 'svelte/store';

export const entriesQuery = writable({
  search: '',
  date_at: new Date().toISOString().substring(0, 10),
  region: ''
})