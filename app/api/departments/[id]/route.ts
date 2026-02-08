import { getDb } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const id = request.url.split('/').pop()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const { name, code } = await request.json()
    const db = await getDb()
    const fields: string[] = []
    const params: any[] = []
    if (name) { fields.push('name = ?'); params.push(name) }
    if (code) { fields.push('code = ?'); params.push(code) }
    if (fields.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 })
    params.push(id)
    await db.execute(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, params)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error updating department:', err)
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop()
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const db = await getDb()
    await db.execute('DELETE FROM departments WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[v0] Error deleting department:', err)
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}
