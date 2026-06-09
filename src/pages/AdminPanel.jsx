import { useState } from "react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("orders");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "All Orders" },
    { id: "services", label: "Services" },
    { id: "clients", label: "Clients" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      
      {/* Navbar */}
      <header className="w-full flex justify-center pt-4">
          
          {/* Left */}
          <div className="flex items-center gap-8 text-sm text-gray-600 font-medium">
            <button>Why us</button>
            <button>Services</button>
            <button>Cities</button>
          </div>

          {/* Logo */}
          <h1 className="text-3xl font-bold text-green-500">
            Helpr
          </h1>

          {/* Right */}
          <div className="flex items-center gap-8 text-sm text-gray-600 font-medium">
            <button>How it works</button>
            <button>FAQs</button>

            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              🛒
            </div>

            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-semibold">
              J
            </div>
          </div>

      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto mt-10 px-4">
        
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900">
            Admin Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Manage orders, revenue, and services
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white inline-flex rounded-2xl p-2 shadow-sm mb-8 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-green-500 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Container */}
        <div className="bg-white rounded-3xl border border-gray-100 min-h-[420px] overflow-hidden">
          
          {/* Sort Header */}
          <div className="flex items-center gap-10 px-8 py-5 border-b border-gray-100 text-sm font-medium text-gray-500">
            <button className="text-gray-400">Sort by:</button>

            <button className="text-green-500 font-semibold">
              Date ↑↓
            </button>

            <button>Amount</button>
            <button>Status</button>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-[320px] text-center">
            
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              📦
            </div>

            <p className="text-gray-500 text-lg font-medium">
              No orders yet
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}