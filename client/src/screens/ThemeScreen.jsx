import React from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { getThemeById } from "../utils/themeUtils";
import Carousel from "@/components/ui/carousel";

const ThemeScreen = () => {
    const { themeConfig, currentTheme, setTheme } = useThemeStore();
    const navigate = useNavigate();
    const currentThemeObj = getThemeById(currentTheme, themeConfig);

    const renderThemePreview = (t, key) => (
        <div className="flex flex-col items-center w-full h-full p-4 sm:p-6 justify-between overflow-hidden">
            {/* 1. Improved Scaling for the Square - uses aspect-ratio to stay square */}
            <div
                className="w-full aspect-square max-h-[35vh] sm:max-h-none flex items-center justify-center border-2 sm:border-4 rounded-xl sm:rounded-2xl shadow-xl bg-opacity-90"
                style={{
                    backgroundColor: t.boardColor,
                    borderColor: t.borderColor,
                    borderStyle: "solid",
                }}
            >
                <div className="flex items-center justify-center scale-75 sm:scale-100">
                    <span style={{ color: t.xColor }} className="text-6xl sm:text-7xl md:text-8xl font-black drop-shadow-md">X</span>
                    <span style={{ color: t.oColor }} className="text-6xl sm:text-7xl md:text-8xl font-black drop-shadow-md ml-2 sm:ml-4">O</span>
                </div>
            </div>

            {/* 2. Info Section - Simplified for mobile to prevent overflow */}
            <div className="w-full mt-4 space-y-2 sm:space-y-3 p-3 rounded-xl backdrop-blur-md bg-black/5 border border-white/10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Win Line</span>
                    <span className="w-20 h-1.5 rounded-full" style={{ backgroundColor: t.winLine }} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Confetti</span>
                    <div className="flex gap-1">
                        {t.confetti.slice(0, 5).map((color, idx) => (
                            <span key={idx} className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </div>
            </div>

            <h3 className="mt-4 text-xl sm:text-2xl font-black uppercase tracking-tighter italic truncate w-full text-center">
                {t.label}
            </h3>
        </div>
    );

    const slides = Object.entries(themeConfig).map(([key, t]) => ({
        title: renderThemePreview(t, key),
        button: (
            <div
                className="w-full h-full flex items-center justify-center font-black text-[10px] sm:text-xs tracking-widest"
                onClick={(e) => {
                    e.stopPropagation();
                    setTheme(key);
                }}
            >
                {currentTheme === key ? "● ACTIVE" : "SELECT THEME"}
            </div>
        ),
        src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    }));

    return (
        <div className="h-dvh w-full flex flex-col transition-all duration-500 overflow-hidden select-none"
            style={{ backgroundColor: currentThemeObj.backgroundColor || currentThemeObj.boardColor }}>

            {/* Header - Shrink padding on mobile */}
            <div className="w-full max-w-7xl mx-auto px-6 py-4 sm:py-8 sm:pt-12 flex justify-between items-center z-30 shrink-0">
                <h2 className="text-3xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none"
                    style={{ color: currentThemeObj.headingColor }}>
                    Themes
                </h2>
                <button
                    onClick={() => navigate("/")}
                    className="px-5 py-2 rounded-full border-2 font-black uppercase text-[10px] sm:text-xs"
                    style={{ borderColor: currentThemeObj.borderColor, color: currentThemeObj.textColor, backgroundColor: currentThemeObj.boardColor }}
                >
                    Back
                </button>
            </div>

            {/* Carousel Section - REMOVED max-h constraint, added overflow-visible */}
            <div className="flex-1 w-full flex items-center justify-center overflow-visible px-2 sm:px-12">
                <div className="w-full h-full flex items-center justify-center">
                    <Carousel slides={slides} />
                </div>
            </div>

            {/* CHANGED: Increased bottom spacer to accommodate the navigation arrows */}
            <div className="h-20 sm:h-24 shrink-0" />
        </div>
    );
};

export default ThemeScreen;