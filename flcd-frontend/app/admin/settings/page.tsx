'use client'

import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  Mail, 
  Plus, 
  Edit2, 
  Trash2, 
  TestTube, 
  CheckCircle, 
  XCircle,
  Star,
  StarOff,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getMenuItems } from '@/lib/menuConfig'

interface EmailConfiguration {
  id: string
  host: string
  port: number
  secure: boolean
  username: string
  fromEmail: string
  fromName: string
  isActive: boolean
  isDefault: boolean
  testEmail?: string
  lastTested?: string
  testResult?: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

interface EmailConfigForm {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
  testEmail: string
  isDefault: boolean
}

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [emailConfigurations, setEmailConfigurations] = useState<EmailConfiguration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<EmailConfiguration | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testingConfigId, setTestingConfigId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = getMenuItems('settings')

  const [formData, setFormData] = useState<EmailConfigForm>({
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'FLCD Platform',
    testEmail: '',
    isDefault: false
  })

  useEffect(() => {
    fetchProfile()
    fetchEmailConfigurations()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.getProfile()
      if (response.data?.user) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const fetchEmailConfigurations = async () => {
    try {
      const response = await apiClient.get('/api/email-config')
      if (response.data?.emailConfigurations) {
        setEmailConfigurations(response.data.emailConfigurations)
      }
    } catch (error) {
      console.error('Failed to fetch email configurations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingConfig 
        ? `/api/email-config/${editingConfig.id}`
        : '/api/email-config'
      
      const method = editingConfig ? 'put' : 'post'
      
      const response = await apiClient[method](url, formData)
      
      if (response.data) {
        await fetchEmailConfigurations()
        setShowForm(false)
        setEditingConfig(null)
        resetForm()
        alert(editingConfig ? 'Email configuration updated successfully!' : 'Email configuration created successfully!')
      } else {
        alert(response.error || 'Failed to save email configuration')
      }
    } catch (error) {
      console.error('Failed to save email configuration:', error)
      alert('Failed to save email configuration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (config: EmailConfiguration) => {
    setEditingConfig(config)
    setFormData({
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: '', // Don't pre-fill password for security
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      testEmail: config.testEmail || '',
      isDefault: config.isDefault
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email configuration?')) {
      return
    }

    try {
      const response = await apiClient.delete(`/api/email-config/${id}`)
      if (response.data) {
        await fetchEmailConfigurations()
        alert('Email configuration deleted successfully!')
      } else {
        alert(response.error || 'Failed to delete email configuration')
      }
    } catch (error) {
      console.error('Failed to delete email configuration:', error)
      alert('Failed to delete email configuration')
    }
  }

  const handleTest = async (id: string, testEmail: string) => {
    if (!testEmail) {
      alert('Please provide a test email address')
      return
    }

    setIsTesting(true)
    setTestingConfigId(id)

    try {
      const response = await apiClient.post(`/api/email-config/${id}/test`, { testEmail })
      
      if (response.data?.testResult?.success) {
        alert(`Test email sent successfully to ${testEmail}!`)
      } else {
        alert(`Test failed: ${response.data?.testResult?.error || response.error}`)
      }
      
      await fetchEmailConfigurations()
    } catch (error) {
      console.error('Failed to test email configuration:', error)
      alert('Failed to test email configuration')
    } finally {
      setIsTesting(false)
      setTestingConfigId(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await apiClient.post(`/api/email-config/${id}/set-default`)
      if (response.data) {
        await fetchEmailConfigurations()
        alert('Email configuration set as default successfully!')
      } else {
        alert(response.error || 'Failed to set as default')
      }
    } catch (error) {
      console.error('Failed to set default email configuration:', error)
      alert('Failed to set as default')
    }
  }

  const resetForm = () => {
    setFormData({
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromEmail: '',
      fromName: 'FLCD Platform',
      testEmail: '',
      isDefault: false
    })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingConfig(null)
    resetForm()
  }

  const handleLogout = () => {
    apiClient.logout()
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <Settings className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'} hidden md:flex`}>
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
                  {user?.firstName?.[0] || 'A'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Super Admin</p>
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
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'} - Super Admin
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-black">FLCD</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <nav className="space-y-1">
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant={item.active ? "default" : "ghost"}
                      className={`w-full justify-start px-3 ${
                        item.active ? 'bg-black text-white hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (item.href) {
                          window.location.href = item.href
                        }
                        setMobileMenuOpen(false)
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.hasSubmenu && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </Button>
                  ))}
                </nav>
              </div>

              {/* Mobile User Profile */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0] || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">Super Admin</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="p-1"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>IAM</span>
                  <span>/</span>
                  <span>Settings</span>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                      <Settings className="h-8 w-8" />
                      <span>Settings</span>
                    </h1>
                    <p className="text-gray-600 mt-2">Manage system configurations and settings</p>
                  </div>
                </div>
              </div>

          {/* Email Configuration Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                      Configure SMTP settings for sending emails (OTP, notifications, etc.)
                    </CardDescription>
                  </div>
                </div>
                
                {!showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Configuration</span>
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {showForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingConfig ? 'Edit Email Configuration' : 'Add New Email Configuration'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Host *
                        </label>
                        <input
                          type="text"
                          value={formData.host}
                          onChange={(e) => setFormData({...formData, host: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="smtp.gmail.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Port *
                        </label>
                        <input
                          type="number"
                          value={formData.port}
                          onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="587"
                          required
                          min="1"
                          max="65535"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="your-email@gmail.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={editingConfig ? "Enter new password" : "App password or SMTP password"}
                          required={!editingConfig}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Email *
                        </label>
                        <input
                          type="email"
                          value={formData.fromEmail}
                          onChange={(e) => setFormData({...formData, fromEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="noreply@flcd.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={formData.fromName}
                          onChange={(e) => setFormData({...formData, fromName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="FLCD Platform"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Test Email
                        </label>
                        <input
                          type="email"
                          value={formData.testEmail}
                          onChange={(e) => setFormData({...formData, testEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="test@example.com"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.secure}
                            onChange={(e) => setFormData({...formData, secure: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Use SSL/TLS</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Set as Default</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>{editingConfig ? 'Update Configuration' : 'Save Configuration'}</span>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Email Configurations List */}
              {emailConfigurations.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Configurations</h3>
                  <p className="text-gray-500 mb-4">
                    Add an email configuration to enable sending emails (OTP, notifications, etc.)
                  </p>
                  {!showForm && (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Configuration</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {emailConfigurations.map((config) => (
                    <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {config.host}:{config.port}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {config.isDefault && (
                                <Badge variant="default" className="bg-blue-500">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                              {config.isActive && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">From:</span> {config.fromName} &lt;{config.fromEmail}&gt;
                            </div>
                            <div>
                              <span className="font-medium">Username:</span> {config.username}
                            </div>
                            <div>
                              <span className="font-medium">Security:</span> {config.secure ? 'SSL/TLS' : 'STARTTLS'}
                            </div>
                            <div>
                              <span className="font-medium">Created by:</span> {config.creator.firstName} {config.creator.lastName}
                            </div>
                          </div>

                          {config.lastTested && (
                            <div className="flex items-center space-x-2 text-sm">
                              {config.testResult?.includes('Success') ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-gray-600">
                                Last tested: {new Date(config.lastTested).toLocaleString()}
                              </span>
                              {config.testResult && (
                                <span className="text-gray-500">- {config.testResult}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <input
                            type="email"
                            placeholder="test@example.com"
                            className="px-3 py-1 border border-gray-300 rounded text-sm w-40"
                            id={`test-email-${config.id}`}
                            defaultValue={config.testEmail}
                          />
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const input = document.getElementById(`test-email-${config.id}`) as HTMLInputElement
                              handleTest(config.id, input.value)
                            }}
                            disabled={isTesting && testingConfigId === config.id}
                            className="flex items-center space-x-1"
                          >
                            {isTesting && testingConfigId === config.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                            ) : (
                              <TestTube className="h-3 w-3" />
                            )}
                            <span>Test</span>
                          </Button>

                          {!config.isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(config.id)}
                              className="flex items-center space-x-1"
                            >
                              <Star className="h-3 w-3" />
                              <span>Set Default</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(config)}
                            className="flex items-center space-x-1"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(config.id)}
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}