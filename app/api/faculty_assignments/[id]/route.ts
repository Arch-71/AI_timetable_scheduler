import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function DELETE(
    request: Request,
    { params }: RouteParams
) {
    try {
        const id = Number(params.id);
        if (!Number.isFinite(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const db = await getDb();
        await db.execute('DELETE FROM faculty_course_assignments WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Assignment deleted' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        return NextResponse.json(
            { error: 'Failed to delete assignment' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: RouteParams
) {
    try {
        const id = Number(params.id);
        const { courseId, facultyId, sectionId, batch } = await request.json();

        if (!Number.isFinite(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const db = await getDb();

        // Check overlap excluding current record
        const [existing] = await db.execute(
            'SELECT id FROM faculty_course_assignments WHERE course_id = ? AND section_id = ? AND batch = ? AND id != ?',
            [courseId, sectionId, batch || 'ALL', id]
        );

        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json(
                { error: 'Assignment already exists for this course/section' },
                { status: 400 }
            );
        }

        await db.execute(
            'UPDATE faculty_course_assignments SET course_id = ?, faculty_id = ?, section_id = ?, batch = ? WHERE id = ?',
            [courseId, facultyId, sectionId, batch || 'ALL', id]
        );

        return NextResponse.json({ message: 'Assignment updated' });
    } catch (error) {
        console.error('Error updating assignment:', error);
        return NextResponse.json(
            { error: 'Failed to update assignment' },
            { status: 500 }
        );
    }
}
