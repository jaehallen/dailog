export const toEpochDatetime = (timeStr: string): Date => {
	const [hr, min] = timeStr.split(':');
	const d = Date.UTC(1970, 0, 1, parseInt(hr) || 0, parseInt(min) || 0);

	if (d) {
		return new Date(d);
	}

	return new Date(Date.UTC(1970, 0, 1));
};

export const getOffsetTimezoneStr = (hours: number) => {
	hours = Number(hours);
	if (!hours) {
		return '+00:00';
	}

	const sign = hours >= 0 ? '+' : '-';
	const h = Math.abs(hours);
	const hh = String(Math.floor(h)).padStart(2, '0');
	const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0');

	return `${sign}${hh}:${mm}`;
};

export const dateAtOffset = (date: Date | number, offset: number): Date => {
	if (typeof date === 'number') {
		date = new Date((date + offset * 3600) * 1000);
	} else {
		date = new Date(date.getTime() + offset * 3600000);
	}

	return date;
};

export const dateAtOffsetStr = (date: Date | number, offset: number): string => {
	return dateAtOffset(date, offset).toISOString().split('T', 1)[0];
};

export const getTimeStr = (date: Date, isHour12 = false) => {
	if (!(date instanceof Date)) {
		throw new Error('Invalid Date');
	}

	return Intl.DateTimeFormat('en-US', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: isHour12,
		timeZone: 'UTC'
	}).format(date);
};

//This should only be executed at client side. UTC-Offset timezone is not supported.
export const formatDateOrTime = (val: string | Date, long = false, offset = 0): string => {
	let isTime = false;
	let date = val instanceof Date ? val : new Date(val);

	if (!date.getTime() && typeof val === 'string') {
		date = toEpochDatetime(val);
		isTime = true;
	}

	const timeOpt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
	const dateOpt: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
	let options: Intl.DateTimeFormatOptions = {};

	if (isTime) {
		options = { ...timeOpt, timeZone: 'UTC' };
	} else if (long) {
		date = dateAtOffset(date, offset)
		options = {...dateOpt, ...timeOpt, timeZone: 'UTC'}
		// options = { ...dateOpt, ...timeOpt, timeZone: getOffsetTimezoneStr(offset) };
	} else {
		options = { ...dateOpt };
	}

	return Intl.DateTimeFormat('en-US', options).format(date);
};

export const userInitials = (fullname: string): string => {
	const allNames = fullname.trim().split(' ');

	if (allNames.length === 1) {
		return allNames[0].toUpperCase().substring(0, 2);
	}

	return allNames.reduce((acc, curr, idx) => {
		if (idx === 0 || idx === allNames.length - 1) {
			acc = `${acc}${curr.charAt(0).toUpperCase()}`;
		}

		return acc;
	}, '');
};

export const timeDuration = (start: number, end: number | null) => {
	const a = Number(start);
	const b = Number(end);

	if (!a || !b || a > b) {
		return '-';
	}

	return secToDuration(b - a);
};

export const secToDuration = (dur: number) => {
	const f = (v: number) => String(v).padStart(2, '0');
	const hh = Math.floor(dur / 3600);
	const mm = Math.round(dur / 60 - hh * 60);
	// const ss = dur - hh * 3600 - mm * 60;

	return `${f(hh)}:${f(mm)}`;
};

export const minToDuration = (min: number) => {
	const f = (v: number) => String(v).padStart(2, '0');
	const hh = Math.floor(min / 60);
	const mm = Math.floor(min - hh * 60);

	return `${f(hh)}:${f(mm)}`;
};

export function isEqual(x: any, y: any) {
	if (!x && !y) return !0;
	if (!x || !y) return !1;
	if (typeof x !== typeof y) return !1;
	if (x instanceof Array) {
		if (x.length != y.length) return !1;
		const f = [];
		for (let i = 0; i < x.length; i++) {
			if (!isEqual(x[i], y[i])) f.push(i);
		}
		const g = [...f];
		for (const i of f) {
			let r = 0;
			for (const j of g) {
				if (isEqual(x[i], y[j])) {
					g.splice(g.indexOf(j), 1);
					r++;
					break;
				}
			}
			if (!r) {
				return !1;
			}
		}
		return !0;
	} else if (x instanceof Object) {
		const e1 = Object.entries(x);
		try {
			return isEqual(e1, r(Object.entries(y), e1));
		} catch (e) {
			return !1;
		}
	} else {
		return x === y;
	}

	function r(u: any, v: any) {
		const a = [];
		if (u.length != v.length) return u;
		for (let i = 0; i < v.length; i++) {
			a.push(m(u, v[i][0]));
		}
		return a;
	}

	function m(a: any, k: any) {
		for (let i = 0; i < a.length; i++) {
			if (a[i][0] === k) return [a[i][0], a[i][1]];
		}
		throw 0;
	}
}

export function getWeekRange(dateStr: string): { dateStart: string; dateEnd: string } {
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) {
		throw new Error('Invalid Date');
	}
	let week = d.getDay();
	let date = d.getDate();

	let dateStart = new Date(d.setDate(date - week));
	let dateEnd = new Date(d.setDate(d.getDate() + 6));

	return {
		dateStart: dateStart.toISOString().split('T')[0],
		dateEnd: dateEnd.toISOString().split('T')[0]
	};
}

export function startOfday(date: Date) {
	if (date instanceof Date) {
		return new Date(date.toDateString());
	}

	return new Date(new Date().toDateString());
}

export function timeDiffSec(time1: string, time2: string): number {
	const date1 = new Date(`2000-01-01T${time1}Z`);
	const date2 = new Date(`2000-01-01T${time2}Z`);
	let diff = (date2.getTime() - date1.getTime()) / 1000;

	if (diff < 0) {
		diff += 86400;
	}

	return diff;
}
