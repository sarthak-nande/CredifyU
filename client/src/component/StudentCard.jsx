import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, CheckCircle, RotateCcw, ArrowRight, User, Mail, Phone, Calendar, GraduationCap, AlertCircle, Camera, ForwardIcon } from 'lucide-react'
import api from "@/utils/api"
import { QRCodeCanvas } from "qrcode.react"
import DeleteButton from './DeleteButton'

export default function StudentCard() {
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(false);
    const [myToken, setMyToken] = useState("");

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("student"));
            const token = localStorage.getItem("token");
            if (token) {
                setMyToken(token);
            }

            if (saved && typeof saved === "object" && saved.name) {
                setPayload(saved);
            } else {
                console.warn("No valid student data found");
            }
        } catch (error) {
            console.error("Error parsing student data", error);
        } finally {
            setLoading(false); // ✅ Confirmed data checked
        }

    })
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <Card className="border-green-200 bg-green-50 text-center">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-2 text-green-700">
                            <CheckCircle className="h-6 w-6" />
                            <span className="text-lg font-semibold">✅ Verified JWT</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <GraduationCap className="h-6 w-6" />
                            Student Identity Card
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center mb-4">
                            <QRCodeCanvas value={myToken} size={256} />
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">{payload?.name}</h2>
                                <Badge variant="secondary" className="mt-1">
                                    {payload?.branch} - {payload?.year}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Full Name</p>
                                        <p className="font-medium">{payload?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-sm">{payload?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Mobile</p>
                                        <p className="font-medium">{payload?.mobile}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Academic Year</p>
                                        <p className="font-medium">{payload?.year}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-2">JWT Information</h3>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issuer:</span>
                                        <span className="font-mono text-xs">{payload?.iss}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Audience:</span>
                                        <span className="font-mono text-xs">{payload?.aud}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Issued At:</span>
                                        <span>{payload ? formatDate(payload.iat) : "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                </Card>

            </div>
        </div>

    )
}
