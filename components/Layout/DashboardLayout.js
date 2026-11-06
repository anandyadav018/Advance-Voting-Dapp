import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiSettings,
  FiBarChart,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiUserPlus,
  FiClipboard,
  FiChevronRight,
} from "react-icons/fi";
import { useAccount } from "wagmi";
import { MdHowToVote } from "react-icons/md";
import { TfiCrown } from "react-icons/tfi";

const DashboardLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: FiHome,
      current: router.pathname === "/dashboard",
      description: "Overview & Analytics",
    },
    {
      name: "Register Voter",
      href: "/register-voter",
      icon: FiUserPlus,
      current: router.pathname === "/register-voter",
      description: "Add New Voter",
    },
    {
      name: "Register Candidate",
      href: "/register-candidate",
      icon: TfiCrown,
      current: router.pathname === "/register-candidate",
      description: "Add New Candidate",
    },
    {
      name: "Vote",
      href: "/vote",
      icon: MdHowToVote,
      current: router.pathname === "/vote",
      description: "Cast Your Vote",
    },
    {
      name: "Voters",
      href: "/voters",
      icon: FiUsers,
      current: router.pathname === "/voters",
      description: "Manage Voters",
    },
    {
      name: "Candidates",
      href: "/candidates",
      icon: FiUserCheck,
      current: router.pathname === "/candidates",
      description: "View Candidates",
    },
    {
      name: "Results",
      href: "/results",
      icon: FiBarChart,
      current: router.pathname === "/results",
      description: "Election Results",
    },
    {
      name: "Admin",
      href: "/admin",
      icon: FiSettings,
      current: router.pathname === "/admin",
      description: "System Settings",
    },
  ];

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={closeSidebar}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </div>
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-2xl transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200 dark:border-gray-700`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-blue-700/80"></div>
              <div className="relative flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur rounded-xl mr-3">
                  <FiClipboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    VotingDApp
                  </span>
                  <p className="text-xs text-blue-100">Decentralized Voting</p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="lg:hidden relative text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    closeSidebar();
                  }}
                  className={`group w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    item.current
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors duration-200 ${
                        item.current
                          ? "bg-white/20"
                          : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${
                          item.current
                            ? "text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div
                        className={`text-xs opacity-75 ${
                          item.current
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {!item.current && (
                    <FiChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </button>
              ))}
            </nav>

            {/* Dark mode toggle & User info */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              {/* Wallet info */}
              {isConnected && (
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">
                      {address?.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Connected
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                </div>
              )}

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-200">
                    {darkMode ? (
                      <FiSun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <FiMoon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <div
                  className={`w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors duration-200 ${
                    darkMode ? "bg-blue-500" : ""
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      darkMode ? "transform translate-x-4" : ""
                    }`}
                  ></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Network indicator */}
                <div className="hidden sm:flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 capitalize">
                    {process.env.NEXT_PUBLIC_NETWORK || "localhost"}
                  </span>
                </div>

                {/* Connect button */}
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus={{
                    smallScreen: "avatar",
                    largeScreen: "full",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="animate-fadeIn">{children}</div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scrollbar-thin {
          scrollbar-width: thin;
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219);
          border-radius: 6px;
        }

        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: rgb(75 85 99);
          border-radius: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
