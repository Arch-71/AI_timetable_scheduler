import { LandingHeader } from "@/components/landing-header"
import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"

export default function Home() {
  return (
    <>
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatures />
      </main>
      <footer className="bg-primary text-white mt-16 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <p className="text-blue-50 text-sm leading-relaxed">
                MCA Timetable Scheduler is an intelligent academic schedule management system designed to optimize course allocation and faculty scheduling.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/login?role=admin" className="!text-white no-underline">Admin Login</a></li>
                <li><a href="/login?role=faculty" className="!text-white no-underline">Faculty Login</a></li>
                <li><a href="#features" className="!text-white no-underline">Features</a></li>
                <li><a href="#" className="!text-white no-underline">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-blue-50">Automated Scheduling</span></li>
                <li><span className="text-blue-50">Conflict Detection</span></li>
                <li><span className="text-blue-50">Resource Management</span></li>
                <li><span className="text-blue-50">Multi-year Planning</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact & Support</h3>
              <ul className="space-y-2 text-sm">
                <li><span className="text-blue-50">Email: support@mcatimetable.com</span></li>
                <li><span className="text-blue-50">Phone: +91-911364-7995</span></li>
                <li><span className="text-blue-50">Hours: 9 AM - 6 PM IST</span></li>
                <li><span className="text-blue-50">All weekdays</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-400 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-blue-50 text-sm">
                &copy; 2025 MCA Timetable Scheduler. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0 text-sm">
                <a href="#" className="text-blue-50 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-blue-50 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-blue-50 hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
