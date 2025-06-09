'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Settings,
  Eye,
  Check,
  X,
  Search,
  UserPlus,
  Key,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Activity,
  LayoutDashboard,
  Truck,
  ClipboardList,
  MessageSquare,
  UserCheck,
  LogOut
} from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  isActive: boolean
  userCount: number
  permissions: string[]
  createdAt: string
  updatedAt: string
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

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface UserRole {
  id: string
  userId: string
  roleId: string
  role: Role
}

interface Module {
  name: string
  permissions: string[]
}

interface SystemModules {
  [key: string]: Module
}

type AdminTab = 'overview' | 'roles' | 'users' | 'access'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [modules, setModules] = useState<SystemModules>({})
  const [presetRoles, setPresetRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Modals
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedRoleData, setSelectedRoleData] = useState<Role | null>(null)
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null)

  // Fetch data
  useEffect(() => {
    fetchCurrentUser()
    fetchRoles()
    fetchUsers()
    fetchModules()
  }, [])

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

  const canManageRoles = (): boolean => {
    if (!currentUser) return false
    
    // Only Super Admin can manage roles
    const userRoles = currentUser.userRoles || []
    return userRoles.some(ur => ur.role.name === 'Super Admin')
  }

  const canManageUsers = (): boolean => {
    return hasPermission('users:update') || hasPermission('users.write')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboards', href: '/dashboard' },
    { icon: Users, label: 'Riders' },
    { icon: Truck, label: 'Vehicles' },
    { icon: Settings, label: 'Garage' },
    { icon: UserCheck, label: 'Accounts', hasSubmenu: true },
    { icon: ClipboardList, label: 'Job Tickets' },
    { icon: MessageSquare, label: 'Request & Complaints' },
    { icon: Eye, label: 'Acknowledgements' },
    { icon: MessageSquare, label: 'Chat' },
    { icon: Shield, label: 'Admin', active: true, href: '/admin' },
  ]

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/roles')
      const data = await response.json()
      if (response.ok) {
        setRoles(data.roles)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users')
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/roles/modules')
      const data = await response.json()
      if (response.ok) {
        setModules(data.modules)
        setPresetRoles(data.presetRoles)
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const initializePresetRoles = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/roles/initialize-presets', {
        method: 'POST'
      })
      if (response.ok) {
        fetchRoles()
        alert('Preset roles initialized successfully!')
      }
    } catch (error) {
      console.error('Error initializing preset roles:', error)
      alert('Error initializing preset roles')
    }
  }

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`http://localhost:3000/api/roles/${roleId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchRoles()
        alert('Role deleted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error deleting role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Error deleting role')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchUsers()
        alert('User deleted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error deleting user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  // Filter data
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || user.roles.some(role => role.name === selectedRole)
    
    return matchesSearch && matchesRole
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Check if user has any admin access
  const hasAnyAdminAccess = currentUser && (
    hasPermission('users:read') || 
    hasPermission('settings:read') || 
    hasPermission('users.read') ||
    hasPermission('settings.read') ||
    (currentUser.userRoles && currentUser.userRoles.some(ur => ur.role.name === 'Super Admin'))
  )

  if (!hasAnyAdminAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Button onClick={() => window.location.href = '/dashboard'} className="bg-black hover:bg-gray-800">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'roles', label: 'Role Management', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'access', label: 'Access Control', icon: Key },
  ]

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
          <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage roles, users, and system access</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
        {activeTab === 'overview' && <OverviewTab roles={roles} users={users} modules={modules} />}
        {activeTab === 'roles' && (
          <RoleManagementTab
            roles={filteredRoles}
            modules={modules}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onCreateRole={() => setShowCreateRoleModal(true)}
            onEditRole={(role: Role) => {
              setSelectedRoleData(role)
              setShowEditRoleModal(true)
            }}
            onDeleteRole={deleteRole}
            onInitializePresets={initializePresetRoles}
            canManageRoles={canManageRoles()}
          />
        )}
        {activeTab === 'users' && (
          <UserManagementTab
            users={filteredUsers}
            roles={roles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            onCreateUser={() => setShowCreateUserModal(true)}
            onEditUser={(user: User) => {
              setSelectedUserData(user)
              setShowEditUserModal(true)
            }}
            onDeleteUser={deleteUser}
            canManageUsers={canManageUsers()}
          />
        )}
          {activeTab === 'access' && <AccessControlTab roles={roles} modules={modules} />}
        </div>
      </div>

      {/* Modals */}
      {showCreateRoleModal && (
        <CreateRoleModal 
          modules={modules}
          onClose={() => setShowCreateRoleModal(false)}
          onSuccess={() => {
            fetchRoles()
            setShowCreateRoleModal(false)
          }}
        />
      )}

      {showEditRoleModal && selectedRoleData && (
        <EditRoleModal 
          role={selectedRoleData}
          modules={modules}
          onClose={() => {
            setShowEditRoleModal(false)
            setSelectedRoleData(null)
          }}
          onSuccess={() => {
            fetchRoles()
            setShowEditRoleModal(false)
            setSelectedRoleData(null)
          }}
        />
      )}

      {showCreateUserModal && (
        <CreateUserModal 
          roles={roles}
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={() => {
            fetchUsers()
            setShowCreateUserModal(false)
          }}
        />
      )}

      {showEditUserModal && selectedUserData && (
        <EditUserModal 
          user={selectedUserData}
          roles={roles}
          onClose={() => {
            setShowEditUserModal(false)
            setSelectedUserData(null)
          }}
          onSuccess={() => {
            fetchUsers()
            setShowEditUserModal(false)
            setSelectedUserData(null)
          }}
        />
      )}
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ roles, users, modules }: { roles: Role[], users: User[], modules: SystemModules }) {
  const activeRoles = roles.filter(r => r.isActive)
  const activeUsers = users.filter(u => u.isActive)
  const totalPermissions = Object.values(modules).reduce((sum, module) => sum + module.permissions.length, 0)

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
                <p className="text-sm text-green-600">{activeUsers.length} active</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold">{roles.length}</p>
                <p className="text-sm text-green-600">{activeRoles.length} active</p>
              </div>
              <Shield className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System Modules</p>
                <p className="text-3xl font-bold">{Object.keys(modules).length}</p>
                <p className="text-sm text-gray-500">{totalPermissions} permissions</p>
              </div>
              <Settings className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">User Assignments</p>
                <p className="text-3xl font-bold">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
                <p className="text-sm text-gray-500">role assignments</p>
              </div>
              <Activity className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{user.firstName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.roles.length} role{user.roles.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
            <CardDescription>User count by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{role.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{role.userCount}</span>
                    <Users className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Role Management Tab Component
function RoleManagementTab({ 
  roles, 
  modules, 
  searchTerm, 
  setSearchTerm, 
  onCreateRole, 
  onEditRole, 
  onDeleteRole, 
  onInitializePresets,
  canManageRoles
}: any) {
  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {canManageRoles && (
            <>
              <Button onClick={onCreateRole} className="bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
              <Button variant="outline" onClick={onInitializePresets}>
                <Settings className="h-4 w-4 mr-2" />
                Initialize Preset Roles
              </Button>
            </>
          )}
          {!canManageRoles && (
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
              <Shield className="h-4 w-4 inline mr-2" />
              View-only access - Contact admin to manage roles
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles ({roles.length})</CardTitle>
          <CardDescription>Manage system roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Users</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Permissions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role: Role) => (
                  <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {role.description || 'No description'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{role.userCount}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {role.permissions.length} permissions
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        role.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {role.isActive ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {canManageRoles && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canManageRoles && role.name !== 'Super Admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!canManageRoles && (
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
        </CardContent>
      </Card>
    </div>
  )
}

// User Management Tab Component
function UserManagementTab({ 
  users, 
  roles, 
  searchTerm, 
  setSearchTerm, 
  selectedRole, 
  setSelectedRole, 
  onCreateUser, 
  onEditUser, 
  onDeleteUser,
  canManageUsers
}: any) {
  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {canManageUsers && (
            <Button onClick={onCreateUser} className="bg-black hover:bg-gray-800">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          )}
          {!canManageUsers && (
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
              <Users className="h-4 w-4 inline mr-2" />
              View-only access - Contact admin to manage users
            </div>
          )}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              {roles.map((role: Role) => (
                <option key={role.id} value={role.name}>{role.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
          <CardDescription>Manage system users and their role assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Roles</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{user.firstName[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {canManageUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canManageUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!canManageUsers && (
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
        </CardContent>
      </Card>
    </div>
  )
}

// Access Control Tab Component
function AccessControlTab({ roles, modules }: { roles: Role[], modules: SystemModules }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Access Matrix</CardTitle>
          <CardDescription>Overview of role permissions across system modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  {Object.entries(modules).map(([moduleKey, module]) => (
                    <th key={moduleKey} className="text-center py-3 px-2 font-medium text-gray-700">
                      <div className="text-xs">{module.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{role.name}</div>
                      <div className="text-xs text-gray-500">{role.permissions.length} permissions</div>
                    </td>
                    {Object.entries(modules).map(([moduleKey, module]) => {
                      const modulePermissions = module.permissions.filter(p => role.permissions.includes(p))
                      const hasRead = modulePermissions.some(p => p.endsWith('.read'))
                      const hasWrite = modulePermissions.some(p => p.endsWith('.write'))
                      const hasDelete = modulePermissions.some(p => p.endsWith('.delete'))
                      
                      return (
                        <td key={moduleKey} className="py-3 px-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <span className={`w-2 h-2 rounded-full ${hasRead ? 'bg-green-500' : 'bg-gray-200'}`} title="Read" />
                            <span className={`w-2 h-2 rounded-full ${hasWrite ? 'bg-yellow-500' : 'bg-gray-200'}`} title="Write" />
                            <span className={`w-2 h-2 rounded-full ${hasDelete ? 'bg-red-500' : 'bg-gray-200'}`} title="Delete" />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{modulePermissions.length}</div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Read</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Write</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Delete</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Modal Components (CreateRoleModal, EditRoleModal, CreateUserModal, EditUserModal)
// These would be the same as before, but I'll include CreateUserModal for completeness

function CreateUserModal({ roles, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    roleIds: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        alert('User created successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error creating user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
    }
  }

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id: string) => id !== roleId)
        : [...prev.roleIds, roleId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New User</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Roles
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {roles.map((role: Role) => (
                <label key={role.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Include the other modal components from the previous implementation
function CreateRoleModal({ modules, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        alert('Role created successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error creating role')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Error creating role')
    }
  }

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p: string) => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const toggleModulePermissions = (modulePermissions: string[], allSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p: string) => !modulePermissions.includes(p))
        : [...Array.from(new Set([...prev.permissions, ...modulePermissions]))]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Role</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Permissions
            </label>
            <div className="space-y-4">
              {Object.entries(modules).map(([moduleKey, module]: [string, any]) => {
                const modulePermissions = module.permissions
                const selectedCount = modulePermissions.filter((p: string) => formData.permissions.includes(p)).length
                const allSelected = selectedCount === modulePermissions.length

                return (
                  <div key={moduleKey} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{module.name}</h4>
                        <span className="text-sm text-gray-500">({selectedCount}/{modulePermissions.length})</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleModulePermissions(modulePermissions, allSelected)}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {modulePermissions.map((permission: string) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Create Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditRoleModal({ role, modules, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description || '',
    permissions: role.permissions || [],
    isActive: role.isActive
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`http://localhost:3000/api/roles/${role.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        alert('Role updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role')
    }
  }

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p: string) => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const toggleModulePermissions = (modulePermissions: string[], allSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p: string) => !modulePermissions.includes(p))
        : [...Array.from(new Set([...prev.permissions, ...modulePermissions]))]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Role: {role.name}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={role.name === 'Super Admin'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
              disabled={role.name === 'Super Admin'}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Role is active
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Permissions
            </label>
            <div className="space-y-4">
              {Object.entries(modules).map(([moduleKey, module]: [string, any]) => {
                const modulePermissions = module.permissions
                const selectedCount = modulePermissions.filter((p: string) => formData.permissions.includes(p)).length
                const allSelected = selectedCount === modulePermissions.length

                return (
                  <div key={moduleKey} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{module.name}</h4>
                        <span className="text-sm text-gray-500">({selectedCount}/{modulePermissions.length})</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleModulePermissions(modulePermissions, allSelected)}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {modulePermissions.map((permission: string) => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Update Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditUserModal({ user, roles, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    email: user.email,
    phone: user.phone || '',
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    roleIds: user.roles.map((role: Role) => role.id)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSuccess()
        alert('User updated successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id: string) => id !== roleId)
        : [...prev.roleIds, roleId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit User: {user.firstName} {user.lastName}</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActiveEdit"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700">
              User is active
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Roles
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {roles.map((role: Role) => (
                <label key={role.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-black hover:bg-gray-800">
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}