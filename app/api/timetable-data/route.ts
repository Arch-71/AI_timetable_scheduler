import { NextResponse } from 'next/server';

export async function GET() {
  // This would normally come from a database in production
  const timetableData = {
    version: {
      name: "AI-Generated Timetable - SEM 1",
      generatedAt: new Date().toISOString(),
      modelVersion: "1.0.0"
    },
    timetable: {
      "I-A - Monday": {
        "09:50-10:45": [
          { id: "ia-mon-1", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA1" } }
        ],
        "11:15-12:10": [
          { id: "ia-mon-2", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA1" } }
        ],
        "12:10-01:05": [
          { id: "ia-mon-3", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA1" } }
        ],
        "2:00-3:50": [
          { id: "ia-mon-4", course: { name: "LINUX 1,2, PY3, DBMS4" }, faculty: { name: "SS,GK,RR,KPS" }, room: { name: "Lab 1A" } }
        ]
      },
      // ... rest of your timetable data
    }
  };

  // Add a small delay to simulate AI processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(timetableData);
}
