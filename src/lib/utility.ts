import type { UserRecord, RouteProfile } from './server/database/schema';
import { ROUTES } from './server/database/schema';

export const toEpochDatetime = (timeStr: string): Date => {
	const [hr, min] = timeStr.split(':');
	const d = Date.UTC(1970, 0, 1, parseInt(hr) || 0, parseInt(min) || 0);

	if (d) {
		return new Date(d);
	}

	return new Date(Date.UTC(1970, 0, 1));
};

export const dateAtOffset = (date: Date | number, offset: number): Date => {
	if (typeof date === 'number') {
		date = new Date(date)
	}

	const tz = getOffsetTimezone(offset)
	const dateStr = Intl.DateTimeFormat('en-US', {
		year: '2-digit',
		month: '2-digit',
		day: '2-digit',
		timeZone: tz
	}).format(date)


	return new Date(dateStr)
}

export const getTimeStr = (date: Date, isHour12: boolean = false) => {
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

export const intlFormat = <T>(val: T[keyof T]): string => {
	if (typeof val === 'string') {
		let isTime = false;
		let date: Date = new Date(val);

		if (!date.getTime()) {
			date = toEpochDatetime(val);
			isTime = true;
		}

		const options: Intl.DateTimeFormatOptions = isTime
			? { hour: '2-digit', minute: '2-digit' }
			: { month: '2-digit', day: '2-digit', year: 'numeric' };

		return Intl.DateTimeFormat('en-US', options).format(date);
	} else if (typeof val === 'number') {
		// MAKE SURE!!!! to adjust any time prior to formatting
		// Don't want to create timezone detection nor use other library
		let dt = new Date(val);
		const options: Intl.DateTimeFormatOptions = {
			month: '2-digit',
			day: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'UTC'
		};

		return Intl.DateTimeFormat('en-US', options).format(dt);
	}

	return '';
};

export const routeProfile = (user: Pick<UserRecord, 'id' | 'role'>): RouteProfile[] => {
	return ROUTES.filter((el) => el.role.includes(user.role)).map((el) => {
		el.path = el.path.replace('[id]', String(user.id));
		return el;
	});
};


export const getOffsetTimezone = (hours: number) => {
	hours = Number(hours);
	if (!hours) {
		return '+00:00'
	}

	const sign = hours >= 0 ? '+' : '-';
	const h = Math.abs(hours);
	const hh = String(Math.floor(h)).padStart(2, '0');
	const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0');

	return `${sign}${hh}:${mm}`;
}