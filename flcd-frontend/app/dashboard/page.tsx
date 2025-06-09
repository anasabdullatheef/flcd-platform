'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Settings, 
  ClipboardList, 
  MessageSquare, 
  UserCheck,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Eye
} from 'lucide-react'

interface JobTicket {
  id: string
  title: string
  priority: 'Low' | 'Medium' | 'High'
  assignee: string
  status: 'To Do' | 'In Progress' | 'On Hold' | 'Done'
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(true)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboards', active: true },
    { icon: Users, label: 'Riders', href: '/riders' },
    { icon: Truck, label: 'Vehicles' },
    { icon: Settings, label: 'Garage' },
    { icon: UserCheck, label: 'Accounts', hasSubmenu: true },
    { icon: ClipboardList, label: 'Job Tickets' },
    { icon: MessageSquare, label: 'Request & Complaints' },
    { icon: Eye, label: 'Acknowledgements' },
    { icon: MessageSquare, label: 'Chat' },
    { icon: Settings, label: 'Admin', href: '/admin' },
  ]

  const jobTickets: JobTicket[] = [
    {
      id: 'FLCR0001',
      title: 'AbhijithKaithankkool...',
      priority: 'Low',
      assignee: 'Super Admin',
      status: 'To Do'
    }
  ]

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/'
      return
    }

    fetch('http://localhost:3000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setUser(data.user)
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
      }
    })
    .catch(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/'
    })
    .finally(() => setIsLoading(false))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-black mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Home</span>
              <span>/</span>
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="flex items-center space-x-2"
              >
                <span className="text-sm text-gray-700">Notifications</span>
                <Bell className="h-5 w-5 text-gray-500" />
                {notificationsOpen ? 
                  <ChevronRight className="h-4 w-4 text-gray-400" /> : 
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                }
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          <div className={`grid gap-6 h-full transition-all duration-300 ${
            notificationsOpen ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {/* Map Section */}
            <div className={notificationsOpen ? "lg:col-span-2" : "col-span-1"}>
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                    {/* Mock Map */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Map View</p>
                        <p className="text-xs text-gray-400 mt-1">Rider locations will be displayed here</p>
                      </div>
                    </div>
                    
                    {/* Rider Info Cards */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <div className="bg-white rounded-lg p-2 shadow-sm border text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Careem - 5</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 shadow-sm border text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Talabat - 8</span>
                        </div>
                      </div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                        -
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications Panel */}
            {notificationsOpen && (
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setNotificationsOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 mt-8">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No Notification</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Floating Notifications Toggle - when closed */}
          {!notificationsOpen && (
            <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50">
              <Button
                onClick={() => setNotificationsOpen(true)}
                className="bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-lg"
                title="Open Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Job Tickets Section */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CardTitle className="text-lg">Job Tickets</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <select className="text-sm border border-gray-200 rounded px-2 py-1">
                      <option>Select Rider</option>
                    </select>
                  </div>
                  <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {/* To Do Column */}
                  <div>
                    <h3 className="font-medium mb-4 text-center">To Do</h3>
                    <div className="space-y-3">
                      {jobTickets.filter(ticket => ticket.status === 'To Do').map(ticket => (
                        <Card key={ticket.id} className="p-3 border border-gray-200">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate">{ticket.title}</h4>
                              <Button variant="ghost" size="sm" className="p-1 h-auto">
                                ⋯
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">{ticket.id}</p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                ticket.priority === 'Low' ? 'bg-green-100 text-green-700' :
                                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                ● {ticket.priority}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">Assignee: {ticket.assignee}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div>
                    <h3 className="font-medium mb-4 text-center">In Progress</h3>
                    <div className="text-center text-gray-400 text-sm mt-8">
                      No tickets
                    </div>
                  </div>

                  {/* On Hold Column */}
                  <div>
                    <h3 className="font-medium mb-4 text-center">On Hold</h3>
                    <div className="text-center text-gray-400 text-sm mt-8">
                      No tickets
                    </div>
                  </div>

                  {/* Done Column */}
                  <div>
                    <h3 className="font-medium mb-4 text-center">Done</h3>
                    <div className="text-center text-gray-400 text-sm mt-8">
                      No tickets
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}