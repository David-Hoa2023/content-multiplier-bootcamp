export function toCSV(plan: any) {
    const rows = [['channel', 'asset', 'datetime']];
    for (const it of (plan.items || [])) { rows.push([it.channel, it.asset, it.datetime]); }
    return rows.map(r => r.join(',')).join('\n');
}

export function toICS(plan: any) {
    // Minimal iCalendar file
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0'];
    for (const it of (plan.items || [])) {
        const dt = it.datetime.replace(/[-:]/g, '').replace('.000Z', 'Z');
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${it.channel}-${it.asset}-${dt}`);
        lines.push(`DTSTAMP:${dt}`);
        lines.push(`DTSTART:${dt}`);
        lines.push(`SUMMARY:${it.channel} - ${it.asset}`);
        lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.join('\n');
}
