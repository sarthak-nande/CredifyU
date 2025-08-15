import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Fingerprint, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/utils/api"
import { toast } from "sonner"

export default function OTPVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)

  // Get email and password from location state
  const { email, password } = location.state || {}

  useEffect(() => {
    // Redirect if no email/password provided
    if (!email || !password) {
      navigate("/college/signup")
      return
    }

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, password, navigate])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast("Please enter the complete 6-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post("/api/complete-signup", {
        email,
        password,
        otp: otpString
      }, { withCredentials: true })

      if (res.status === 200) {
        toast("Account created successfully!")
        document.location.href = "/college/dashboard" // Redirect to dashboard after successful signup
      }
    } catch (error) {
      console.error("OTP verification failed:", error)
      toast(error.response?.data?.message || "OTP verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    
    try {
      const res = await api.post("/api/send-otp", { email })
      
      if (res.status === 200) {
        toast("New OTP sent to your email")
        setTimeLeft(300) // Reset timer
        setCanResend(false)
        setOtp(["", "", "", "", "", ""]) // Clear current OTP
      }
    } catch (error) {
      toast("Failed to resend OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    navigate("/college/signup")
  }

  return (
    <main className="min-h-dvh w-full bg-white">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left side - Branding */}
        <div className="hidden bg-black text-white lg:flex lg:flex-col lg:justify-center lg:px-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="grid size-12 place-items-center rounded-xl bg-white text-black">
                <Fingerprint className="h-6 w-6" />
              </div>
              <span className="text-2xl font-semibold">CredifyU</span>
            </div>

            <h1 className="text-3xl font-semibold mb-4">Verify your email address</h1>
            <p className="text-zinc-300 mb-8">
              We've sent a 6-digit verification code to your email. Please enter it below to complete your account setup.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Enhanced security</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Email verification</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Account protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - OTP Form */}
        <div className="flex flex-col justify-center px-4 py-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile header */}
            <div className="mb-8 lg:hidden">
              <button 
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to signup
              </button>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-black text-white">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <span className="text-xl font-semibold">CredifyU</span>
              </div>
            </div>

            <Card className="border-0 shadow-none lg:border lg:shadow-sm">
              <CardHeader className="px-0 lg:px-6">
                <CardTitle className="text-2xl">Verify your email</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 lg:px-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <div className="flex gap-2 justify-center">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg font-medium"
                          placeholder="0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="text-center">
                    {timeLeft > 0 ? (
                      <p className="text-sm text-zinc-600">
                        Code expires in <span className="font-medium text-black">{formatTime(timeLeft)}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-red-600">Code has expired</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || otp.join("").length !== 6}
                  >
                    {isLoading ? "Verifying..." : "Verify & Create Account"}
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={!canResend || isResending}
                      className="text-sm text-zinc-600 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {isResending && <RefreshCw className="h-3 w-3 animate-spin" />}
                      {canResend ? "Resend verification code" : "Resend code"}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
