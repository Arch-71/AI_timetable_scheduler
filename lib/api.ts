export const API_BASE = typeof window !== "undefined" ? window.location.origin : ""

export async function fetchAPI(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "API request failed")
  }

  return response.json()
}

export async function getDepartments() {
  return fetchAPI("/api/departments")
}

export async function getCourses(departmentId?: number) {
  const path = departmentId ? `/api/courses?department_id=${departmentId}` : "/api/courses"
  return fetchAPI(path)
}

export async function getFaculties(departmentId?: number) {
  const path = departmentId ? `/api/faculties?department_id=${departmentId}` : "/api/faculties"
  return fetchAPI(path)
}

export async function getClassrooms() {
  return fetchAPI("/api/classrooms")
}

export async function getTimeSlots() {
  return fetchAPI("/api/time-slots")
}

export async function getSchedules() {
  return fetchAPI("/api/schedules")
}

export async function createSchedule(data: any) {
  return fetchAPI("/api/schedules", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateSchedule(id: number, status: string) {
  return fetchAPI("/api/schedules", {
    method: "PUT",
    body: JSON.stringify({ id, status }),
  })
}
