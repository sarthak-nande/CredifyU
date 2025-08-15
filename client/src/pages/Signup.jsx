import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Fingerprint, ArrowLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import api from "@/utils/api"
import { toast } from "sonner"

export default function CollegeSignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Password validation logic
  const passwordRequirements = useMemo(() => {
    const password = formData.password
    return [
      {
        label: "At least 12 characters",
        met: password.length >= 12,
      },
      {
        label: "At least 1 alphabet character",
        met: /[a-zA-Z]/.test(password),
      },
      {
        label: "At least 3 digits",
        met: (password.match(/\d/g) || []).length >= 3,
      },
    ]
  }, [formData.password])

  const allRequirementsMet = passwordRequirements.every((req) => req.met)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!allRequirementsMet) {
      toast("Please meet all password requirements")
      return
    }

    if (!passwordsMatch) {
      toast("Passwords do not match")
      return
    }

    if (!formData.agreeToTerms) {
      toast("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    const res = await api.post("/api/signup",
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast("Signup successful!");
        setIsLoading(false)
        navigate("/college/login");
      }

    console.log("Signup attempt:", formData)

  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBackToHome = () => {
    navigate("/")
  }

  const handleNavigateToLogin = () => {
    navigate("/college/login")
  }

  const handleNavigateToTerms = () => {
    navigate("/terms")
  }

  const handleNavigateToPrivacy = () => {
    navigate("/privacy")
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

            <h1 className="text-3xl font-semibold mb-4">Join the digital credential revolution</h1>
            <p className="text-zinc-300 mb-8">
              Create your college account and start issuing verified digital credentials to your students today.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Secure credential issuance</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>Student record management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-white" />
                <span>QR-based verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Signup Form */}
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
                <CardTitle className="text-2xl font-semibold">Create College Account</CardTitle>
                <CardDescription>Set up your institution's digital credential portal</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Official Email Address</Label>
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
                        placeholder="Create a strong password"
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

                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        {passwordRequirements.map((requirement, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center gap-2 text-xs transition-colors",
                              requirement.met ? "text-green-700" : "text-zinc-500",
                            )}
                          >
                            {requirement.met ? (
                              <Check className="h-3 w-3 text-green-700" />
                            ) : (
                              <X className="h-3 w-3 text-zinc-400" />
                            )}
                            <span>{requirement.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-type your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                        className={cn(
                          "border-zinc-300 focus:border-black focus:ring-black pr-10",
                          formData.confirmPassword &&
                            !passwordsMatch &&
                            "border-red-300 focus:border-red-500 focus:ring-red-500",
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-zinc-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-zinc-500" />
                        )}
                      </Button>
                    </div>

                    {formData.confirmPassword && !passwordsMatch && (
                      <div className="flex items-center gap-2 text-xs text-red-600">
                        <X className="h-3 w-3" />
                        <span>Passwords do not match</span>
                      </div>
                    )}

                    {formData.confirmPassword && passwordsMatch && (
                      <div className="flex items-center gap-2 text-xs text-green-700">
                        <Check className="h-3 w-3" />
                        <span>Passwords match</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                      className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:border-black mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-zinc-600 leading-relaxed">
                      I agree to the{" "}
                      <span 
                        onClick={handleNavigateToTerms}
                        className="text-black hover:underline cursor-pointer"
                      >
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span 
                        onClick={handleNavigateToPrivacy}
                        className="text-black hover:underline cursor-pointer"
                      >
                        Privacy Policy
                      </span>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className={cn(
                      "w-full text-white transition-colors",
                      allRequirementsMet && passwordsMatch && formData.agreeToTerms
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-black hover:bg-zinc-900",
                    )}
                    disabled={isLoading || !allRequirementsMet || !passwordsMatch || !formData.agreeToTerms}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-zinc-600">Already have an account? </span>
                  <span 
                    onClick={handleNavigateToLogin}
                    className="text-black font-medium hover:underline cursor-pointer"
                  >
                    Sign in
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