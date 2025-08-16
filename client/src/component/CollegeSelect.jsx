"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import api from "@/utils/api"
import { useDispatch } from "react-redux"
import { setCollegeId } from "@/redux/collegeSlice"
import { Navigate, useNavigate } from "react-router-dom"
import { ForwardIcon, ArrowLeft } from "lucide-react"
import Header from "./Header"



export default function CollegeSelect() {
    const [colleges, setColleges] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCollege, setSelectedCollege] = useState("")
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check user role
    const role = localStorage.getItem("role");
    const isAuthority = role === "authority" || role === "third-party-authority";

    const handleBack = () => {
        navigate(-1);
    };

    // Service Worker helper function
    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/college-service-worker.js');
                console.log('College Service Worker registered:', registration);
                return registration;
            } catch (error) {
                console.error('College Service Worker registration failed:', error);
                return null;
            }
        }
        return null;
    };

    // Fetch colleges using Service Worker for authority users
    const fetchCollegesViaServiceWorker = async () => {
        try {
            const registration = await registerServiceWorker();
            if (!registration) {
                console.log('Service Worker not available, falling back to direct API');
                throw new Error('Service Worker not available');
            }

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            return new Promise((resolve, reject) => {
                const messageChannel = new MessageChannel();
                
                // Set timeout for service worker response
                const timeout = setTimeout(() => {
                    reject(new Error('Service Worker timeout'));
                }, 10000); // 10 second timeout
                
                messageChannel.port1.onmessage = (event) => {
                    clearTimeout(timeout);
                    const { type, data, error } = event.data;
                    
                    if (type === 'COLLEGE_DATA_SUCCESS') {
                        // Store in localStorage for authority users
                        localStorage.setItem('authority-college-data', JSON.stringify(data));
                        localStorage.setItem('authority-college-data-timestamp', Date.now().toString());
                        console.log('Authority user: College data stored in localStorage');
                        resolve(data);
                    } else if (type === 'COLLEGE_DATA_ERROR') {
                        reject(new Error(error));
                    }
                };

                navigator.serviceWorker.controller?.postMessage(
                    {
                        type: 'FETCH_COLLEGE_DATA',
                        payload: {
                            baseURL: window.location.origin
                        }
                    },
                    [messageChannel.port2]
                );
            });
        } catch (error) {
            console.error('Service Worker fetch failed:', error);
            throw error;
        }
    };

    // Fallback function to fetch via regular API
    const fetchCollegesViaAPI = async () => {
        console.log('Fetching colleges via regular API');
        const response = await api.get('/api/college-names', {
            withCredentials: true
        });
        
        if (response.status !== 200) {
            throw new Error('Failed to fetch colleges');
        }
        
        return response.data;
    };    // Check localStorage for cached data (authority users)
    const getCachedCollegeData = () => {
        if (!isAuthority) return null;

        try {
            const cachedData = localStorage.getItem('authority-college-data');
            const timestamp = localStorage.getItem('authority-college-data-timestamp');

            if (cachedData && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds

                if (age < maxAge) {
                    console.log('Authority user: Using cached college data from localStorage');
                    return JSON.parse(cachedData);
                } else {
                    // Clear expired data
                    localStorage.removeItem('authority-college-data');
                    localStorage.removeItem('authority-college-data-timestamp');
                }
            }
        } catch (error) {
            console.error('Error reading cached college data:', error);
        }

        return null;
    };

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                if (isAuthority) {
                    console.log('Authority user detected - using Service Worker approach');

                    // Check for cached data first
                    const cachedData = getCachedCollegeData();
                    if (cachedData && cachedData.colleges) {
                        setColleges(cachedData.colleges);
                        setLoading(false);
                        return;
                    }

                    // Try Service Worker first, fallback to regular API
                    try {
                        const data = await fetchCollegesViaServiceWorker();
                        setColleges(data.colleges);
                    } catch (swError) {
                        console.warn('Service Worker failed, falling back to regular API:', swError.message);
                        const data = await fetchCollegesViaAPI();
                        setColleges(data.colleges);
                        
                        // Store in localStorage even when using fallback
                        localStorage.setItem('authority-college-data', JSON.stringify(data));
                        localStorage.setItem('authority-college-data-timestamp', Date.now().toString());
                    }
                } else {
                    // Regular API call for non-authority users
                    console.log('Regular user - using direct API call');
                    const data = await fetchCollegesViaAPI();
                    setColleges(data.colleges);
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch colleges:", error);
                setLoading(false);
            }
        };

        fetchColleges();
    }, [isAuthority])

    const handleCollegeSelect = (value) => {
        setSelectedCollege(value)
        const selectedCollegeName = colleges.find((college) => college.id.toString() === value)?.name;
        const collegeId = colleges.find((college) => college.id.toString() === value)?.id;
        dispatch(setCollegeId(collegeId));
        console.log("Selected college:", selectedCollegeName)
    }

    // Clear cache function for authority users
    const clearCache = async () => {
        if (!isAuthority) return;

        try {
            // Clear localStorage
            localStorage.removeItem('authority-college-data');
            localStorage.removeItem('authority-college-data-timestamp');

            // Clear Service Worker cache
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const messageChannel = new MessageChannel();
                navigator.serviceWorker.controller.postMessage(
                    { type: 'CLEAR_COLLEGE_CACHE' },
                    [messageChannel.port2]
                );
            }

            console.log('Authority user: Cache cleared');

            // Reload data with fallback
            setLoading(true);
            setColleges([]);

            try {
                const data = await fetchCollegesViaServiceWorker();
                setColleges(data.colleges);
            } catch (swError) {
                console.warn('Service Worker failed during cache refresh, using regular API:', swError.message);
                const data = await fetchCollegesViaAPI();
                setColleges(data.colleges);
                
                // Store in localStorage even when using fallback
                localStorage.setItem('authority-college-data', JSON.stringify(data));
                localStorage.setItem('authority-college-data-timestamp', Date.now().toString());
            }
            setLoading(false);
        } catch (error) {
            console.error('Error clearing cache:', error);
            setLoading(false);
        }
    };

    // Check if data is from cache
    const isDataFromCache = () => {
        if (!isAuthority) return false;
        const cachedData = localStorage.getItem('authority-college-data');
        return !!cachedData;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4 p-4">
                <div className="w-full max-w-sm">
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )
    }

    return (
        <>
        <Header title="CredifyU" subtitle="Store and verify student identities" showBackButton={true} onBack={handleBack} />
            <div className="flex flex-col items-center justify-center h-screen space-y-4 p-4">
                <h1 className="text-2xl font-bold mb-4">Select Your College</h1>

                {/* Authority user indicator */}
                {isAuthority && (
                    <div className="w-full max-w-sm p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-700">
                                🔧 Authority Mode: {isDataFromCache() ? 'Using cached data' : 'Fresh data loaded'}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearCache}
                                disabled={loading}
                                className="text-xs"
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>
                )}

                <div className="w-full max-w-sm space-y-4">
                    <Select value={selectedCollege} onValueChange={handleCollegeSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                        <SelectContent>
                            {colleges.map((college) => (
                                <SelectItem key={college.id} value={college.id.toString()}>
                                    {college.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedCollege && (
                        <p className="text-sm text-muted-foreground">
                            Selected: {colleges.find((c) => c.id.toString() === selectedCollege)?.name}
                        </p>
                    )}

                    <Button
                        className="w-full"
                        disabled={!selectedCollege}
                        onClick={() => { navigate("/student/scanner") }}
                    >
                        Next<ForwardIcon className="ml-2" />
                    </Button>
                </div>
            </div>
        </>
    )
}
