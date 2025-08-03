import { Button } from '@/components/ui/button'
import React from 'react'

export default function Home() {
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
