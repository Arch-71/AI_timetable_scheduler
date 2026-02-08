// app/api/faculty_assignments/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { courseId, facultyId, sectionId, batch } = await request.json();

    if (!courseId || !facultyId || !sectionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const courseIdNum = Number(courseId);
    const facultyIdNum = Number(facultyId);
    const sectionIdNum = Number(sectionId);

    if (!Number.isFinite(courseIdNum) || !Number.isFinite(facultyIdNum) || !Number.isFinite(sectionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid course/faculty/section id' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const [courseRows] = await db.execute(
      'SELECT id, course_type, lab_credits FROM courses WHERE id = ?',
      [courseIdNum]
    );

    const course = Array.isArray(courseRows) && courseRows.length > 0 ? (courseRows as any[])[0] : null;
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseType = String(course.course_type || '').toLowerCase();
    const isLabCourse = courseType === 'lab' || Number(course.lab_credits || 0) > 0;
    const allowedBatches = new Set(['B1', 'B2', 'B3', 'B4']);

    let batchValue = 'ALL';
    if (isLabCourse) {
      if (!batch) {
        return NextResponse.json(
          { error: 'Batch is required for lab courses (B1/B2/B3/B4)' },
          { status: 400 }
        );
      }

      batchValue = String(batch).toUpperCase();
      if (!allowedBatches.has(batchValue)) {
        return NextResponse.json(
          { error: 'Invalid batch. Use B1, B2, B3, or B4' },
          { status: 400 }
        );
      }
    }

    // Check if this assignment already exists
    const [existing] = await db.execute(
      'SELECT * FROM faculty_course_assignments WHERE course_id = ? AND section_id = ? AND batch = ?',
      [courseIdNum, sectionIdNum, batchValue]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'This course is already assigned to a faculty for this section' },
        { status: 400 }
      );
    }

    // Insert the new assignment
    await db.execute(
      'INSERT INTO faculty_course_assignments (faculty_id, course_id, section_id, batch) VALUES (?, ?, ?, ?)',
      [facultyIdNum, courseIdNum, sectionIdNum, batchValue]
    );

    return NextResponse.json(
      { message: 'Faculty assigned to course successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error assigning faculty to course:', error);
    return NextResponse.json(
      { error: 'Failed to assign faculty to course' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT 
        fca.id,
        fca.course_id,
        fca.faculty_id,
        fca.section_id,
        fca.batch,
        c.name as course_name,
        c.code as course_code,
        f.name as faculty_name,
        s.name as section_name
      FROM faculty_course_assignments fca
      JOIN courses c ON fca.course_id = c.id
      JOIN faculties f ON fca.faculty_id = f.id
      JOIN sections s ON fca.section_id = s.id
      ORDER BY fca.id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}