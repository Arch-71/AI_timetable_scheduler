"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 text-balance leading-tight">
            Intelligent Academic <span className="text-primary">Timetable Scheduling</span>
          </h1>
          <p className="text-lg text-neutral-600 text-balance leading-relaxed">
            Automate complex timetable generation for MCA programs with conflict resolution, optimal resource
            allocation, and instant export capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
