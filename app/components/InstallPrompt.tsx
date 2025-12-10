"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare } from "lucide-react";

export default function InstallPrompt({ children }: { children: React.ReactNode }) {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        const checkStandalone = () => {
            const isStandaloneMode =
                window.matchMedia("(display-mode: standalone)").matches ||
                window.matchMedia("(display-mode: fullscreen)").matches ||
                window.matchMedia("(display-mode: minimal-ui)").matches ||
                (window.navigator as any).standalone === true;

            setIsStandalone(isStandaloneMode);
        };

        checkStandalone();

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.matchMedia("(display-mode: standalone)").addEventListener("change", checkStandalone);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.matchMedia("(display-mode: standalone)").removeEventListener("change", checkStandalone);
        };
    }, []);

    if (!mounted) return null;

    if (isStandalone) {
        return <>{children}</>;
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("Go to browser menu and click on Add to Home Screen to install the app.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full">
                {/* Logo/Icon placeholder */}
                <div className="w-24 h-24 bg-blue-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg">
                    <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Install GetWork
                </h1>
                <p className="text-gray-600 mb-8">
                    Install our app for the best experience. Access local jobs and workers instantly.
                </p>

                {isIOS ? (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4">How to install on iOS:</h3>
                        <ol className="text-left space-y-4 text-gray-700">
                            <li className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">1</span>
                                <span>Tap the <Share className="inline w-5 h-5 mx-1" /> Share button</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">2</span>
                                <span>Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span> <PlusSquare className="inline w-5 h-5 mx-1" /></span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">3</span>
                                <span>Confirm by tapping <span className="font-semibold">Add</span></span>
                            </li>
                        </ol>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Install App
                    </button>
                )}
            </div>
        </div>
    );
}
