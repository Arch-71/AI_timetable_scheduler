
from ortools.sat.python import cp_model

def solve_timetable_cp(courses, faculties, classrooms, time_slots):
    model = cp_model.CpModel()

    # Create variables: course_faculty_classroom_timeslot -> boolean
    assignments = {}
    for course in courses:
        for faculty in course.assigned_faculties:
            for classroom in classrooms:
                for slot in time_slots:
                    key = f"{course.id}_{faculty.id}_{classroom.id}_{slot.id}"
                    assignments[key] = model.NewBoolVar(key)

    # Constraint 1: Each course must be scheduled exactly once
    for course in courses:
        model.Add(sum(assignments[f"{course.id}_{faculty.id}_{classroom.id}_{slot.id}"]
                     for faculty in course.assigned_faculties
                     for classroom in classrooms
                     for slot in time_slots) == 1)

    # Constraint 2: No faculty conflicts (same time slot)
    for faculty in faculties:
        for slot in time_slots:
            model.Add(sum(assignments[f"{course.id}_{faculty.id}_{classroom.id}_{slot.id}"]
                         for course in courses if faculty.id in course.assigned_faculties
                         for classroom in classrooms) <= 1)

    # Constraint 3: No classroom conflicts
    for classroom in classrooms:
        for slot in time_slots:
            model.Add(sum(assignments[f"{course.id}_{faculty.id}_{classroom.id}_{slot.id}"]
                         for course in courses
                         for faculty in course.assigned_faculties) <= 1)

    # Objective: minimize total "cost" (could be based on preferences)
    # For now, just find any feasible solution
    model.Minimize(0)  # Or add soft constraints

    # Solve
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        # Extract solution
        solution = []
        for key, var in assignments.items():
            if solver.Value(var):
                course_id, faculty_id, classroom_id, slot_id = key.split('_')
                solution.append({
                    'course_id': int(course_id),
                    'faculty_id': int(faculty_id),
                    'classroom_id': int(classroom_id),
                    'time_slot_id': int(slot_id)
                })
        return solution

    return None