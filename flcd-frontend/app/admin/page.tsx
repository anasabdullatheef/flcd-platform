'use client'

import { useEffect } from 'react'

export default function AdminPage() {
  useEffect(() => {
    // Redirect to IAM section by default
    window.location.href = '/admin/iam'
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to IAM...</p>
      </div>
    </div>
  )
}