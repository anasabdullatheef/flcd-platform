'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Heart,
  Shield,
  Truck,
  Settings,
  Eye,
  Download
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

interface Document {
  id: string
  type: string
  fileName: string
  fileUrl: string
  status: string
  uploadedAt: string
}

interface Acknowledgement {
  id: string
  type: 'VISA' | 'SIM' | 'EQUIPMENT' | 'TRAINING' | 'OTHER'
  acknowledgement_description: string
  fileName: string
  filePath: string
  fileType: string
  isPreSigned: boolean
  createdAt: string
  updatedAt: string
  admin: {
    firstName: string
    lastName: string
  }
}

export default function RiderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const riderId = params.id as string

  const [rider, setRider] = useState<Rider | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [loadingAcknowledgements, setLoadingAcknowledgements] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchRider()
    fetchDocuments()
  }, [riderId])

  const fetchRider = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:4000/api/riders/${riderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRider(data.rider)
        // Extract acknowledgements if they exist
        if (data.rider.generatedAcknowledgements) {
          setAcknowledgements(data.rider.generatedAcknowledgements)
        }
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
      const response = await fetch(`http://localhost:4000/api/documents/riders/${riderId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const updateAcknowledgementStatus = async (ackId: string, status: 'PENDING' | 'ACKNOWLEDGED') => {
    try {
      setLoadingAcknowledgements(true)
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:4000/api/riders/${riderId}/acknowledgements/${ackId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Refresh acknowledgements
        fetchRider()
        alert(`Acknowledgement marked as ${status.toLowerCase()}`)
      } else {
        console.error('Failed to update acknowledgement status')
        alert('Failed to update acknowledgement status')
      }
    } catch (error) {
      console.error('Error updating acknowledgement status:', error)
      alert('Error updating acknowledgement status')
    } finally {
      setLoadingAcknowledgements(false)
    }
  }

  const downloadAcknowledgement = async (ackId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      
      // Try direct download first (for backend port 4000)
      const downloadUrl = `http://localhost:4000/api/riders/${riderId}/acknowledgements/${ackId}/download`
      
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error downloading acknowledgement:', error)
      alert('Error downloading acknowledgement')
    }
  }

  const deleteRider = async () => {
    if (!confirm('Are you sure you want to delete this rider?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:4000/api/riders/${riderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        alert('Rider deleted successfully!')
        router.push('/riders')
      } else {
        const error = await response.json()
        alert(error.error || 'Error deleting rider')
      }
    } catch (error) {
      console.error('Error deleting rider:', error)
      alert('Error deleting rider')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading rider profile...</p>
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'vehicle', label: 'Vehicle', icon: Truck },
    { id: 'traffic-fine', label: 'Traffic Fine', icon: Shield },
    { id: 'salary', label: 'Salary', icon: Settings },
    { id: 'loan', label: 'Loan', icon: FileText },
    { id: 'acknowledgements', label: 'Acknowledgements', icon: Eye }
  ]

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
                onClick={() => router.push('/riders')}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <span>/</span>
              <span>Rider</span>
              <span>/</span>
              <span className="text-gray-900">{rider.riderCode}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="destructive"
                onClick={deleteRider}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Rider</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/riders/${riderId}/edit`)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Rider</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Rider Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Profile Picture */}
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                    {rider.profilePicture ? (
                      <img 
                        src={rider.profilePicture} 
                        alt={`${rider.firstName} ${rider.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {rider.firstName} {rider.lastName}
                    </h1>
                    <div className="flex items-center space-x-6 mt-2 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{rider.riderCode}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{rider.cityOfWork || 'Dubai'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{rider.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{rider.riderCode}</div>
                    <div className="text-sm text-gray-500">Username</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{rider.deliveryPartner || 'Talabat'}</div>
                    <div className="text-sm text-gray-500">Partner</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{rider.deliveryPartnerId || rider.riderCode}</div>
                    <div className="text-sm text-gray-500">Partner ID</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 mt-6">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Return sim</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Assign tools</span>
                </Button>
                <Button className="bg-black hover:bg-gray-800 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Operational task</span>
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900 font-medium">{rider.firstName} {rider.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Passport Number</label>
                    <p className="text-gray-900 font-medium">{rider.passportNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emirates ID</label>
                    <p className="text-gray-900 font-medium">{rider.emiratesId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Number</label>
                    <p className="text-gray-900 font-medium">{rider.licenseNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Language Spoken</label>
                    <p className="text-gray-900 font-medium">{rider.languageSpoken || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 font-medium">{rider.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nationality</label>
                    <p className="text-gray-900 font-medium">{rider.nationality || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Passport Expiry Date</label>
                    <p className="text-gray-900 font-medium">
                      {rider.passportExpiry ? new Date(rider.passportExpiry).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">License Expiry Date</label>
                    <p className="text-gray-900 font-medium">
                      {rider.licenseExpiry ? new Date(rider.licenseExpiry).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joining Date</label>
                    <p className="text-gray-900 font-medium">
                      {rider.joiningDate ? new Date(rider.joiningDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Health Information</span>
                </CardTitle>
                <CardDescription>
                  Rider Health Information refers to the personal health details of the rider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900 font-medium">{rider.bloodGroup || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance Partner</label>
                    <p className="text-gray-900 font-medium">{rider.insurancePartner || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance Number</label>
                    <p className="text-gray-900 font-medium">{rider.employeeId || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Insurance Expiry Date</label>
                    <p className="text-gray-900 font-medium">
                      {rider.insuranceExpiry ? new Date(rider.insuranceExpiry).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Health Condition</label>
                    <p className="text-gray-900">{rider.healthNotes || 'No health conditions reported'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDocuments ? (
                  <p className="text-gray-500">Loading documents...</p>
                ) : documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium">{doc.type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                              className="p-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = doc.fileUrl
                                link.download = doc.fileName
                                link.click()
                              }}
                              className="p-1"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                            doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Acknowledgements Tab */}
        {activeTab === 'acknowledgements' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span>Acknowledgements</span>
              </CardTitle>
              <CardDescription>
                Generated acknowledgements for visa, SIM, and other documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAcknowledgements ? (
                <p className="text-gray-500">Loading acknowledgements...</p>
              ) : acknowledgements.length > 0 ? (
                <div className="space-y-4">
                  {acknowledgements.map((ack) => (
                    <div key={ack.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            ack.isPreSigned ? 'bg-yellow-400' : 'bg-green-400'
                          }`} />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {ack.type} Acknowledgement
                            </h3>
                            <p className="text-sm text-gray-500">
                              Generated by {ack.admin.firstName} {ack.admin.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            ack.isPreSigned 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {ack.isPreSigned ? 'Pending' : 'Acknowledged'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Description:</p>
                        <p className="text-gray-900">{ack.acknowledgement_description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <p>File: {ack.fileName}</p>
                          <p>Created: {new Date(ack.createdAt).toLocaleDateString()}</p>
                          {!ack.isPreSigned && (
                            <p>Updated: {new Date(ack.updatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {ack.isPreSigned ? (
                            <Button
                              onClick={() => updateAcknowledgementStatus(ack.id, 'ACKNOWLEDGED')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={loadingAcknowledgements}
                            >
                              Mark as Acknowledged
                            </Button>
                          ) : (
                            <Button
                              onClick={() => updateAcknowledgementStatus(ack.id, 'PENDING')}
                              variant="outline"
                              size="sm"
                              disabled={loadingAcknowledgements}
                            >
                              Mark as Pending
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadAcknowledgement(ack.id, ack.fileName)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No acknowledgements generated yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Acknowledgements will appear here when generated during rider creation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'overview' && activeTab !== 'acknowledgements' && (
          <Card>
            <CardHeader>
              <CardTitle>{tabs.find(tab => tab.id === activeTab)?.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Content for {activeTab} tab coming soon...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}