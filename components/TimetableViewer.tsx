'use client';

import { useState, useEffect } from 'react';
import { useToast } from './ui/use-toast';

/* ===================== TYPES ===================== */

interface TimetableEntry {
  id: string;
  course: { name: string };
  faculty: { name: string };
  room: { name: string };
}

interface TimetableData {
  version?: { name: string };
  timetable: {
    [day: string]: {
      [time: string]: TimetableEntry[];
    };
  };
}

/* ===================== TIME SLOTS (WITH BREAKS) ===================== */

const TIME_SLOTS = [
  { label: '08:55-09:50', type: 'class' },
  { label: '09:50-10:45', type: 'class' },
  { label: '10:45-11:15', type: 'break' },
  { label: '11:15-12:10', type: 'class' },
  { label: '12:10-01:05', type: 'class' },
  { label: '01:05-02:00', type: 'break' },
  { label: '02:00-02:55', type: 'class' },
  { label: '02:55-03:50', type: 'class' },
  { label: '03:50-04:45', type: 'class' }
];

/* ===================== HELPERS ===================== */

const toMinutes = (time: string) => {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const hh = h >= 1 && h <= 4 ? h + 12 : h;
  return hh * 60 + m;
};

const getCoveredSlots = (range: string) => {
  const [start, end] = range.split('-');
  const sMin = toMinutes(start);
  const eMin = toMinutes(end);
  const indexes: number[] = [];
  TIME_SLOTS.forEach((slot, i) => {
    if (slot.type === 'break') return;
    const [s, e] = slot.label.split('-');
    const ss = toMinutes(s);
    const ee = toMinutes(e);
    if (sMin < ee && eMin > ss) indexes.push(i);
  });
  return indexes;
};

/* ===================== COMPONENT ===================== */

export function TimetableViewer({ currentUser }: { currentUser?: any }) {
  const [showSem, setShowSem] = useState<'SEM1' | 'SEM3'>('SEM1');
  const [allowed, setAllowed] = useState<{ sem1: boolean; sem3: boolean }>({ sem1: true, sem3: true });
  const { toast } = useToast();

  const [extraClasses, setExtraClasses] = useState<any[]>([]);
  const [generatedData, setGeneratedData] = useState<TimetableData | null>(null);
  const [latestScheduleData, setLatestScheduleData] = useState<TimetableData | null>(null);
  const [manualData, setManualData] = useState<{ sem1?: TimetableData; sem2?: TimetableData; sem3?: TimetableData } | null>(null);
  const [mergedManual, setMergedManual] = useState<{ sem1?: TimetableData; sem2?: TimetableData; sem3?: TimetableData } | null>(null);

  useEffect(() => {
    fetch('/api/schedules/extra-classes')
      .then(res => res.json())
      .then(data => { if (data?.timetable) setExtraClasses(data.timetable); })
      .catch(err => console.error('extra classes fetch failed', err));
  }, []);

  useEffect(() => {
    fetch('/api/timetable/manual')
      .then(res => res.json())
      .then(data => setManualData({ sem1: data?.sem1, sem2: data?.sem2, sem3: data?.sem3 }))
      .catch(err => console.error('manual timetable fetch failed', err));
  }, []);

  useEffect(() => {
    if (!manualData) return;
    const copySem1 = manualData.sem1 ? JSON.parse(JSON.stringify(manualData.sem1)) : undefined;
    const copySem2 = manualData.sem2 ? JSON.parse(JSON.stringify(manualData.sem2)) : undefined;
    const copySem3 = manualData.sem3 ? JSON.parse(JSON.stringify(manualData.sem3)) : undefined;

    if (extraClasses?.length) {
      extraClasses.forEach((ec: any) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[ec.day_of_week];
        const startTime = ec.start_time ? ec.start_time.substring(0, 5) : '';
        const endTime = ec.end_time ? ec.end_time.substring(0, 5) : '';
        if (!startTime || !endTime) return;
        const timeRange = `${startTime}-${endTime}`;

        const entry: TimetableEntry = {
          id: `extra-${ec.id}`,
          course: { name: ec.course_name },
          faculty: { name: ec.faculty_name },
          room: { name: ec.room_name }
        };

        const targets: { data?: TimetableData; prefix: string }[] = [];
        if (ec.semester === 1) {
          if (!ec.section || ec.section === 'I-A') targets.push({ data: copySem1, prefix: 'I-A' });
          if (!ec.section || ec.section === 'I-B') targets.push({ data: copySem1, prefix: 'I-B' });
        } else if (ec.semester === 2) {
          if (!ec.section || ec.section === 'II-A') targets.push({ data: copySem2, prefix: 'II-A' });
          if (!ec.section || ec.section === 'II-B') targets.push({ data: copySem2, prefix: 'II-B' });
        } else if (ec.semester === 3) {
          if (!ec.section || ec.section === 'III-A') targets.push({ data: copySem3, prefix: 'III-A' });
          if (!ec.section || ec.section === 'III-B') targets.push({ data: copySem3, prefix: 'III-B' });
        }

        targets.forEach(({ data, prefix }) => {
          if (!data?.timetable) return;
          const key = `${prefix} - ${dayName}`;
          if (data.timetable[key]) {
            if (!data.timetable[key][timeRange]) data.timetable[key][timeRange] = [];
            data.timetable[key][timeRange].unshift(entry);
          }
        });
      });
    }

    setMergedManual({ sem1: copySem1, sem2: copySem2, sem3: copySem3 });
  }, [manualData, extraClasses]);

  useEffect(() => {
    const email = currentUser?.email?.toLowerCase?.() ?? '';
    if (!email) {
      setAllowed({ sem1: true, sem3: true });
      return;
    }

    if (email.includes('mca24')) {
      // MCA24 students: only SEM3
      setAllowed({ sem1: false, sem3: true });
      setShowSem('SEM3');
    } else if (email.includes('mca25')) {
      // MCA25 students: only SEM1
      setAllowed({ sem1: true, sem3: false });
      setShowSem('SEM1');
    } else {
      setAllowed({ sem1: true, sem3: true });
    }
  }, [currentUser]);

  useEffect(() => {
    const semParam = showSem === 'SEM1' ? '1' : '3';
    setGeneratedData(null);
    fetch(`/api/timetable/generate?semester=${semParam}`)
      .then(res => res.json())
      .then(data => { if (data?.timetable) setGeneratedData(data as TimetableData); })
      .catch(err => console.error('AI timetable fetch failed', err));
    
    // Also fetch the latest saved/generated timetable from the DB (includes recently added classes)
    fetch('/api/schedules/latest')
      .then(res => res.json())
      .then(data => { if (data?.timetable) setLatestScheduleData({ version: data.version, timetable: data.timetable } as TimetableData); })
      .catch(err => console.error('Latest schedule fetch failed', err));
  }, [showSem]);

  const isCurrentUserFaculty = (facultyNames?: string) => {
    if (!currentUser?.short_name || !facultyNames) return false;
    const current = currentUser.short_name.toLowerCase().replace(/\s+/g, '');
    return facultyNames.split(',').map((f: string) => f.toLowerCase().replace(/\s+/g, '')).includes(current);
  };

  const manualSem1 = mergedManual?.sem1 ?? manualData?.sem1;
  const manualSem3 = mergedManual?.sem3 ?? manualData?.sem3 ?? manualData?.sem2;
  // Prefer the latest schedule (server persisted) if available so admin-added classes appear immediately.
  const data = latestScheduleData ?? generatedData ?? (showSem === 'SEM1' ? manualSem1 : manualSem3) ?? { timetable: {} };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4">
        {allowed.sem1 && allowed.sem3 ? (
          <>
            <button
              className={`px-4 py-2 rounded ${showSem === 'SEM1' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setShowSem('SEM1')}
            >
              Semester 1
            </button>

            <button
              className={`px-4 py-2 rounded ${showSem === 'SEM3' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setShowSem('SEM3')}
            >
              Semester 3
            </button>
          </>
        ) : (!allowed.sem1 && !allowed.sem3) ? (
          <div className="text-sm text-gray-500">No timetable available for your account</div>
        ) : null}
      </div>

      <h2 className="text-xl font-bold">{showSem === 'SEM1' ? 'Semester 1' : 'Semester 3'}</h2>

      <div className="overflow-x-auto">
        <table className="border-collapse min-w-full">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100">Day / Section</th>
              {TIME_SLOTS.map((slot, i) => (
                <th key={i} className={`border p-2 text-sm ${slot.type === 'break' ? 'bg-gray-300' : 'bg-blue-100'}`}>
                  {slot.type === 'break' ? 'BREAK' : slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.timetable).map(([day, slots]) => {
              const used = new Set<number>();
              return (
                <tr key={day}>
                  <td className="border p-2 font-semibold bg-indigo-100">{day}</td>
                  {TIME_SLOTS.map((slot, index) => {
                    if (slot.type === 'break') return <td key={index} className="border bg-gray-200 text-center">—</td>;
                    if (used.has(index)) return null;

                    const candidates: { entry: TimetableEntry; covered: number[]; isExtra: boolean }[] = [];
                    Object.entries(slots as Record<string, TimetableEntry[]>).forEach(([time, entries]) => {
                      const covered = getCoveredSlots(time);
                      if (covered.includes(index) && entries.length > 0) {
                        entries.forEach(entry => candidates.push({ entry, covered, isExtra: entry.id?.toString().startsWith('extra-') }));
                      }
                    });

                    let selected: { entry: TimetableEntry; covered: number[] } | null = null;
                    let span = 1;

                    if (candidates.length) {
                      candidates.sort((a, b) => {
                        if (a.isExtra && !b.isExtra) return -1;
                        if (!a.isExtra && b.isExtra) return 1;
                        const aStarts = a.covered[0] === index;
                        const bStarts = b.covered[0] === index;
                        if (aStarts && !bStarts) return -1;
                        if (!aStarts && bStarts) return 1;
                        return 0;
                      });
                      const best = candidates[0];
                      selected = best;
                      const remaining = best.covered.filter(i => i >= index);
                      span = remaining.length;
                      remaining.forEach(i => used.add(i));
                    }

                    return (
                      <td key={index} colSpan={span} className="border p-2">
                        {selected ? (
                          <div className={`rounded p-2 text-xs border ${isCurrentUserFaculty(selected.entry.faculty.name) ? 'bg-yellow-100 border-yellow-400' : 'bg-blue-50 border-blue-300'}`}>
                            <div className="font-bold">{selected.entry.course.name}</div>
                            <div>{selected.entry.faculty.name}</div>
                            <div>📍 {selected.entry.room.name}</div>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Contact admin <a href="mailto:admin@bmsce.ac.in" className="text-blue-600 hover:underline">admin@bmsce.ac.in</a> for any queries</p>
      </div>
    </div>
  );
}

export default TimetableViewer;
