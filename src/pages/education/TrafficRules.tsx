import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  TrafficCone,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Info,
  BookOpen,
  FileText,
} from "lucide-react";
import { Card, CardBody } from "@heroui/react";

const SIGN_TYPES = [
  {
    title: "ປ້າຍບັງຄັບ",
    desc: "ບອກສິ່ງທີ່ຕ້ອງເຮັດ ຫຼື ຫ້າມເຮັດ — ຮູບວົງມົນ ສີແດງ/ຟ້າ",
    icon: <Ban size={22} className="text-red-600" />,
    color: "bg-red-50",
    shape: <div className="w-10 h-10 rounded-full border-4 border-red-500 bg-white" />,
  },
  {
    title: "ປ້າຍເຕືອນ",
    desc: "ເຕືອນໄພອັນຕະລາຍຂ້າງໜ້າ — ຮູບສາມຫຼ່ຽມ ສີເຫຼືອງ",
    icon: <AlertTriangle size={22} className="text-amber-500" />,
    color: "bg-amber-50",
    shape: (
      <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[34px] border-l-transparent border-r-transparent border-b-amber-400" />
    ),
  },
  {
    title: "ປ້າຍແນະນຳ",
    desc: "ໃຫ້ຂໍ້ມູນ ເສັ້ນທາງ/ສະຖານທີ່ — ຮູບສີ່ຫຼ່ຽມ ສີຟ້າ",
    icon: <Info size={22} className="text-blue-600" />,
    color: "bg-blue-50",
    shape: <div className="w-10 h-10 rounded-md bg-blue-500" />,
  },
];

const RULES = [
  "ຂັບຂີ່ຊິດດ້ານຂວາຂອງເສັ້ນທາງ",
  "ຄາດສາຍແອວນິລະໄພທຸກຄັ້ງ (ລົດໃຫຍ່)",
  "ໃສ່ໝວກກັນກະທົບ (ລົດຈັກ)",
  "ບໍ່ດື່ມເຫຼົ້າແລ້ວຂັບຂີ່",
  "ບໍ່ໃຊ້ໂທລະສັບໃນຂະນະຂັບຂີ່",
  "ເຄົາລົບສັນຍານໄຟ ແລະ ປ້າຍຈະລາຈອນ",
];

const SPEEDS = [
  { place: "ໃນຕົວເມືອງ / ເຂດຊຸມຊົນ", limit: "50 km/h" },
  { place: "ນອກຕົວເມືອງ / ທາງຫຼວງ", limit: "90 km/h" },
  { place: "ທາງດ່ວນ", limit: "120 km/h" },
];

const LIGHTS = [
  { color: "bg-red-500", label: "ແດງ", desc: "ຢຸດ" },
  { color: "bg-yellow-400", label: "ເຫຼືອງ", desc: "ກຽມຢຸດ / ລະວັງ" },
  { color: "bg-green-500", label: "ຂຽວ", desc: "ໄປໄດ້" },
];

export default function TrafficRules() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm h-20 z-10">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/logo.png"
            alt="Ministry Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => { e.currentTarget.src = "/logo.png"; }}
          />
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-[#075e3d] leading-tight">
              ກະຊວງປ້ອງກັນຄວາມສະຫງົບ
            </span>
            <span className="text-xs md:text-sm font-semibold text-gray-500 tracking-wide">
              Ministry of Public Security
            </span>
          </div>
        </div>
      </header>

      {/* Green Nav Bar */}
      <nav className="bg-[#075e3d] text-white h-14 flex items-center justify-between px-6 shadow-md relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-95 cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft size={26} />
        </button>
        <span className="text-base font-bold tracking-wide">ສຶກສາກົດຈະລາຈອນ / Traffic Rules</span>
        <div className="w-9" />
      </nav>

      {/* Content */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10">
        <div className="max-w-3xl mx-auto w-full space-y-6">

          {/* Hero */}
          <Card className="bg-[#075e3d] border-none rounded-3xl text-white shadow-lg">
            <CardBody className="p-6 md:p-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <TrafficCone size={28} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold">ກົດຈະລາຈອນ</h1>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  ຮຽນຮູ້ກົດລະບຽບ ເພື່ອຄວາມປອດໄພໃນການສັນຈອນ
                </p>
              </div>
            </CardBody>
          </Card>

          {/* PDF Document Viewer Card */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl hover:shadow-md transition-shadow">
            <CardBody className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-gray-800">
                    ປຶ້ມກົດໝາຍວ່າດ້ວຍການຈະລາຈອນທາງບົກ (PDF)
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
                    ເປີດອ່ານ ຫຼື ດາວໂຫຼດເອກະສານກົດລະບຽບການຈະລາຈອນສະບັບສົມບູນ
                  </p>
                </div>
              </div>
              <a
                href="/assets/ຈາລະຈອນ.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#075e3d] hover:bg-[#064e32] active:scale-95 text-white font-bold text-xs md:text-sm rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
              >
                <BookOpen size={16} />
                ເປີດອ່ານກົດລະບຽບ
              </a>
            </CardBody>
          </Card>

          {/* Traffic signs */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#075e3d]" /> ປະເພດປ້າຍຈະລາຈອນ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SIGN_TYPES.map((s) => (
                <Card key={s.title} className="shadow-sm border border-gray-100 rounded-2xl">
                  <CardBody className="p-5 flex flex-col items-center text-center gap-3">
                    <div className={`w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center`}>
                      {s.shape}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {s.icon}
                      <h3 className="font-bold text-sm text-gray-800">{s.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">{s.desc}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          {/* Basic rules */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#075e3d]" /> ກົດລະບຽບພື້ນຖານ
            </h2>
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RULES.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#075e3d]/10 text-[#075e3d] text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-gray-700">{r}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </section>

          {/* Speed limits */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <Gauge size={18} className="text-[#075e3d]" /> ຄວາມໄວທີ່ກຳນົດ
            </h2>
            <Card className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
              <CardBody className="p-0 divide-y divide-gray-100">
                {SPEEDS.map((s) => (
                  <div key={s.place} className="flex items-center justify-between px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700">{s.place}</span>
                    <span className="text-sm font-extrabold text-[#075e3d] bg-[#075e3d]/10 px-3 py-1 rounded-full">
                      {s.limit}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </section>

          {/* Traffic lights */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <TrafficCone size={18} className="text-[#075e3d]" /> ສັນຍານໄຟຈະລາຈອນ
            </h2>
            <Card className="shadow-sm border border-gray-100 rounded-3xl">
              <CardBody className="p-6 flex justify-center gap-8">
                {LIGHTS.map((l) => (
                  <div key={l.label} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full ${l.color} shadow-md`} />
                    <span className="text-sm font-bold text-gray-800">{l.label}</span>
                    <span className="text-xs text-gray-500 font-semibold">{l.desc}</span>
                  </div>
                ))}
              </CardBody>
            </Card>
          </section>

        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
