"use client";
import { useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessCard() {
  const [notificationState, setNotificationState] = useState("hidden"); // "hidden", "success", "redirecting"

  const showNotification = () => {
    setNotificationState("success");

    setTimeout(() => {
      setNotificationState("redirecting");
    }, 2000);

    setTimeout(() => {
      window.location.href = "/student/saved-info";
    }, 5000);
  };

  return (
    <div className="">
      {/* Initial Button */}
      {notificationState === "hidden" && (
        <div className="w-full max-w-md text-center">
          <Button 
            onClick={showNotification} 
            className="flex-1 bg-black hover:bg-gray-800 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Move Forward
            <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      )}

      {/* Full-screen Background with Centered Card */}
      {notificationState !== "hidden" && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-in fade-in duration-500">
          <Card className="bg-white shadow-2xl border border-gray-200 w-[90%] max-w-sm text-center transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-8 space-y-6">
              {notificationState === "success" && (
                <>
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-200">
                    <CheckCircle className="h-10 w-10 text-black animate-pulse" />
                  </div>
                  <div className="animate-in slide-in-from-bottom-2 duration-500 delay-300">
                    <h3 className="text-xl font-bold text-black mb-2">Success!</h3>
                    <p className="text-gray-600">Your data has been saved</p>
                  </div>
                  {/* Animated dots */}
                  <div className="flex justify-center space-x-2 animate-in fade-in duration-500 delay-500">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </>
              )}

              {notificationState === "redirecting" && (
                <>
                  <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center animate-spin-slow">
                    <ArrowRight className="h-10 w-10 text-black animate-pulse" />
                  </div>
                  <div className="animate-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-xl font-bold text-black mb-2">Redirecting...</h3>
                    <p className="text-gray-600">Taking you to the next page</p>
                  </div>
                  {/* Animated progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-black h-3 rounded-full animate-pulse transition-all duration-1000 w-full relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                    </div>
                  </div>
                  {/* Floating particles effect */}
                  <div className="relative h-4">
                    <div className="absolute left-1/4 w-1 h-1 bg-black rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                    <div className="absolute right-1/4 w-1 h-1 bg-gray-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute left-1/2 w-1 h-1 bg-black rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}