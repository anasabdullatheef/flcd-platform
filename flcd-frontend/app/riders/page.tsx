'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Upload,
  Download,
  FileText,
  Users,
  Eye
} from 'lucide-react'
import { getMenuItems } from '@/lib/menuConfig'

interface Rider {
  id: string
  riderCode: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  nationality?: string
  employmentStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
  onboardingStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  partnerName?: string
  partnerCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  documents: {
    id: string
    type: string
    status: string
  }[]
  _count: {
    acknowledgments: number
    vehicleAssignments: number
  }
}

interface User {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  isActive: boolean
  roles: Role[]
  permissions: Permission[]
  userRoles?: UserRole[]
  createdAt: string
  updatedAt: string
}

interface Role {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

interface UserRole {
  id: string
  userId: string
  roleId: string
  role: Role
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState('all')
  const [selectedPartner, setSelectedPartner] = useState('all')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modals
  const [showCreateRiderModal, setShowCreateRiderModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showEditRiderModal, setShowEditRiderModal] = useState(false)
  const [selectedRiderData, setSelectedRiderData] = useState<Rider | null>(null)

  const menuItems = getMenuItems('riders')

  useEffect(() => {
    fetchCurrentUser()
    fetchRiders()
  }, [currentPage, searchTerm, selectedStatus, selectedEmploymentStatus, selectedPartner])

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/'
        return
      }

      const response = await fetch('http://localhost:3000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok && data.user) {
        setCurrentUser(data.user)
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      window.location.href = '/'
    }
  }

  const fetchRiders = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedEmploymentStatus !== 'all') params.append('employmentStatus', selectedEmploymentStatus)
      if (selectedPartner !== 'all') params.append('partnerName', selectedPartner)

      const response = await fetch(`http://localhost:5000/api/riders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setRiders(data.riders || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching riders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false
    
    // Super Admin has all permissions
    const userRoles = currentUser.userRoles || []
    if (userRoles.some(ur => ur.role.name === 'Super Admin')) {
      return true
    }
    
    // Check if user has the specific permission (handle both dot and colon notation)
    const permissions = currentUser.permissions || []
    const permissionNames = permissions.map(p => p.name)
    
    // Convert dot notation to colon notation for checking
    const colonPermission = permission.replace('.', ':')
    const dotPermission = permission.replace(':', '.')
    
    return permissionNames.includes(permission) || 
           permissionNames.includes(colonPermission) || 
           permissionNames.includes(dotPermission)
  }

  const canManageRiders = (): boolean => {
    return hasPermission('riders.write')
  }

  const canUpdateRiders = (): boolean => {
    return hasPermission('riders.write')
  }

  const canDeleteRiders = (): boolean => {
    return hasPermission('riders.delete')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
  }

  const deleteRider = async (riderId: string) => {
    if (!confirm('Are you sure you want to delete this rider?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/api/riders/${riderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        fetchRiders()
        alert('Rider deleted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error deleting rider')
      }
    } catch (error) {
      console.error('Error deleting rider:', error)
      alert('Error deleting rider')
    }
  }

  const downloadCSVTemplate = () => {
    const link = document.createElement('a')
    link.href = 'http://localhost:5000/api/riders/template'
    link.download = 'rider_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string, type: 'onboarding' | 'employment') => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    
    if (type === 'onboarding') {
      switch (status) {
        case 'PENDING':
          return `${baseClasses} bg-yellow-100 text-yellow-700`
        case 'IN_PROGRESS':
          return `${baseClasses} bg-blue-100 text-blue-700`
        case 'COMPLETED':
          return `${baseClasses} bg-green-100 text-green-700`
        case 'REJECTED':
          return `${baseClasses} bg-red-100 text-red-700`
        default:
          return `${baseClasses} bg-gray-100 text-gray-700`
      }
    } else {
      switch (status) {
        case 'PENDING':
          return `${baseClasses} bg-yellow-100 text-yellow-700`
        case 'ACTIVE':
          return `${baseClasses} bg-green-100 text-green-700`
        case 'SUSPENDED':
          return `${baseClasses} bg-orange-100 text-orange-700`
        case 'TERMINATED':
          return `${baseClasses} bg-red-100 text-red-700`
        default:
          return `${baseClasses} bg-gray-100 text-gray-700`
      }
    }
  }

  // Filter data
  const filteredRiders = riders

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading riders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 flex-1">
          <div className="flex items-center justify-between mb-8">
            {!sidebarCollapsed && (
              <h1 className="text-2xl font-bold text-black">FLCD</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start transition-all duration-200 ${sidebarCollapsed ? 'px-2' : 'px-3'} ${
                    item.active ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (item.href) {
                      window.location.href = item.href
                    }
                  }}
                >
                  <item.icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.hasSubmenu && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                
                {/* Tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} group relative`}>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUser?.firstName?.[0] || 'A'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.firstName || 'Admin'} {currentUser?.lastName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser?.userRoles?.[0]?.role?.name || 'Admin'}
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            
            {/* Tooltip for collapsed sidebar */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {currentUser?.firstName || 'Admin'} {currentUser?.lastName || 'User'} - {currentUser?.userRoles?.[0]?.role?.name || 'Admin'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-3xl font-bold text-black">Rider Management</h1>
          <p className="text-gray-600 mt-1">Manage riders, onboarding, and documents</p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {canManageRiders() && (
                  <>
                    <Button 
                      onClick={() => setShowCreateRiderModal(true)} 
                      className="bg-black hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Rider
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBulkUploadModal(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={downloadCSVTemplate}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV Template
                    </Button>
                  </>
                )}
                {!canManageRiders() && (
                  <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                    <Users className="h-4 w-4 inline mr-2" />
                    View-only access - Contact admin to manage riders
                  </div>
                )}
              </div>

              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>

                {/* Employment Status Filter */}
                <div className="relative">
                  <select
                    value={selectedEmploymentStatus}
                    onChange={(e) => setSelectedEmploymentStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white text-sm"
                  >
                    <option value="all">All Employment</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search riders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Riders Table */}
            <Card>
              <CardHeader>
                <CardTitle>Riders ({filteredRiders.length})</CardTitle>
                <CardDescription>Manage rider profiles and onboarding status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Rider</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Partner</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Documents</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRiders.map((rider) => (
                        <tr key={rider.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">{rider.firstName[0]}</span>
                              </div>
                              <div>
                                <button
                                  onClick={() => window.location.href = `/riders/${rider.id}`}
                                  className="font-medium text-gray-900 hover:text-black hover:underline text-left"
                                >
                                  {rider.firstName} {rider.lastName}
                                </button>
                                <div className="text-sm text-gray-500">{rider.riderCode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {rider.email && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600">{rider.email}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{rider.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-2">
                              <span className={getStatusBadge(rider.onboardingStatus, 'onboarding')}>
                                {rider.onboardingStatus.replace('_', ' ')}
                              </span>
                              <br />
                              <span className={getStatusBadge(rider.employmentStatus, 'employment')}>
                                {rider.employmentStatus}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {rider.partnerName ? (
                              <div>
                                <div className="text-sm font-medium">{rider.partnerName}</div>
                                {rider.partnerCode && (
                                  <div className="text-xs text-gray-500">{rider.partnerCode}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{rider.documents.length}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(rider.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              {canUpdateRiders() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRiderData(rider)
                                    setShowEditRiderModal(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDeleteRiders() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteRider(rider.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              {!canUpdateRiders() && !canDeleteRiders() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled
                                  title="View only"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals will be implemented next */}
      {showCreateRiderModal && (
        <CreateRiderModal 
          onClose={() => setShowCreateRiderModal(false)}
          onSuccess={() => {
            fetchRiders()
            setShowCreateRiderModal(false)
          }}
        />
      )}

      {showBulkUploadModal && (
        <BulkUploadModal 
          onClose={() => setShowBulkUploadModal(false)}
          onSuccess={() => {
            fetchRiders()
            setShowBulkUploadModal(false)
          }}
        />
      )}

      {showEditRiderModal && selectedRiderData && (
        <EditRiderModal 
          rider={selectedRiderData}
          onClose={() => {
            setShowEditRiderModal(false)
            setSelectedRiderData(null)
          }}
          onSuccess={() => {
            fetchRiders()
            setShowEditRiderModal(false)
            setSelectedRiderData(null)
          }}
        />
      )}
    </div>
  )
}

// Create Rider Modal Component
function CreateRiderModal({ onClose, onSuccess }: any) {
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    passport: null,
    emiratesId: null,
    license: null,
    workPermit: null,
    insurance: null,
    profilePicture: null,
    otherDocuments: null
  });

  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    nationality: '',
    dateOfBirth: '',
    
    // Identity & Compliance
    passportNumber: '',
    passportExpiry: '',
    emiratesId: '',
    emiratesIdExpiry: '',
    licenseNumber: '',
    licenseExpiry: '',
    
    // Contact Numbers
    companySim: '',
    emergencyPhone: '',
    
    // Other Info
    languageSpoken: '',
    cityOfWork: '',
    joiningDate: '',
    profilePicture: '',
    bloodGroup: '',
    insurancePartner: '',
    insuranceExpiry: '',
    healthNotes: '',
    adminNotes: '',
    
    // Partner & Employment
    employeeId: '',
    deliveryPartner: '',
    deliveryPartnerId: '',
    
    // Status & Legacy
    employmentStatus: 'PENDING',
    address: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    alert('=== FORM SUBMISSION STARTED ===')
    console.log('=== FORM SUBMISSION STARTED ===')
    console.log('Form data:', formData)
    console.log('Documents state:', documents)
    
    try {
      const token = localStorage.getItem('accessToken')
      console.log('Token:', token ? 'Present' : 'Missing')
      
      // First, create the rider
      alert('Creating rider...')
      console.log('Creating rider...')
      const riderResponse = await fetch('http://localhost:5000/api/riders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!riderResponse.ok) {
        const error = await riderResponse.json()
        alert(error.error || 'Error creating rider')
        return
      }

      const riderData = await riderResponse.json()
      const riderId = riderData.rider.id
      alert(`Rider created with ID: ${riderId}`)

      // Then upload documents if any
      const documentsToUpload = Object.entries(documents).filter(([key, file]) => file !== null)
      
      console.log('Documents to upload:', documentsToUpload)
      alert(`Found ${documentsToUpload.length} documents to upload`)
      
      if (documentsToUpload.length > 0) {
        const documentFormData = new FormData()
        
        documentsToUpload.forEach(([fieldName, file]) => {
          if (file) {
            console.log(`Appending ${fieldName}:`, file.name)
            documentFormData.append(fieldName, file)
          }
        })

        alert('Starting document upload...')
        console.log('Uploading documents to rider:', riderId)

        const documentResponse = await fetch(`http://localhost:5000/api/documents/riders/${riderId}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: documentFormData
        })

        const documentResult = await documentResponse.json()
        console.log('Document upload response:', documentResult)

        if (!documentResponse.ok) {
          console.error('Document upload failed:', documentResult)
          alert(`Document upload failed: ${documentResult.error || 'Unknown error'}`)
        } else {
          console.log('Documents uploaded successfully:', documentResult)
          alert('Documents uploaded successfully!')
        }
      } else {
        console.log('No documents selected for upload')
        alert('No documents were selected for upload')
      }

      onSuccess()
      alert('Rider created successfully!')
    } catch (error) {
      console.error('Error creating rider:', error)
      alert('Error creating rider: ' + (error as any).message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Rider</h2>
          <Button variant="ghost" onClick={onClose}>
            <Plus className="h-5 w-5 rotate-45" />
          </Button>
        </div>

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


          {/* Document Uploads */}
          <div>
            <h3 className="text-lg font-medium mb-4">Document Uploads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    console.log('Passport file selected:', file);
                    alert(`Passport file selected: ${file ? file.name : 'No file'}`);
                    if (file) {
                      setDocuments(prev => ({ ...prev, passport: file }));
                      console.log('Updated documents state with passport');
                      alert('Documents state updated with passport');
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
                    const file = e.target.files?.[0];
                    console.log('Emirates ID file selected:', file);
                    alert(`Emirates ID file selected: ${file ? file.name : 'No file'}`);
                    if (file) {
                      setDocuments(prev => ({ ...prev, emiratesId: file }));
                      console.log('Updated documents state with Emirates ID');
                      alert('Documents state updated with Emirates ID');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocuments(prev => ({ ...prev, license: file }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Permit
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocuments(prev => ({ ...prev, workPermit: file }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocuments(prev => ({ ...prev, insurance: file }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Documents
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setDocuments(prev => ({ ...prev, otherDocuments: files[0] }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Create Rider
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Bulk Upload Modal Component
function BulkUploadModal({ onClose, onSuccess }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    
    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('csvFile', file)

      const response = await fetch('http://localhost:5000/api/riders/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results)
        if (data.results.successful > 0) {
          onSuccess()
        }
      } else {
        alert(data.error || 'Error uploading file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Bulk Upload Riders</h2>
          <Button variant="ghost" onClick={onClose}>
            <Plus className="h-5 w-5 rotate-45" />
          </Button>
        </div>

        <div className="space-y-6">
          {!results && (
            <>
              <div className="text-sm text-gray-600">
                <p>Upload a CSV file with rider information. Make sure to follow the template format.</p>
                <p className="mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = 'http://localhost:3000/api/riders/template'
                      link.download = 'rider_template.csv'
                      link.click()
                    }}
                    className="text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {file ? file.name : 'Choose a CSV file or drag and drop'}
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Results</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-800 font-medium">Successful</div>
                  <div className="text-2xl font-bold text-green-900">{results.successful}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-800 font-medium">Failed</div>
                  <div className="text-2xl font-bold text-red-900">{results.failed}</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Errors ({results.errors.length})</h4>
                  <div className="max-h-64 overflow-y-auto border rounded-lg">
                    {results.errors.slice(0, 10).map((error: any, index: number) => (
                      <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                        <div className="text-sm font-medium">Row {error.row}</div>
                        <div className="text-sm text-red-600">{error.error}</div>
                      </div>
                    ))}
                    {results.errors.length > 10 && (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        And {results.errors.length - 10} more errors...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {results ? 'Close' : 'Cancel'}
            </Button>
            {!results && (
              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="bg-black hover:bg-gray-800"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Rider Modal Component
function EditRiderModal({ rider, onClose, onSuccess }: any) {
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    passport: null,
    emiratesId: null,
    license: null,
    workPermit: null,
    insurance: null,
    profilePicture: null,
    otherDocuments: null
  });
  
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const [formData, setFormData] = useState({
    firstName: rider.firstName || '',
    lastName: rider.lastName || '',
    email: rider.email || '',
    phone: rider.phone || '',
    dateOfBirth: rider.dateOfBirth ? new Date(rider.dateOfBirth).toISOString().split('T')[0] : '',
    nationality: rider.nationality || '',
    emiratesId: rider.emiratesId || '',
    passportNumber: rider.passportNumber || '',
    visaNumber: rider.visaNumber || '',
    licenseNumber: rider.licenseNumber || '',
    licenseExpiry: rider.licenseExpiry ? new Date(rider.licenseExpiry).toISOString().split('T')[0] : '',
    emergencyContact: rider.emergencyContact || '',
    emergencyPhone: rider.emergencyPhone || '',
    address: rider.address || '',
    employmentStatus: rider.employmentStatus || 'PENDING',
    onboardingStatus: rider.onboardingStatus || 'PENDING',
    partnerName: rider.partnerName || '',
    partnerCode: rider.partnerCode || '',
    isActive: rider.isActive !== false,
    // Additional fields that might be missing
    passportExpiry: rider.passportExpiry ? new Date(rider.passportExpiry).toISOString().split('T')[0] : '',
    emiratesIdExpiry: rider.emiratesIdExpiry ? new Date(rider.emiratesIdExpiry).toISOString().split('T')[0] : '',
    companySim: rider.companySim || '',
    languageSpoken: rider.languageSpoken || '',
    cityOfWork: rider.cityOfWork || '',
    joiningDate: rider.joiningDate ? new Date(rider.joiningDate).toISOString().split('T')[0] : '',
    bloodGroup: rider.bloodGroup || '',
    insurancePartner: rider.insurancePartner || '',
    insuranceExpiry: rider.insuranceExpiry ? new Date(rider.insuranceExpiry).toISOString().split('T')[0] : '',
    healthNotes: rider.healthNotes || '',
    adminNotes: rider.adminNotes || '',
    employeeId: rider.employeeId || '',
    deliveryPartner: rider.deliveryPartner || '',
    deliveryPartnerId: rider.deliveryPartnerId || ''
  })

  // Fetch existing documents when modal opens
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`http://localhost:5000/api/documents/riders/${rider.id}/documents`, {
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

    fetchDocuments()
  }, [rider.id])

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/api/documents/documents/${documentId}`, {
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
    
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`http://localhost:5000/api/riders/${rider.id}`, {
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
          
          documentsToUpload.forEach(([fieldName, file]) => {
            if (file) {
              documentFormData.append(fieldName, file)
            }
          })

          const documentResponse = await fetch(`http://localhost:3000/api/documents/riders/${rider.id}/documents`, {
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

        onSuccess()
        alert('Rider updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating rider')
      }
    } catch (error) {
      console.error('Error updating rider:', error)
      alert('Error updating rider')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Rider: {rider.firstName} {rider.lastName}</h2>
          <Button variant="ghost" onClick={onClose}>
            <Plus className="h-5 w-5 rotate-45" />
          </Button>
        </div>

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
                  Nationality
                </label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
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
            </div>
          </div>

          {/* Identity & Compliance */}
          <div>
            <h3 className="text-lg font-medium mb-4">Identity & Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Expiry
                </label>
                <input
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emirates ID
                </label>
                <input
                  type="text"
                  value={formData.emiratesId}
                  onChange={(e) => setFormData(prev => ({ ...prev, emiratesId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emirates ID Expiry
                </label>
                <input
                  type="date"
                  value={formData.emiratesIdExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, emiratesIdExpiry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Expiry
                </label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Contact Numbers */}
          <div>
            <h3 className="text-lg font-medium mb-4">Contact Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company SIM Number
                </label>
                <input
                  type="tel"
                  value={formData.companySim}
                  onChange={(e) => setFormData(prev => ({ ...prev, companySim: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Other Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Other Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language Spoken
                </label>
                <input
                  type="text"
                  value={formData.languageSpoken}
                  onChange={(e) => setFormData(prev => ({ ...prev, languageSpoken: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City of Work
                </label>
                <input
                  type="text"
                  value={formData.cityOfWork}
                  onChange={(e) => setFormData(prev => ({ ...prev, cityOfWork: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocuments(prev => ({ ...prev, profilePicture: file }));
                      setFormData(prev => ({ ...prev, profilePicture: file.name }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Partner
                </label>
                <input
                  type="text"
                  value={formData.insurancePartner}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurancePartner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Notes
                </label>
                <textarea
                  value={formData.healthNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, healthNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Partner & Employment */}
          <div>
            <h3 className="text-lg font-medium mb-4">Partner & Employment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Partner
                </label>
                <select
                  value={formData.deliveryPartner}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryPartner: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Select Partner</option>
                  <option value="Talabat">Talabat</option>
                  <option value="Careem">Careem</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Partner ID
                </label>
                <input
                  type="text"
                  value={formData.deliveryPartnerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryPartnerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Status Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocuments(prev => ({ ...prev, passport: file }));
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
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocuments(prev => ({ ...prev, emiratesId: file }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocuments(prev => ({ ...prev, license: file }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Permit
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocuments(prev => ({ ...prev, workPermit: file }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocuments(prev => ({ ...prev, insurance: file }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Documents
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDocuments(prev => ({ ...prev, otherDocuments: file }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Update Rider
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}