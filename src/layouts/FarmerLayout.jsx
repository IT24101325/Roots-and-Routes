import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, clearUser, getInitials } from '../utils/userSession';
import PageTransition from '../components/PageTransition';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Star,
    Bell,
    Menu,
    LogOut,
    Leaf,
    ChevronLeft,
    PlusCircle,
    BarChart3,
    Boxes
} from 'lucide-react';

const API = 'http://localhost:5001';

const FarmerLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [badges, setBadges] = useState({ sales: 0, reviews: 0 });
    const navigate = useNavigate();
    const user = getUser();
    const farmerName = user?.name || 'Farmer';
    const farmLabel = user?.farm_location || user?.crops_produced || 'My Farm';
    const initials = getInitials(farmerName);

    useEffect(() => {
        const fetchCounts = async () => {
            if (!user?.id) return;
            try {
                // Fetch unread notifications
                const notifRes = await fetch(`${API}/api/farmer/notifications?farmer_id=${user.id}`);
                const notifData = await notifRes.json();
                if (notifData.success) {
                    setUnreadCount(notifData.unreadCount || 0);
                }

                // Fetch sidebar badges
                const badgeRes = await fetch(`${API}/api/farmer/sidebar-badges?farmer_id=${user.id}`);
                const badgeData = await badgeRes.json();
                if (badgeData.success) {
                    setBadges(badgeData.badges);
                }
            } catch (err) {
                console.error('Error fetching farmer counts:', err);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleLogout = () => {
        clearUser();
        navigate('/login');
    };

    const navItems = [
        { path: '/farmer/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/farmer/products', name: 'Products', icon: Package },
        { path: '/farmer/sales', name: 'Sales', icon: BarChart3 },
        { path: '/farmer/inventory', name: 'Inventory', icon: Boxes },
        { path: '/farmer/reviews', name: 'Reviews', icon: Star },
        { path: '/farmer/notifications', name: 'Notifications', icon: Bell },
    ];

    return (
        <div className="app-container">
            {/* Dynamic Sidebar */}
            <div className={`sidebar admin-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '80px' : '260px', transition: 'width 0.3s' }}>
                <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <Leaf className="logo-icon flex-shrink-0" size={28} />
                        {!collapsed && <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--white)', whiteSpace: 'nowrap' }}>Farmer Portal</h2>}
                    </div>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                    >
                        {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <div className="sidebar-nav" style={{ overflowY: 'auto' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {!collapsed && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>
                                    {item.name === 'Notifications' && unreadCount > 0 && (
                                        <span style={badgeStyle}>{unreadCount}</span>
                                    )}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button className="btn btn-outline" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }} onClick={handleLogout}>
                        <LogOut size={20} className="flex-shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Navbar */}
                <div className="admin-topbar">
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem', width: '50%' }}>
                        <input type="text" placeholder="Global Search (Products, Orders, Reviews)..." className="form-control" style={{ width: '100%' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div 
                            style={{ position: 'relative', cursor: 'pointer' }}
                            onClick={() => navigate('/farmer/notifications')}
                        >
                            <Bell size={24} color="var(--text-muted)" />
                            {unreadCount > 0 && (
                                <div style={topBadgeStyle}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </div>

                        <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => navigate('/farmer/profile')}
                        >
                            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {initials}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{farmerName}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{farmLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="main-content" style={{ backgroundColor: '#F4F7F4' }}>
                    <PageTransition>
                        <Outlet />
                    </PageTransition>
                </div>
            </div>
        </div>
    );
};

const badgeStyle = { 
    backgroundColor: 'var(--danger)', 
    color: 'white', 
    borderRadius: '99px', 
    padding: '2px 8px', 
    fontSize: '0.7rem', 
    fontWeight: 'bold',
    marginLeft: 'auto'
};

const topBadgeStyle = { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    minWidth: 18, 
    height: 18, 
    backgroundColor: 'var(--danger)', 
    color: 'white', 
    borderRadius: '50%', 
    border: '2px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: 'bold'
};

export default FarmerLayout;
