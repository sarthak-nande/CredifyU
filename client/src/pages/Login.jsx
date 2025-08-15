import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Eye, EyeOff, Fingerprint, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { loginFailure, loginStart, loginSuccess, setProfileComplete } from "../redux/userSlice"
import api from "../utils/api"
import { toast } from "sonner"

export default function CollegeLoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      dispatch(loginStart())
      
      const res = await api.post("/api/login", { 
        email: formData.email, 
        password: formData.password 
      })

      const data = await res.data

      if (res.status === 200) { 
        dispatch(loginSuccess(data))
        dispatch(setProfileComplete(data.user.isProfileComplete))
        
        toast("Login successful!", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "black",
            color: "white",
          },
        })
        
        navigate("/college/dashboard")
      } else {
        dispatch(loginFailure(data.message))
      }
    } catch (err) {
      dispatch(loginFailure(err.message))
      toast.error(err?.response?.data?.message || "Login Failed", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#ef4444",
          color: "white",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBackToHome = () => {
    navigate("/")
  }

  const handleNavigateToSignup = () => {
    navigate("/college/signup")
  }

  const handleNavigateToForgotPassword = () => {
    navigate("/college/forgot-password")
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

            <h1 className="text-3xl font-semibold mb-4">Welcome back to your college portal</h1>
            <p className="text-zinc-300 mb-8">
              Manage student credentials, issue verified documents, and streamline your institution's digital identity
              processes.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Issue verified student credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Manage institutional records</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Secure document verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex flex-col justify-center px-4 py-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile header */}
            <div className="mb-8 lg:hidden">
              <button 
                onClick={handleBackToHome}
                className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-black cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </button>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-black text-white">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <span className="text-xl font-semibold">CredifyU</span>
              </div>
            </div>

            <Card className="border-zinc-200 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold">College Login</CardTitle>
                <CardDescription>Enter your credentials to access your institution portal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@college.edu"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="border-zinc-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="border-zinc-300 focus:border-black focus:ring-black pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-zinc-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-zinc-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange("rememberMe", checked)}
                        className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                      <Label htmlFor="remember" className="text-sm text-zinc-600">
                        Remember me
                      </Label>
                    </div>
                    <span 
                      onClick={handleNavigateToForgotPassword}
                      className="text-sm text-black hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-zinc-900 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-zinc-600">Don't have an account? </span>
                  <span 
                    onClick={handleNavigateToSignup}
                    className="text-black font-medium hover:underline cursor-pointer"
                  >
                    Sign up
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}