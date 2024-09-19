import type { UserRecord, RouteProfile, TimeEntryRecord } from '$lib/schema';
import { ROUTES } from '$lib/schema';

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
	console.log('check runtime location')
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
		options = { ...timeOpt };
	} else if (long) {
		options = { ...dateOpt, ...timeOpt, timeZone: getOffsetTimezoneStr(offset) };
	} else {
		options = { ...dateOpt };
	}

	return Intl.DateTimeFormat('en-US', options).format(date);
};

export const routeProfile = (
	user: Pick<UserRecord, 'id' | 'role'>,
	pathname: string
): RouteProfile[] => {
	const userRoute = ROUTES.filter((el) => el.role.includes(user.role)).map((el) => {
		el.path = el.path.replace('[id]', String(user.id));
		return el;
	});

	if (!userRoute.find((el: RouteProfile) => el.path === pathname)) {
		return [];
	}

	return userRoute;
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
