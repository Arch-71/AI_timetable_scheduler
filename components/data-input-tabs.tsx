"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepartmentsTab } from "./departments-tab"
import { CoursesTab } from "./courses-tab"
import { FacultiesTab } from "./faculties-tab"
import { ClassroomsTab } from "./classrooms-tab"
import { StudentsTab } from "./students-tab"

export function DataInputTabs() {
  return (
    <Tabs defaultValue="departments" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-neutral-100">
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="faculties">Faculties</TabsTrigger>
        <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="departments" className="space-y-4">
          <DepartmentsTab />
        </TabsContent>
        <TabsContent value="courses" className="space-y-4">
          <CoursesTab />
        </TabsContent>
        <TabsContent value="faculties" className="space-y-4">
          <FacultiesTab />
        </TabsContent>
        <TabsContent value="classrooms" className="space-y-4">
          <ClassroomsTab />
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <StudentsTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}
