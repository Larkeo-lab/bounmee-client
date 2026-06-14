import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  Scale,
  ShieldAlert,
  Lock,
  BookOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Card, CardBody } from "@heroui/react";

interface LawDetail {
  subtitle: string;
  content: string;
}

interface LawSection {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  details: LawDetail[];
}

const LAWS: LawSection[] = [
  {
    key: "criminal",
    title: "ກົດໝາຍອາຍา (Criminal Law)",
    desc: "ກົດໝາຍທີ່ກຳນົດການກະທຳຜິດທາງອາຍา, ຄວາມຮັບຜິດຊອບທາງອາຍາ ແລະ ມາດຕະການລົງໂທດ ເພື່ອປົກປັກຮັກສາສັງຄົມ ແລະ ຄວາມສະຫງົບ.",
    icon: <ShieldAlert size={24} className="text-red-600" />,
    color: "bg-red-50",
    details: [
      {
        subtitle: "ການປ້ອງກັນຊີວິດ ແລະ ຮ່າງກາຍ",
        content: "ກົດໝາຍປົກປ້ອງຊີວິດ, ສຸຂະພາບ, ກຽດສັກສີ ແລະ ເສລີພາບຂອງພົນລະເມືອງທຸກຄົນ. ການທຳຮ້າຍຮ່າງກາຍ ຫຼື ການລະເມີດສິດຕົວບຸກຄົນແມ່ນມີໂທດທາງອາຍา.",
      },
      {
        subtitle: "ການປ້ອງກັນຊັບສິນ",
        content: "ຫ້າມການລັກຊັບ, ຍັກຍອກຊັບ, ສໍ້ໂກງຊັບ, ປຸ້ນຊັບ ຫຼື ການທຳລາຍຊັບສິນຂອງລັດ ແລະ ຂອງບຸກຄົນອື່ນ.",
      },
      {
        subtitle: "ໂທດທາງອາຍา",
        content: "ມາດຕະການລົງໂທດມີຫຼາຍລະດັບ ເຊັ່ນ: ການສຶກສາອົບຮົມ, ປັບໄໝ, ຈຳກັດບໍລິເວນ, ຈຳຄຸກມີກຳນົດ, ຈຳຄຸກຕະຫຼອດຊີວິດ ແລະ ໂທດປະຫານຊີວິດ.",
      },
    ],
  },
  {
    key: "civil",
    title: "ກົດໝາຍແພ່ງ (Civil Law)",
    desc: "ກົດໝາຍທີ່ກຳນົດກ່ຽວກັບສັນຍາ, ພັນທະ, ສິດຄອບຄອງຊັບສິນ, ມູນມໍລະດົກ ແລະ ການພົວພັນໃນຄອບຄົວ.",
    icon: <Scale size={24} className="text-emerald-600" />,
    color: "bg-emerald-50",
    details: [
      {
        subtitle: "ກົດໝາຍວ່າດ້ວຍສັນຍາ ແລະ ພັນທະ",
        content: "ກຳນົດຫຼັກການໃນການເຮັດສັນຍາຊື້-ຂາຍ, ກູ້ຢືມ, ຊຳລະໜີ້ສິນ ແລະ ຄວາມຮັບຜິດຊອບໃນການຊົດເຊີຍຄ່າເສຍຫາຍເມື່ອມີການລະເມີດສັນຍາ.",
      },
      {
        subtitle: "ກົດໝາຍວ່າດ້ວຍຄອບຄົວ",
        content: "ກຳນົດເງື່ອນໄຂການແຕ່ງງານທີ່ຖືກຕ້ອງຕາມກົດໝາຍ, ການຢ່າຮ້າງ, ການແບ່ງປັນຊັບສົມລົດ, ແລະ ສິດໃນການລ້ຽງດູເບິ່ງແຍງບຸດ.",
      },
      {
        subtitle: "ກົດໝາຍວ່າດ້ວຍມູນມໍລະດົກ",
        content: "ການສືບທອດມູນມໍລະດົກຕາມພິນໄນກຳ ຫຼື ຕາມກົດໝາຍ ກໍລະນີທີ່ຜູ້ເປັນເຈົ້າຂອງຊັບສິນເສຍຊີວິດ ເພື່ອຄວາມເປັນທຳໃນຄອບຄົວ.",
      },
    ],
  },
  {
    key: "cyber",
    title: "ກົດໝາຍວ່າດ້ວຍອາດຊະຍາກຳທາງຄອມພິວເຕີ (Cyber Crime Law)",
    desc: "ກົດໝາຍທີ່ກຳນົດກ່ຽວກັບການປ້ອງກັນ, ສະກັດກັ້ນ ແລະ ແກ້ໄຂການກະທຳຜິດທີ່ນຳໃຊ້ລະບົບຄອມພິວເຕີ ແລະ ອິນເຕີເນັດ.",
    icon: <Lock size={24} className="text-blue-600" />,
    color: "bg-blue-50",
    details: [
      {
        subtitle: "ການເຂົ້າເຖິງຂໍ້ມູນໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ (Hacking)",
        content: "การລັກລອບເຂົ້າລະບົບ ຫຼື ນຳໃຊ້ບັນຊີຄອມພິວເຕີ/ໂຊຊຽວມີເດຍຂອງຜູ້ອື່ນໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດຖືເປັນຄວາມຜິດຮ້າຍແຮງ.",
      },
      {
        subtitle: "ການເຜີຍແຜ່ຂໍ້ມູນທີ່ບໍ່ຖືກຕ້ອງ (Fake News & Slander)",
        content: "ຫ້າມການເຜີຍແຜ່ຂໍ້ມູນທີ່ເປັນເທັດ, ການໂຄສະນາບິດເບືອນ, ຫຼື ການໂພສຂໍ້ຄວາມໃສ່ຮ້າຍປ້າຍສີທີ່ເຮັດໃຫ້ຜູ້ນັ້ນເສຍຊື່ສຽງ ແລະ ກຽດສັກສີ.",
      },
      {
        subtitle: "การຫຼອກລວງອອນລາຍ (Online Scams / Phishing)",
        content: "ການສ້າງເວັບໄຊທ໌ປອມ, ສົ່ງລິ້ງຫຼອກລວງ ຫຼື ນຳໃຊ້ລະບົບອິນເຕີເນັດເພື່ອສໍ້ໂກງຊັບສິນ, ຂໍ້ມູນບັດເຄຣດິດ ຫຼື ຂໍ້ມູນສ່ວນຕົວຂອງຜູ້ອື່ນ.",
      },
    ],
  },
];

export default function LawEducation() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = React.useState<string | null>("criminal");

  const toggleSection = (key: string) => {
    setOpenSection(openSection === key ? null : key);
  };

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
        <span className="text-base font-bold tracking-wide">ສຶກສາກົດໝາຍ / Law Education</span>
        <div className="w-9" />
      </nav>

      {/* Content */}
      <main className="flex-1 bg-[#d9d9d9] flex flex-col p-6 md:p-10">
        <div className="max-w-3xl mx-auto w-full space-y-6">

          {/* Hero */}
          <Card className="bg-[#075e3d] border-none rounded-3xl text-white shadow-lg">
            <CardBody className="p-6 md:p-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold">ສຶກສາກົດໝາຍ</h1>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  ຮຽນຮູ້ກ່ຽວກັບສິດ, ພັນທະ ແລະ ກົດໝາຍທີ່ສຳຄັນຂອງ ສປປ ລາວ
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Intro Text */}
          <Card className="shadow-sm border border-gray-100 rounded-3xl">
            <CardBody className="p-6 space-y-3">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FileText size={20} className="text-[#075e3d]" /> ຄວາມສຳຄັນຂອງການຮຽນຮູ້ກົດໝາຍ
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                ການເຂົ້າໃຈກົດໝາຍພື້ນຖານ ຊ່ວຍໃຫ້ພວກເຮົາສາມາດປົກປ້ອງສິດ ແລະ ຜົນປະໂຫຍດອັນຊອບທຳຂອງຕົນເອງ, ຫຼີກເວັ້ນການກະທຳທີ່ລະເມີດກົດໝາຍໂດຍບໍ່ຮູ້ຕົວ, ແລະ ຮ່ວມກັນສ້າງສາສັງຄົມໃຫ້ມີຄວາມສະຫງົບສຸກ, ເປັນລະບຽບຮຽບຮ້ອຍ ແລະ ມີຄວາມຍຸດຕິທຳ.
              </p>
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
                    ປຶ້ມກົດໝາຍສະບັບເຕັມ (PDF)
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 font-medium mt-0.5">
                    ເປີດອ່ານ ຫຼື ດາວໂຫຼດເອກະສານກົດໝາຍສະບັບສົມບູນ
                  </p>
                </div>
              </div>
              <a
                href="/assets/ກົດຫມາຍ.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#075e3d] hover:bg-[#064e32] active:scale-95 text-white font-bold text-xs md:text-sm rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
              >
                <BookOpen size={16} />
                ເປີດອ່ານກົດໝາຍ
              </a>
            </CardBody>
          </Card>


          {/* Law list custom accordion */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-gray-700 flex items-center gap-2">
              <Scale size={18} className="text-[#075e3d]" /> ຂໍ້ມູນກົດໝາຍທີ່ຄວນຮູ້
            </h2>

            <div className="space-y-3">
              {LAWS.map((l) => {
                const isOpen = openSection === l.key;
                return (
                  <Card key={l.key} className="shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(l.key)}
                      className="w-full text-left p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl ${l.color} flex items-center justify-center shrink-0`}>
                          {l.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm md:text-base text-gray-800">{l.title}</h3>
                        </div>
                      </div>
                      {isOpen ? <ChevronDown size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500 rotate-270" />}
                    </button>

                    {isOpen && (
                      <CardBody className="p-6 pt-0 space-y-4">
                        <p className="text-xs md:text-sm text-gray-500 font-semibold leading-relaxed border-l-4 border-[#075e3d] pl-3">
                          {l.desc}
                        </p>
                        
                        <div className="space-y-3.5 pt-2">
                          {l.details.map((detail, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-2xl space-y-1">
                              <div className="flex items-center gap-2 text-[#075e3d]">
                                <CheckCircle2 size={16} className="shrink-0" />
                                <h4 className="font-bold text-xs md:text-sm text-gray-800">
                                  {detail.subtitle}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed font-semibold pl-6">
                                {detail.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-[#075e3d] h-12 w-full shadow-inner" />
    </div>
  );
}
