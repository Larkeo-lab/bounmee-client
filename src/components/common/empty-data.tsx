

export default function EmptyData({ label = "ບໍ່ພົບຂໍ້ມູນ" }: { label?: string }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[400px] p-8 w-full">
      <div className="relative w-48 h-48 mb-6">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Blob/Glow */}
          <path
            d="M50 80C20 80 0 100 0 130C0 160 20 180 50 180H150C180 180 200 160 200 130C200 100 180 80 150 80H50Z"
            fill="#F3F4F6"
            className="dark:fill-gray-800"
          />

          {/* Back Folder */}
          <rect
            x="40"
            y="40"
            width="120"
            height="100"
            rx="16"
            fill="#E5E7EB"
            className="dark:fill-gray-700"
          />
          <path
            d="M40 56C40 47.1634 47.1634 40 56 40H110L120 50H144C152.837 50 160 57.1634 160 66V130C160 138.837 152.837 146 144 146H56C47.1634 146 40 138.837 40 130V56Z"
            fill="#F9FAFB"
            stroke="#E5E7EB"
            strokeWidth="2"
            className="dark:fill-gray-800 dark:stroke-gray-600"
          />

          {/* Front Folder Shape */}
          <path
            d="M30 76C30 67.1634 37.1634 60 46 60H110L125 75H154C162.837 75 170 82.1634 170 91V154C170 162.837 162.837 170 154 170H46C37.1634 170 30 162.837 30 154V76Z"
            fill="white"
            stroke="#D1D5DB"
            strokeWidth="2"
            className="dark:fill-gray-900 dark:stroke-gray-700"
          />

          {/* Magnifying Glass / Search Circle */}
          <circle cx="106" cy="115" r="32" fill="#D8B4FE" className="animate-pulse-slow opacity-20" />
          <circle cx="100" cy="115" r="32" fill="#C7D2FE" />

          {/* Lines inside circle */}
          <rect x="85" y="105" width="30" height="3" rx="1.5" fill="white" />
          <rect x="85" y="113" width="30" height="3" rx="1.5" fill="white" />
          <rect x="85" y="121" width="18" height="3" rx="1.5" fill="white" />

          {/* Sparkles / Decorations */}
          <path
            d="M175 95L177 90L179 95L184 97L179 99L177 104L175 99L170 97L175 95Z"
            fill="#D1D5DB"
            className="dark:fill-gray-600 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          />
          <circle cx="20" cy="120" r="2" fill="#D1D5DB" className="dark:fill-gray-600" />
          <circle cx="180" cy="150" r="3" fill="#9CA3AF" className="dark:fill-gray-600" />

        </svg>
      </div>
      {/* <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300">
        No Results Found
      </h3> */}
      <p className="text-md text-gray-500 dark:text-gray-400 text-center max-w-xs">
        {label}
      </p>
    </div>
  );
}
