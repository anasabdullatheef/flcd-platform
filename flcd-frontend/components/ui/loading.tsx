import { Truck } from 'lucide-react'

interface LoadingProps {
  message?: string
  className?: string
}

export function Loading({ message = 'Loading...', className = '' }: LoadingProps) {
  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Truck className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-black ${sizeClasses[size]} ${className}`} />
  )
}

export default Loading