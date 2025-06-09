import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Settings, 
  UserCheck,
  ClipboardList, 
  MessageSquare, 
  Eye,
  Shield,
  Wrench,
  PhoneCall,
  UserCog
} from 'lucide-react'

export interface MenuItem {
  icon: any
  label: string
  href?: string
  active?: boolean
  hasSubmenu?: boolean
}

export const getMenuItems = (activePage: string): MenuItem[] => [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/dashboard',
    active: activePage === 'dashboard'
  },
  { 
    icon: Users, 
    label: 'Riders', 
    href: '/riders',
    active: activePage === 'riders'
  },
  { 
    icon: Truck, 
    label: 'Vehicles',
    href: '/vehicles',
    active: activePage === 'vehicles'
  },
  { 
    icon: Wrench, 
    label: 'Garage',
    href: '/garage',
    active: activePage === 'garage'
  },
  { 
    icon: UserCheck, 
    label: 'Accounts', 
    hasSubmenu: true,
    active: activePage === 'accounts'
  },
  { 
    icon: UserCog, 
    label: 'Users', 
    href: '/admin/iam?tab=users',
    active: activePage === 'users'
  },
  { 
    icon: ClipboardList, 
    label: 'Job Tickets',
    href: '/job-tickets',
    active: activePage === 'job-tickets'
  },
  { 
    icon: PhoneCall, 
    label: 'Request & Complaints',
    href: '/requests',
    active: activePage === 'requests'
  },
  { 
    icon: Eye, 
    label: 'Acknowledgements',
    href: '/acknowledgements',
    active: activePage === 'acknowledgements'
  },
  { 
    icon: MessageSquare, 
    label: 'Chat',
    href: '/chat',
    active: activePage === 'chat'
  },
  { 
    icon: Shield, 
    label: 'IAM', 
    href: '/admin/iam',
    active: activePage === 'iam'
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: '/admin/settings',
    active: activePage === 'settings'
  }
]