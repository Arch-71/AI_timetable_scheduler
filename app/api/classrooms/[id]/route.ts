import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const id = request.url.split('/').pop()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { name, capacity, location } = await request.json()
    const db = await getDb()
    const fields: string[] = []
    const params: any[] = []
    if (name) { fields.push('name = ?'); params.push(name) }
    if (capacity !== undefined) { fields.push('capacity = ?'); params.push(capacity) }
    if (location) { fields.push('location = ?'); params.push(location) }
    if (fields.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })
    params.push(id)
    await db.execute(`UPDATE classrooms SET ${fields.join(', ')} WHERE id = ?`, params)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error updating classroom:', err)
    return NextResponse.json({ error: 'Failed to update classroom' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const db = await getDb()
    await db.execute('DELETE FROM classrooms WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error deleting classroom:', err)
    return NextResponse.json({ error: 'Failed to delete classroom' }, { status: 500 })
  }
}
