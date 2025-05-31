import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Spinner } from "../components/Spinner";
import progressDownloadIcon from "../assets/icons/progress-download.png";
import { downloadHazardCSV, downloadHazardJSON, downloadHazardExcel } from "../store/hazardStore";
import { downloadInspectionCSV, downloadInspectionJSON, downloadInspectionExcel } from "../store/inspectionStore";
import { downloadObservationCSV, downloadObservationJSON, downloadObservationExcel } from "../store/observationStore";

function RouterSpinner() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  return <Spinner show={isLoading} />;
}

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const routerState = useRouterState(); 
  const currentPath = routerState.location.pathname; 
  
  // Tentukan kategori berdasarkan URL saat ini
  const getCategoryFromPath = () => {
    if (currentPath.includes("/hazards")) return "Hazard";
    if (currentPath.includes("/inspections")) return "Inspection";
    if (currentPath.includes("/observations")) return "Observation";
    return null; // Tidak ada kategori yang cocok
  };

  const selectedCategory = getCategoryFromPath();

  function handleDownload(format: "csv" | "json" | "excel") {
    if (!selectedCategory) return;
  
    if (selectedCategory === "Hazard") {
      if (format === "csv") {
        downloadHazardCSV();
      } else if (format === "json") {
        downloadHazardJSON();
      } else if (format === "excel") {
        downloadHazardExcel();
      }
    } else if (selectedCategory === "Inspection") {     
    
      if (format === "csv") {
        downloadInspectionCSV();  
      } else if (format === "json") {
        downloadInspectionJSON();  
      } else if (format === "excel") {
        downloadInspectionExcel();
      }       
    } else if (selectedCategory === "Observation") {

      if (format === "csv") {
        downloadObservationCSV();
      } else if (format === "json") {
        downloadObservationJSON();
      } else if (format === "excel") {
        downloadObservationExcel();
      }
    }
  }  

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {/* 🔹 Navbar Tetap di Atas */}
      <div className="navbar bg-base-100 w-full flex justify-between items-center px-6 py-2 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          {/* Tombol Toggle Sidebar */}
          <button
            className="btn btn-square btn-ghost"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="font-bold text-black text-3xl">ReFME Dashboard</h1>
          {/* Spinner */}
          <div className="text-3xl">
            <RouterSpinner />
          </div>
        </div>

        {/* 🔹 Tombol Download */}
        {selectedCategory && (
          <div className="relative">
            <button
              className="btn btn-square btn-ghost"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <img src={progressDownloadIcon} alt="Download Icon" className="h-6 w-6" />
            </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white border shadow-md rounded-md w-48 p-2">
            <button
              onClick={() => {
                handleDownload("csv");
                setIsDropdownOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-200"
            >
              Download {selectedCategory} CSV
            </button>
            <button
              onClick={() => {
                handleDownload("json");
                setIsDropdownOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-200"
            >
              Download {selectedCategory} JSON
            </button>
            <button
              onClick={() => {
                handleDownload("excel");
                setIsDropdownOpen(false);
              }}
              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-200"
            >
              Download {selectedCategory} Excel
            </button>
          </div>
        )}
          </div>
        )}
      </div>

      {/* 🔹 Sidebar & Konten */}
      <div className="flex flex-1 mt-12">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-50 bg-gray-100 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 pt-20">
            <ul className="space-y-2">
              {[
                //["/", "Home"],
                //["/about", "About"],
                ["/hazards", "Hazards"],
                ["/inspections", "Inspections"],
                ["/observations", "Observations"],
                //["/mentorings", "Mentorings"],
                //["/coachings", "Coachings"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="block py-2 px-4 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 🔹 Konten Utama */}
        <div
          className={`flex-1 p-6 transition-all duration-300 ${
            isSidebarOpen ? "ml-50" : "w-full"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
