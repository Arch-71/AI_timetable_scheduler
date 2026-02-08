"use client"

export function LandingFeatures() {
  const features = [
    {
      title: "Smart Conflict Detection",
      description: "Automatically detects and resolves scheduling conflicts between faculty, classrooms, and courses.",
      icon: "⚡",
    },
    {
      title: "Resource Optimization",
      description: "Efficiently allocates classrooms and time slots to maximize resource utilization.",
      icon: "📊",
    },
    {
      title: "Multi-Version Support",
      description: "Create and manage multiple timetable versions with independent approval workflows.",
      icon: "📋",
    },
    {
      title: "One-Click Export",
      description: "Export finalized timetables in PDF and CSV formats for easy distribution.",
      icon: "📥",
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Powerful Features</h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Everything you need to create efficient, conflict-free timetables
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-neutral-200 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
