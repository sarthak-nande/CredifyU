import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate()
  useEffect(() => {
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (isPWA || isMobile) {
      navigate("/user/select-role"); // Your PWA first page
    } else {
      navigate("/"); // Desktop landing page
    }
  }, [navigate]);
  return (
    <div>
        <h1>Welcome to the Home Page</h1>
        <p>This is the home page of your application.</p>
        <p>Feel free to customize this page as per your requirements.</p>
        <Button className="bg-blue-500 text-white hover:bg-blue-600" onClick={() => window.location.href = '/login'}>
            login
        </Button>
        <Button className="bg-green-500 text-white hover:bg-green-600" onClick={() => window.location.href = '/register'}>
            Register
        </Button>
    </div>
  )
}
