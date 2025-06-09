'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  Save,
  User,
  FileText,
  Trash2,
  Eye
} from 'lucide-react'

interface Rider {
  id: string
  riderCode: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  nationality?: string
  dateOfBirth?: string
  passportNumber?: string
  passportExpiry?: string
  emiratesId?: string
  emiratesIdExpiry?: string
  licenseNumber?: string
  licenseExpiry?: string
  companySim?: string
  emergencyPhone?: string
  languageSpoken?: string
  cityOfWork?: string
  joiningDate?: string
  profilePicture?: string
  bloodGroup?: string
  insurancePartner?: string
  insuranceExpiry?: string
  healthNotes?: string
  adminNotes?: string
  employeeId?: string
  deliveryPartner?: string
  deliveryPartnerId?: string
  employmentStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
  onboardingStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  partnerName?: string
  partnerCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function EditRiderPage() {
  const params = useParams()
  const router = useRouter()
  const riderId = params.id as string

  const [rider, setRider] = useState<Rider | null>(null)
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    passport: null,
    emiratesId: null,
    license: null,
    workPermit: null,
    insurance: null,
    profilePicture: null,
    otherDocuments: null
  })
  
  const [existingDocuments, setExistingDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationality: '',
    emiratesId: '',
    passportNumber: '',
    visaNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    employmentStatus: 'PENDING',
    onboardingStatus: 'PENDING',
    partnerName: '',
    partnerCode: '',
    isActive: true,
    // Additional fields
    passportExpiry: '',
    emiratesIdExpiry: '',
    companySim: '',
    languageSpoken: '',
    cityOfWork: '',
    joiningDate: '',
    bloodGroup: '',
    insurancePartner: '',
    insuranceExpiry: '',
    healthNotes: '',
    adminNotes: '',
    employeeId: '',
    deliveryPartner: '',
    deliveryPartnerId: ''
  })

  useEffect(() => {
    fetchRider()
    fetchDocuments()
  }, [riderId])

  const fetchRider = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:3000/api/riders/${riderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRider(data.rider)
        
        // Update form data with rider information
        setFormData({
          firstName: data.rider.firstName || '',
          lastName: data.rider.lastName || '',
          email: data.rider.email || '',
          phone: data.rider.phone || '',
          dateOfBirth: data.rider.dateOfBirth ? new Date(data.rider.dateOfBirth).toISOString().split('T')[0] : '',
          nationality: data.rider.nationality || '',
          emiratesId: data.rider.emiratesId || '',
          passportNumber: data.rider.passportNumber || '',
          visaNumber: data.rider.visaNumber || '',
          licenseNumber: data.rider.licenseNumber || '',
          licenseExpiry: data.rider.licenseExpiry ? new Date(data.rider.licenseExpiry).toISOString().split('T')[0] : '',
          emergencyContact: data.rider.emergencyContact || '',
          emergencyPhone: data.rider.emergencyPhone || '',
          address: data.rider.address || '',
          employmentStatus: data.rider.employmentStatus || 'PENDING',
          onboardingStatus: data.rider.onboardingStatus || 'PENDING',
          partnerName: data.rider.partnerName || '',
          partnerCode: data.rider.partnerCode || '',
          isActive: data.rider.isActive !== false,
          // Additional fields
          passportExpiry: data.rider.passportExpiry ? new Date(data.rider.passportExpiry).toISOString().split('T')[0] : '',
          emiratesIdExpiry: data.rider.emiratesIdExpiry ? new Date(data.rider.emiratesIdExpiry).toISOString().split('T')[0] : '',
          companySim: data.rider.companySim || '',
          languageSpoken: data.rider.languageSpoken || '',
          cityOfWork: data.rider.cityOfWork || '',
          joiningDate: data.rider.joiningDate ? new Date(data.rider.joiningDate).toISOString().split('T')[0] : '',
          bloodGroup: data.rider.bloodGroup || '',
          insurancePartner: data.rider.insurancePartner || '',
          insuranceExpiry: data.rider.insuranceExpiry ? new Date(data.rider.insuranceExpiry).toISOString().split('T')[0] : '',
          healthNotes: data.rider.healthNotes || '',
          adminNotes: data.rider.adminNotes || '',
          employeeId: data.rider.employeeId || '',
          deliveryPartner: data.rider.deliveryPartner || '',
          deliveryPartnerId: data.rider.deliveryPartnerId || ''
        })
      } else {
        console.error('Failed to fetch rider')
      }
    } catch (error) {
      console.error('Error fetching rider:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:3000/api/documents/riders/${riderId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setExistingDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:3000/api/documents/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setExistingDocuments(prev => prev.filter(doc => doc.id !== documentId))
        alert('Document deleted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error deleting document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:3000/api/riders/${riderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Upload any new documents
        const documentsToUpload = Object.entries(documents).filter(([key, file]) => file !== null)
        
        if (documentsToUpload.length > 0) {
          const documentFormData = new FormData()
          
          documentsToUpload.forEach(([key, file]) => {
            if (file) {
              documentFormData.append(key, file)
            }
          })

          const documentResponse = await fetch(`http://localhost:3000/api/documents/riders/${riderId}/documents`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: documentFormData
          })

          if (!documentResponse.ok) {
            const documentError = await documentResponse.json()
            alert(`Document upload failed: ${documentError.error || 'Unknown error'}`)
          } else {
            alert('Documents uploaded successfully!')
          }
        }

        alert('Rider updated successfully!')
        router.push(`/riders/${riderId}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating rider')
      }
    } catch (error) {
      console.error('Error updating rider:', error)
      alert('Error updating rider')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading rider details...</p>
        </div>
      </div>
    )
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Rider not found</p>
          <Button onClick={() => router.push('/riders')} className="mt-4">
            Back to Riders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/riders/${riderId}`)}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Profile</span>
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/riders/${riderId}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-black hover:bg-gray-800 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Rider: {rider.firstName} {rider.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Status */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Status Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employment Status
                      </label>
                      <select
                        value={formData.employmentStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, employmentStatus: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="TERMINATED">Terminated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onboarding Status
                      </label>
                      <select
                        value={formData.onboardingStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, onboardingStatus: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Rider is active
                      </label>
                    </div>
                  </div>
                </div>

                {/* Document Management */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Document Management</h3>
                  
                  {/* Existing Documents */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-3">Current Documents</h4>
                    {loadingDocuments ? (
                      <p className="text-gray-500">Loading documents...</p>
                    ) : existingDocuments.length > 0 ? (
                      <div className="space-y-2">
                        {existingDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">{doc.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {doc.type.replace('_', ' ')} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteDocument(doc.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No documents uploaded yet.</p>
                    )}
                  </div>

                  {/* Upload New Documents */}
                  <div>
                    <h4 className="text-md font-medium mb-3">Upload New Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Passport
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setDocuments(prev => ({ ...prev, passport: file }))
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emirates ID
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setDocuments(prev => ({ ...prev, emiratesId: file }))
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      {/* Add more document upload fields as needed */}
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}