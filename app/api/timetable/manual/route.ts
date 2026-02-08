import { NextResponse } from 'next/server';

// This file contains the manual timetables for SEM1 and SEM2.
// Keeping this server-only prevents the manual data from being bundled into client JS.

const sem1 = {
  version: { name: 'Complete Weekly Timetable - SEM 1' },
  timetable: {
    "I-A - Monday": {
      "09:50-10:45": [ { id: "ia-mon-1", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA1" } } ],
      "11:15-12:10": [ { id: "ia-mon-2", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA1" } } ],
      "12:10-01:05": [ { id: "ia-mon-3", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA1" } } ],
      "2:00-3:50": [ { id: "ia-mon-4", course: { name: "LINUX 1,2, PY3, DBMS4" }, faculty: { name: "SS,GK,RR,KPS" }, room: { name: "Lab 1A" } } ]
    },
    "I-B - Monday": {
      "09:50-10:45": [ { id: "ib-mon-1", course: { name: "DBMS" }, faculty: { name: "SS" }, room: { name: "CA2" } } ],
      "11:15-1:05": [ { id: "ib-mon-2", course: { name: "LINUX 4, PY3, DBMS1,2" }, faculty: { name: "RMR,TS,SS,KPS" }, room: { name: "Lab 1A" } } ],
      "2:00-2:50": [ { id: "ib-mon-3", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA2" } } ]
    },
    "I-A - Tuesday": {
      "09:50-10:45": [ { id: "ia-tue-1", course: { name: "DBMS" }, faculty: { name: "SS" }, room: { name: "CA1" } } ],
      "11:15-1:05": [ { id: "ia-tue-2", course: { name: "LINUX 3, PY1,2, DBMS4" }, faculty: { name: "SS,TS,RR,KPS" }, room: { name: "Lab 1A" } } ],
      "2:00-2:55": [ { id: "ia-tue-3", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA1" } } ]
    },
    "I-B - Tuesday": {
      "08:55-10:45": [ { id: "ib-tue-1", course: { name: " PY1,2, WEB 3,4" }, faculty: { name: "SU,TS,VPP,DNS" }, room: { name: "Lab 1A" } } ],
      "11:15-12:10": [ { id: "ib-tue-2", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA2" } } ],
      "12:10-01:05": [ { id: "ib-tue-3", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA2" } } ],
      "2:00-2:50": [ { id: "ib-tue-4", course: { name: " DBMS" }, faculty: { name: "SS" }, room: { name: "CA2" } } ]
    },
    "I-A - Wednesday": {
      "08:55-10:45": [ { id: "ia-wed-1", course: { name: "LINUX TUTORIAL" }, faculty: { name: "SS" }, room: { name: "Lab 1A" } } ],
      "11:15-01:05": [ { id: "ia-wed-2", course: { name: "LINUX4, PY3, DBMS1,2" }, faculty: { name: "SS,TS,VPP,GK" }, room: { name: "Lab 1A" } } ],
      "2:00-2:55": [ { id: "ia-wed-3", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA1" } } ]
    },
    "I-B - Wednesday": {
      "09:50-10:45": [ { id: "ib-wed-1", course: { name: "WEB" }, faculty: { name: "VPP" }, room: { name: "CA2" } } ],
      "11:15-12:10": [ { id: "ib-wed-2", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA2" } } ],
      "12:10-01:05": [ { id: "ib-wed-3", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA2" } } ],
      "2:00-3:50": [ { id: "ib-wed-4", course: { name: "LINUX1,2, DBMS3,4" }, faculty: { name: "RMR,GK,KPS,TS" }, room: { name: "Lab 1A" } } ],
      "3:55-4:45": [ { id: "ib-wed-5", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA3" } } ]
    },
    "I-A - Thursday": {
      "8:00-8:55": [ { id: "ia-thu-1", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA3" } } ],
      "09:50-10:45": [ { id: "ia-thu-2", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA1" } } ],
      "11:15-01:05": [ { id: "ia-thu-3", course: { name: "WEB3,4, DBMS1,2" }, faculty: { name: "VPP,GK,TS,SS" }, room: { name: "Lab 1A" } } ],
      "2:00-4:45": [ { id: "ia-thu-4", course: { name: "Placement" }, faculty: { name: "" }, room: { name: "CA1/CA2" } } ]
    },
    "I-B - Thursday": {
      "09:50-10:45": [ { id: "ib-thu-1", course: { name: "DBMS" }, faculty: { name: "SS" }, room: { name: "CA2" } } ],
      "11:15-12:10": [ { id: "ib-thu-2", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA2" } } ],
      "12:10-01:05": [ { id: "ib-thu-3", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA2" } } ],
      "2:00-4:45": [ { id: "ib-thu-4", course: { name: "PLACEMENT" }, faculty: { name: "" }, room: { name: "FDC/CA1/CA2" } } ]
    },
    "I-A - Friday": {
      "09:50-10:45": [ { id: "ia-fri-1", course: { name: "PYTHON" }, faculty: { name: "SU" }, room: { name: "CA2" } } ],
      "11:15-12:10": [ { id: "ia-fri-2", course: { name: "DBMS" }, faculty: { name: "SS" }, room: { name: "CA1" } } ],
      "12:10-01:05": [ { id: "ia-fri-3", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA1" } } ]
    },
    "I-B - Friday": {
      "08:55-10:45": [ { id: "ib-fri-1", course: { name: "LINUX TUTORIAL" }, faculty: { name: "RMR" }, room: { name: "Lab 1A" } } ],
      "11:15-12:10": [ { id: "ib-fri-2", course: { name: "MSF" }, faculty: { name: "KPS" }, room: { name: "CA2" } } ],
      "12:10-01:05": [ { id: "ib-fri-3", course: { name: "DBMS" }, faculty: { name: "SS" }, room: { name: "CA2" } } ],
      "2:00-3:50": [ { id: "ib-fri-4", course: { name: "LINUX3,PY4 WEB1,2" }, faculty: { name: "RMR,TS,VPP,DNS" }, room: { name: "Lab 1A" } } ]
    },
    "I-A - Saturday": {
      "08:55-10:45": [ { id: "ia-sat-1", course: { name: "Cultural" }, faculty: { name: "" }, room: { name: "FDC" } } ],
      "11:15-01:50": [ { id: "ia-sat-2", course: { name: "English" }, faculty: { name: "RR" }, room: { name: "LAB1A" } } ]
    },
    "I-B - Saturday": {
      "08:55-10:45": [ { id: "ib-sat-1", course: { name: "English" }, faculty: { name: "RR" }, room: { name: "LAB1A" } } ],
      "11:15-01:50": [ { id: "ib-sat-2", course: { name: "Cultural" }, faculty: { name: "" }, room: { name: "FDC" } } ]
    }
  }
};

const sem3 = {
  version: { name: 'Complete Weekly Timetable - SEM 3' },
  timetable: {

      /* ===================== MONDAY ===================== */

      "II-A - Monday": {
        "08:55-10:45": [
          { id: "iia-mon-1", course: { name: "ADA 1,2 ,DT 3,4" }, faculty: { name: "TSP,PLN,DNS,VK " }, room: { name: "LAb1A" } }
        ],
        "11:15-12:10": [
          { id: "iia-mon-2", course: { name: "ELE-3" }, faculty: { name: "GK,TSP,RR" }, room: { name: "CA2,CA3,L1B" } }
        ],

        "12:10-01:05": [
          { id: "iia-mon-3", course: { name: "CC" }, faculty: { name: "RR" }, room: { name: "CA2" } }
        ],
        "2:00-2:55": [
          { id: "iia-mon-4", course: { name: "STP" }, faculty: { name: "TS" }, room: { name: "CA1" } }
        ],
        "2:55-3:5": [
          { id: "iia-mon-5", course: { name: "ELE-2(AI,CS)" }, faculty: { name: "VK,DNS" }, room: { name: "CA1,CA3" } }
        ]
      },

      "II-B - Monday": {
        "09:50-10:45": [
          { id: "iib-mon-1", course: { name: "CC" }, faculty: { name: "TS" }, room: { name: "CA3" } }
        ],
        "11:15-12:10": [
          { id: "iib-mon-2", course: { name: "ELE-3" }, faculty: { name: "GK,TSP,RR" }, room: { name: "CA2,CA3,L1B" } }
        ],
        "12:10-01:05": [
          { id: "iib-mon-3", course: { name: "STP" }, faculty: { name: "PLN" }, room: { name: "CA3" } }
        ],
        "2:00-2:50": [
          { id: "iib-mon-4", course: { name: "ADA" }, faculty: { name: "TSP" }, room: { name: "CA3" } }
        ],
        "2:55-3:50": [
          { id: "iib-mon-5", course: { name: "ELE-2(AI,CS)" }, faculty: { name: "VK,DNS" }, room: { name: "CA1,CA3" } }
        ]
      },

      /* ===================== TUESDAY ===================== */

      "II-A - Tuesday": {
        "08:55-09:50": [
          { id: "iia-tue-1", course: { name: "ELE-2 DevOps" }, faculty: { name: "RMR" }, room: { name: "L1B" } }
        ],
        "09:50-10:45": [
          { id: "iia-tue-2", course: { name: "ELE-3" }, faculty: { name: "GK,TSP,RR" }, room: { name: "CA2,CA3,L1B" } }
        ],
        "11:15-12:10": [
          { id: "iia-tue-3", course: { name: "Agile" }, faculty: { name: "DNS" }, room: { name: "CA3" } }
        ],
        "12:10-01:05": [
          { id: "iia-tue-4", course: { name: "ADA" }, faculty: { name: "TSP" }, room: { name: "CA3" } }
        ],
        "2:00-2:55": [
          { id: "iia-tue-5", course: { name: "STP" }, faculty: { name: "TS" }, room: { name: "CA3" } }
        ],
        "2:55-4:45": [
          { id: "iia-tue-6", course: { name: "ELE-3 LAB" }, faculty: { name: "GK,TSP,RR" }, room: { name: "FDC,L1B,L2" } }
        ]
      },

      "II-B - Tuesday": {
        "08:55-09:50": [
          { id: "iib-tue-1", course: { name: "ELE-2 DevOps" }, faculty: { name: "RMR" }, room: { name: "L1B" } }
        ],
        "09:50-10:45": [
          { id: "iib-tue-2", course: { name: "ELE-3" }, faculty: { name: "GK,TSP,RR" }, room: { name: "CA2,CA3,L1B" } }
        ],
        "11:15-01:05": [
          { id: "iib-tue-3", course: { name: "DT Tutorial" }, faculty: { name: "GK" }, room: { name: "CA1" } }
        ],
        "2:00-3:50": [
          { id: "iib-tue-4", course: { name: " ADA 3,4 DT 1,2" }, faculty: { name: "PLN,KPS,DNS,VK" }, room: { name: "Lab1A" } }
        ]
      },

      /* ===================== WEDNESDAY ===================== */

      "II-A - Wednesday": {
        "08:55-10:45": [
          { id: "iia-wed-1", course: { name: "DT TUTORIAL" }, faculty: { name: "GK" }, room: { name: "CA1" } }
        ],
        "11:15-12:10": [
          { id: "iia-wed-2", course: { name: "ELE-2" }, faculty: { name: "VK,DNS,RMR" }, room: { name: "CA1,CA3,L1B" } }
        ],
        "12:10-01:05": [
          { id: "iia-wed-3", course: { name: "ADA" }, faculty: { name: "TSP" }, room: { name: "CA3" } }
        ],
        "2:00-3:50": [
          { id: "iia-wed-4", course: { name: "Agile Tutorial" }, faculty: { name: "DNS" }, room: { name: "CA1" } }
        ]
      },

      "II-B - Wednesday": {
        "08:55-09:50": [
          { id: "iib-wed-1", course: { name: "CC" }, faculty: { name: "TS" }, room: { name: "CA3" } }
        ],
        "09:50-10:45": [
          { id: "iib-wed-2", course: { name: "ADA" }, faculty: { name: "TSP" }, room: { name: "CA3" } }
        ],
        "11:15-12:10": [
          { id: "iib-wed-3", course: { name: "ELE-2" }, faculty: { name: "VK,DNS,RMR" }, room: { name: "CA1,CA3,L1B" } }
        ],
        "12:10-01:05": [
          { id: "iib-wed-4", course: { name: "STP" }, faculty: { name: "PLN" }, room: { name: "CA1" } }
        ],
        "2:00-3:50": [
          { id: "iib-wed-5", course: { name: "Agile Tutorial" }, faculty: { name: "VK" }, room: { name: "CA3" } }
        ]

      },

      /* ===================== THURSDAY ===================== */

      "II-A - Thursday": {

        "09:50-10:45": [
          { id: "iia-thu-1", course: { name: "CC" }, faculty: { name: "RR" }, room: { name: "CA3" } }
        ],
        "11:15-12:10": [
          { id: "iia-thu-2", course: { name: "ADA" }, faculty: { name: "TSP" }, room: { name: "CA3" } }
        ],
        "12:10-01:05": [
          { id: "iia-thu-3", course: { name: "ELE-2" }, faculty: { name: "VK,DNS,RMR" }, room: { name: "CA1,CA3,L1B" } }
        ],
        "2:00-2:55": [
          { id: "iia-thu-4", course: { name: "Agile" }, faculty: { name: "DNS" }, room: { name: "CA2" } }
        ],

        "2:55-4:45": [
          { id: "iia-thu-4", course: { name: "Placement" }, faculty: { name: "-" }, room: { name: "FDC/Lab1A/Lab1B" } }
        ]
      },

      "II-B - Thursday": {
        "08:55-10:45": [
          { id: "iib-thu-1", course: { name: "ADA 1,2 ,DT 3,4" }, faculty: { name: "TSP,PLN,DNS,VK " }, room: { name: "LAb1A" } }
        ],
        "11:15-12:10": [
          { id: "iib-thu-2", course: { name: "STP" }, faculty: { name: "PLN" }, room: { name: "CA1" } }
        ],
        "12:10-01:05": [
          { id: "iib-thu-3", course: { name: "ELE-2" }, faculty: { name: "VK,DNS,RMR" }, room: { name: "CA1,CA3,L1B" } }
        ],
        "2:00-4:45": [
          { id: "iib-thu-4", course: { name: "PLACEMENT" }, faculty: { name: "-" }, room: { name: "FDC/CA1/CA2" } }
        ],
        "2:55-4:45": [
          { id: "iib-thu-4", course: { name: "Placement" }, faculty: { name: "-" }, room: { name: "FDC/Lab1A/Lab1B" } }
        ]
      },

      /* ===================== FRIDAY ===================== */

      "II-A - Friday": {
        "08:55-09:50": [
          { id: "iia-fri-0", course: { name: "CC" }, faculty: { name: "RR" }, room: { name: "CA3" } }
        ],
        "09:50-10:45": [
          { id: "iia-fri-1", course: { name: "ELE-3" }, faculty: { name: "GK,TSP,RR" }, room: { name: "CA2,CA3,L1B" } }
        ],
        "11:15-01:05": [
          { id: "iia-fri-2", course: { name: "ADA 3,4 DT 1,2" }, faculty: { name: "TSP,PLN,SU,DNS" }, room: { name: "LAB1A" } }
        ]
      },

      "II-B - Friday": {
        "09:50-10:45": [
          { id: "iib-fri-0", course: { name: "ELE-3" }, faculty: { name: "GK,TSP,RR" }, room: { name: "CA2,CA3,L1B" } }
        ],
        "11:15-12:10": [
          { id: "iib-fri-2", course: { name: "CC" }, faculty: { name: "TS" }, room: { name: "CA3" } }
        ],
        "12:10-01:05": [
          { id: "iib-fri-3", course: { name: "Agile" }, faculty: { name: "VK" }, room: { name: "CA3" } }
        ],
        "2:00-3:50": [
          { id: "iib-fri-4", course: { name: "ELE-3 LAB" }, faculty: { name: "GK,TSP,RR" }, room: { name: "FDC,L1B,L2" } }
        ]
      },

      /* ===================== SATURDAY ===================== */

      "II-A - Saturday": {
        "08:55-10:45": [
          { id: "iia-sat-1", course: { name: "Mini Project" }, faculty: { name: "ALL" }, room: { name: "-" } }
        ],
        "11:15-12:10": [
          { id: "iia-sat-2", course: { name: "STP" }, faculty: { name: "TS" }, room: { name: "CA3" } }
        ]
      },

      "II-B - Saturday": {
        "08:55-10:45": [
          { id: "iib-sat-1", course: { name: "Mini Project" }, faculty: { name: "ALL" }, room: { name: "-" } }
        ],
        "11:15-12:10": [
          { id: "iib-sat-2", course: { name: "Agile" }, faculty: { name: "VK" }, room: { name: "CA2" } }
        ]
      }

  }
};

export async function GET() {
  return NextResponse.json({ sem1, sem3 });
}
