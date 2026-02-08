// app/api/schedules/generate/route.ts
import { getDb } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

interface ApiResponse {
  success: boolean;
  versionId?: number;
  coursesScheduled?: number;
  assignmentsSkipped?: number;
  error?: string;
  message?: string;
  details?: any;
}

export async function POST(request: NextRequest) {
  const connection = await getDb();
  let isConnectionActive = true;

  try {
    // Start a transaction
    await connection.beginTransaction();
    console.log("Starting timetable generation...");

    // 1. Validate we have all required data
    try {
      const [coursesCount] = await connection.execute("SELECT COUNT(*) as count FROM courses") as [any[], any];
      const [facultiesCount] = await connection.execute("SELECT COUNT(*) as count FROM faculties") as [any[], any];
      const [classroomsCount] = await connection.execute("SELECT COUNT(*) as count FROM classrooms") as [any[], any];
      const [timeSlotsCount] = await connection.execute("SELECT COUNT(*) as count FROM time_slots WHERE is_break = 0") as [any[], any];
      const [assignmentsCount] = await connection.execute("SELECT COUNT(*) as count FROM faculty_course_assignments") as [any[], any];

      const errors = [];
      if (coursesCount[0].count === 0) errors.push("No courses found");
      if (facultiesCount[0].count === 0) errors.push("No faculties found");
      if (classroomsCount[0].count === 0) errors.push("No classrooms found");
      if (timeSlotsCount[0].count === 0) errors.push("No available time slots found (excluding breaks)");
      if (assignmentsCount[0].count === 0) errors.push("No faculty course assignments found");

      if (errors.length > 0) {
        return NextResponse.json({
          success: false,
          error: "Missing required data",
          details: errors,
          message: "Please ensure all required data is properly set up before generating the timetable."
        } as ApiResponse, { status: 400 });
      }
    } catch (error) {
      console.error("Error validating data:", error);
      return NextResponse.json({
        success: false,
        error: "Error validating data",
        message: "Failed to validate required data for timetable generation"
      } as ApiResponse, { status: 500 });
    }

    // 2. Create a new timetable version
    const [versionResult] = await connection.execute(
      `INSERT INTO timetable_versions 
       (name, description, status, created_by) 
       VALUES (?, ?, 'draft', 1)`,
      [
        `Timetable ${new Date().toLocaleDateString()}`,
        'Auto-generated timetable with faculty assignments'
      ]
    ) as [any, any];
    const versionId = versionResult.insertId;

    // 3. Fetch all required data with faculty assignments
    console.log("Fetching data with faculty assignments...");
    const [courses] = await connection.execute(`
      SELECT c.*, 
             fca.faculty_id,
             fca.section_id,
             fca.batch
      FROM courses c
      LEFT JOIN faculty_course_assignments fca ON c.id = fca.course_id
      WHERE fca.faculty_id IS NOT NULL
      ORDER BY c.id, fca.faculty_id
    `) as [any[], any];

    // Group courses by their base ID to handle multiple faculty assignments
    const coursesByBaseId = new Map<number, any[]>();
    courses.forEach((course: any) => {
      if (!coursesByBaseId.has(course.id)) {
        coursesByBaseId.set(course.id, []);
      }
      coursesByBaseId.get(course.id)?.push(course);
    });

    console.log(`Found ${coursesByBaseId.size} courses with faculty assignments`);

    const [faculties] = await connection.execute("SELECT * FROM faculties") as [any[], any];
    console.log(`Found ${faculties.length} faculties`);

    const [classrooms] = await connection.execute("SELECT * FROM classrooms") as [any[], any];
    console.log(`Found ${classrooms.length} classrooms`);

    const [timeSlots] = await connection.execute(`
      SELECT * FROM time_slots 
      WHERE is_break = 0
      ORDER BY day_of_week, start_time
    `) as [any[], any];
    console.log(`Found ${timeSlots.length} time slots`);

    // 4. Categorize classrooms
    const labRooms = classrooms.filter((c: any) => c.room_type === 'lab');
    const theoryRooms = classrooms.filter((c: any) => c.room_type === 'classroom');
    const specialRooms = classrooms.filter((c: any) => c.room_type === 'special');

    // 5. Group time slots by day for better scheduling
    const timeSlotsByDay: Record<number, any[]> = {};
    timeSlots.forEach((slot: any) => {
      if (!timeSlotsByDay[slot.day_of_week]) {
        timeSlotsByDay[slot.day_of_week] = [];
      }
      timeSlotsByDay[slot.day_of_week].push(slot);
    });

    // Sort time slots by start time
    Object.keys(timeSlotsByDay).forEach(day => {
      timeSlotsByDay[parseInt(day)].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    // 6. Track scheduled slots to avoid conflicts
    const scheduledSlots = new Set<string>();
    const scheduleInserts = [];
    let coursesScheduled = 0;
    let assignmentsSkipped = 0;

    // 7. Process each course with its faculty assignments
    for (const [courseId, courseAssignments] of coursesByBaseId.entries()) {
      const baseCourse = courseAssignments[0]; // All entries share the same course details
      const isLab = baseCourse.is_lab || baseCourse.course_type === 'PCL' || 
                   baseCourse.practical_credits === 1 || baseCourse.lab_credits === 1;
      const isTutorial = baseCourse.tutorial_credits === 1 || 
                        baseCourse.course_type === 'PCC' || 
                        baseCourse.name.toLowerCase().includes('tutorial');
      const needsTwoHourSlot = isLab || isTutorial;

      // Get all faculty assigned to this course
      const assignedFaculty = new Set(courseAssignments.map((ca: any) => ca.faculty_id));
      console.log(`Course ${baseCourse.code} has ${assignedFaculty.size} assigned faculty`);

      // Process each assignment
      for (const assignment of courseAssignments) {
        const faculty = faculties.find((f: any) => f.id === assignment.faculty_id);
        if (!faculty) {
          console.warn(`Faculty ${assignment.faculty_id} not found for course ${baseCourse.code}, skipping...`);
          assignmentsSkipped++;
          continue;
        }

        // Find an appropriate classroom
        let classroom = null;

        // First, try to find a suitable classroom based on course type
        if (isLab && labRooms.length > 0) {
          classroom = labRooms[Math.floor(Math.random() * labRooms.length)];
        } else if (isTutorial && theoryRooms.length > 0) {
          classroom = theoryRooms[Math.floor(Math.random() * theoryRooms.length)];
        } else if (theoryRooms.length > 0) {
          classroom = theoryRooms[Math.floor(Math.random() * theoryRooms.length)];
        } else if (specialRooms.length > 0) {
          classroom = specialRooms[Math.floor(Math.random() * specialRooms.length)];
        }

        // If still no classroom found, try any available classroom
        if (!classroom && classrooms.length > 0) {
          classroom = classrooms[0];
        }

        // If no classrooms are available at all, skip this assignment
        if (!classroom) {
          console.warn(`No classroom available for course ${baseCourse.code}, skipping...`);
          assignmentsSkipped++;
          continue;
        }

        // Find an available time slot
        let slotFound = false;
        for (let day = 1; day <= 6 && !slotFound; day++) {
          const daySlots = timeSlotsByDay[day] || [];
          
          for (let i = 0; i < daySlots.length && !slotFound; i++) {
            const slot = daySlots[i];
            const slotKey = `${faculty.id}-${day}-${slot.id}`;
            
            // Check if this slot is already taken
            if (scheduledSlots.has(slotKey)) {
              continue;
            }

            // For lab/tutorial, check if next slot is also available
            if (needsTwoHourSlot && i < daySlots.length - 1) {
              const nextSlot = daySlots[i + 1];
              const nextSlotKey = `${faculty.id}-${day}-${nextSlot.id}`;
              
              if (!scheduledSlots.has(nextSlotKey)) {
                // Mark both slots as used
                scheduledSlots.add(slotKey);
                scheduledSlots.add(nextSlotKey);
                
                // Add to schedule
                scheduleInserts.push([
                  baseCourse.id,
                  faculty.id,
                  classroom.id,
                  slot.id,
                  null, // schedule_date
                  1,    // created_by
                  versionId,
                  assignment.batch || 'ALL'
                ]);
                
                // Add second slot for 2-hour session
                scheduleInserts.push([
                  baseCourse.id,
                  faculty.id,
                  classroom.id,
                  nextSlot.id,
                  null, // schedule_date
                  1,    // created_by
                  versionId,
                  assignment.batch || 'ALL'
                ]);
                
                slotFound = true;
                coursesScheduled++;
              }
            } else if (!needsTwoHourSlot) {
              // Single slot for regular classes
              scheduledSlots.add(slotKey);
              
              scheduleInserts.push([
                baseCourse.id,
                faculty.id,
                classroom.id,
                slot.id,
                null, // schedule_date
                1,    // created_by
                versionId,
                assignment.batch || 'ALL'
              ]);
              
              slotFound = true;
              coursesScheduled++;
            }
          }
        }

        if (!slotFound) {
          console.warn(`Could not find available slot for ${baseCourse.code} with faculty ${faculty.name}`);
          assignmentsSkipped++;
        }
      }
    }

    // 8. Insert all scheduled entries in a batch
    if (scheduleInserts.length > 0) {
      console.log(`Inserting ${scheduleInserts.length} schedule entries...`);
      try {
        // Process in chunks to avoid hitting MySQL's max_allowed_packet limit
        const chunkSize = 50;
        for (let i = 0; i < scheduleInserts.length; i += chunkSize) {
          const chunk = scheduleInserts.slice(i, i + chunkSize).map(entry => {
            const [course_id, faculty_id, classroom_id, time_slot_id, schedule_date, created_by, _version_id, batch] = entry;
            return [course_id, faculty_id, classroom_id, time_slot_id, schedule_date, created_by, batch];
          });
          
          await connection.query(`
            INSERT INTO schedules 
            (course_id, faculty_id, classroom_id, time_slot_id, schedule_date, created_by, batch)
            VALUES ?
          `, [chunk]);
        }
      } catch (error) {
        console.error("Error inserting schedules:", error);
        throw error;
      }
    } else {
      console.warn("No schedule entries to insert");
      await connection.rollback();
      return NextResponse.json({
        success: false,
        error: "No schedule entries generated",
        message: "Failed to generate any timetable entries. Please check your data and try again."
      } as ApiResponse, { status: 400 });
    }

    // 9. Update version status
    await connection.execute(
      `UPDATE timetable_versions SET status = 'pending' WHERE id = ?`,
      [versionId]
    );

    // Commit the transaction
    await connection.commit();
    isConnectionActive = false; // Mark as no longer active after successful commit

    console.log(`Timetable generation completed. Scheduled ${coursesScheduled} courses, skipped ${assignmentsSkipped} assignments.`);

    return NextResponse.json({
      success: true,
      versionId,
      coursesScheduled,
      assignmentsSkipped,
      message: `Timetable generated successfully with ${coursesScheduled} courses scheduled.`
    } as ApiResponse);

  } catch (error) {
    if (isConnectionActive) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error generating timetable:", error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to generate timetable",
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      } as ApiResponse,
      { status: 500 }
    );
  } finally {
    if (isConnectionActive) {
      try {
        await connection.end();
      } catch (endError) {
        console.error("Error closing connection:", endError);
      }
    }
  }
}