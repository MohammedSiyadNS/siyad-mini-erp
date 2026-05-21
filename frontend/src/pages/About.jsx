import { Info, HelpCircle, Shield, Code, Server, Heart } from "lucide-react";

function About() {
  const features = [
    {
      title: "Offline-First Operations",
      description: "Perform lag-free checkouts and manage stock fully offline. Data is saved in a local, crash-safe relational SQLite store.",
      icon: <Server className="text-[#8B6B43]" size={20} />,
    },
    {
      title: "Real-Time Cloud Sync",
      description: "Automatic background syncing with PostgreSQL (Supabase) over HTTP sync protocols when internet connectivity is available.",
      icon: <Code className="text-[#8B6B43]" size={20} />,
    },
    {
      title: "Conflict Resolution",
      description: "Deterministic Last-Write-Wins (LWW) conflict resolution governed by server timestamps and soft-delete priority rules.",
      icon: <Shield className="text-[#8B6B43]" size={20} />,
    },
  ];

  return (
    <div className="min-h-full overflow-auto bg-gradient-to-br from-[#F5F0E6] via-[#E8DCCB] to-[#D6C2A8] p-4 rounded-[35px]">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-black text-[#3E2F1C] tracking-tight">
          About System
        </h1>
        <p className="text-[#6B5B4D] mt-2 text-base">
          Discover the technology powering Al Amana Grocery ERP
        </p>
      </div>

      {/* BRAND CARD */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl border border-white/30 p-8 mb-6">
        <div className="max-w-3xl">
          <div className="bg-[#8B6B43] text-white p-4 rounded-3xl w-fit mb-6 shadow-lg">
            <Info size={32} />
          </div>
          
          <h2 className="text-3xl font-extrabold text-[#3E2F1C] mb-3">
            AL AMANA GROCERY ERP
          </h2>
          <p className="text-[#5A4632] leading-relaxed text-lg mb-6">
            A state-of-the-art Enterprise Resource Planning (ERP) platform custom-designed for small-scale retail stores. 
            Built on a hybrid database architecture, this system guarantees zero checkout latency by running locally 
            while backing up critical financial, product, and customer registries to the cloud in real-time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white/30 rounded-2xl p-5 border border-white/20 shadow-sm">
                <div className="bg-[#C8A97E]/20 p-3 rounded-xl w-fit mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#3E2F1C] text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B5B4D] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TECH DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CORE PLATFORM SPEC */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl p-8 border border-white/30">
          <h3 className="text-2xl font-bold text-[#3E2F1C] mb-4 flex items-center gap-2">
            <Shield size={22} className="text-[#8B6B43]" /> System Architecture Specs
          </h3>
          <div className="space-y-4 text-[#5A4632]">
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="font-semibold">Local Storage Engine</span>
              <span>SQLite 3 (WAL Journal Mode)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="font-semibold">Remote Database</span>
              <span>Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="font-semibold">Sync Protocol</span>
              <span>Outbox Pull/Push HTTP Schema</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/20">
              <span className="font-semibold">Frontend Core</span>
              <span>React 19 + Tailwind CSS v4 + Vite</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Offline Status Tracker</span>
              <span>Pulsing Real-Time WS State</span>
            </div>
          </div>
        </div>

        {/* HELP & SUPPORT */}
        <div className="bg-white/40 backdrop-blur-2xl rounded-[35px] shadow-2xl p-8 border border-white/30 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#3E2F1C] mb-4 flex items-center gap-2">
              <HelpCircle size={22} className="text-[#8B6B43]" /> Help & Support
            </h3>
            <p className="text-[#6B5B4D] leading-relaxed mb-6">
              Need assistance configuring your local database sync, restoring back-up files, or managing product inventories?
              Our administrator dashboard and support line are always active to keep Al Amana Grocery running.
            </p>
          </div>

          <div className="bg-[#F7F3EA] border border-[#E8DCCB] p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-[#8B6B43]/10 p-3 rounded-xl text-[#8B6B43]">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-xs text-[#8B7B6B] uppercase tracking-wider font-semibold">Contact Support</p>
              <p className="text-sm font-bold text-[#3E2F1C]">support@alamana-grocery.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CREDITS */}
      <div className="text-center text-sm text-[#6B5B4D] py-4">
        © 2026 Al Amana Grocery ERP. Running securely in offline-first sync mode.
      </div>
    </div>
  );
}

export default About;
