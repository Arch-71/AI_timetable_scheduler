'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: number;
  name: string;
  code: string;
  course_type?: string;
  lab_credits?: number;
}

interface Faculty {
  id: number;
  name: string;
  email: string;
}

interface Section {
  id: number;
  name: string;
  section_type?: string; // 'lecture' or 'lab'
}

export default function FacultyAssignmentPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]); // New state for assignments
  const [editingId, setEditingId] = useState<number | null>(null); // New state for editing

  const [formData, setFormData] = useState({
    courseId: '',
    facultyId: '',
    sectionId: '',
    batch: ''
  });

  const selectedCourse = courses.find((c) => c.id === Number(formData.courseId));
  const selectedCourseType = (selectedCourse?.course_type || '').toLowerCase();
  const isLabCourse = selectedCourseType === 'lab' || (selectedCourse?.lab_credits || 0) > 0;
  const selectedSection = sections.find(s => s.id === Number(formData.sectionId));
  const isLabSection = selectedSection?.section_type?.toLowerCase() === 'lab';

  const visibleSections = sections.filter((s) => {
    const name = String(s.name || '');
    const sectionType = String(s.section_type || 'lecture').toLowerCase();
    const isLabSection = sectionType === 'lab';
    if (isLabCourse) { if (!isLabSection) return false; }
    else { if (isLabSection) return false; }
    if (/^B[1-4](-|$)/i.test(name)) return false;
    if (/-ALL$/i.test(name)) return false;
    return true;
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, facultiesRes, sectionsRes, assignmentsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/faculties'),
        fetch('/api/sections'),
        fetch('/api/faculty_assignments')
      ]);

      if (!sectionsRes.ok) throw new Error('Failed to fetch sections');
      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      if (!facultiesRes.ok) throw new Error('Failed to fetch faculties');
      // assignmentsRes might fail if table empty initially, handle gracefully

      const [coursesData, facultiesData, sectionsData] = await Promise.all([
        coursesRes.json(),
        facultiesRes.json(),
        sectionsRes.json()
      ]);

      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setFaculties(Array.isArray(facultiesData) ? facultiesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLabSection && !formData.batch) {
      toast({ title: 'Error', description: 'Please select Batch for lab courses.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/faculty_assignments/${editingId}` : '/api/faculty_assignments';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: formData.courseId,
          facultyId: formData.facultyId,
          sectionId: formData.sectionId,
          batch: isLabSection ? formData.batch : undefined
        }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to save assignment');

      toast({ title: 'Success', description: editingId ? 'Assignment updated!' : 'Faculty assigned successfully!' });

      setFormData({ courseId: '', facultyId: '', sectionId: '', batch: '' });
      setEditingId(null);
      fetchData(); // Refresh list

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save assignment.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (assignment: any) => {
    setEditingId(assignment.id);
    setFormData({
      courseId: String(assignment.course_id),
      facultyId: String(assignment.faculty_id),
      sectionId: String(assignment.section_id),
      batch: assignment.batch === 'ALL' ? '' : assignment.batch
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ courseId: '', facultyId: '', sectionId: '', batch: '' });
  };

  const deleteAssignment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await fetch(`/api/faculty_assignments/${id}`, { method: 'DELETE' });
      fetchData();
      toast({ title: 'Deleted', description: 'Assignment removed.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  }

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Assignment' : 'New Assignment'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Course *</label>
              <select className="w-full p-2 border rounded-md" value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value, batch: '' })} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>

            {/* Faculty Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Faculty *</label>
              <select className="w-full p-2 border rounded-md" value={formData.facultyId} onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })} required>
                <option value="">Select Faculty</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            {/* Section Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Section *</label>
              <select className="w-full p-2 border rounded-md" value={formData.sectionId} onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })} required>
                <option value="">Select Section</option>
                {visibleSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {isLabCourse && (
              <div>
                <label className="block text-sm font-medium mb-1">Batch *</label>
                <select className="w-full p-2 border rounded-md" value={formData.batch} onChange={(e) => setFormData({ ...formData, batch: e.target.value })} required>
                  <option value="">Select Batch</option>
                  {['B1', 'B2', 'B3', 'B4'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update' : 'Assign')}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
              )}
            </div>
          </form>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Current Assignments</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-medium">Course</th>
                  <th className="p-3 font-medium">Faculty</th>
                  <th className="p-3 font-medium w-24">Section</th>
                  <th className="p-3 font-medium w-24">Batch</th>
                  <th className="p-3 font-medium w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {assignments.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No assignments found. Add one to get started.</td></tr>
                ) : (
                  assignments.map((a: any) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{a.course_code}</div>
                        <div className="text-xs text-gray-500">{a.course_name}</div>
                      </td>
                      <td className="p-3">{a.faculty_name}</td>
                      <td className="p-3">{a.section_name}</td>
                      <td className="p-3">
                        {a.batch === 'ALL' ? <span className="text-gray-400">-</span> : <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{a.batch}</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(a)} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded">Edit</button>
                          <button onClick={() => deleteAssignment(a.id)} className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 bg-red-50 rounded">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}