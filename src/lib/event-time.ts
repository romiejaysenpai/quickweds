/** Interpret a wall-clock time in the event's timezone, never the viewer's. */
export function eventInstant(date: string, time = '00:00', timeZone = 'UTC'): Date {
    const value = `${date.slice(0, 10)}T${time.slice(0, 8) || '00:00'}`;
    const wall = new Date(`${value}Z`);
    if (!Number.isFinite(wall.getTime())) throw new Error('Enter a valid event date and time.');
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
    let result = wall.getTime();
    for (let pass = 0; pass < 4; pass++) {
        const parts = Object.fromEntries(formatter.formatToParts(result).map(part => [part.type, part.value]));
        const represented = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
        const correction = wall.getTime() - represented;
        if (!correction) return new Date(result);
        result += correction;
    }
    throw new Error('This time does not exist in the event timezone. Choose another time.');
}

export function isRsvpClosed(deadline: string | null | undefined, timeZone = 'UTC', now = new Date()) {
    if (!deadline) return false;
    return now.getTime() > eventInstant(deadline, '23:59:59', timeZone).getTime();
}
