import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUser, clearUser } from '../utils/userSession';
import PageTransition from '../components/PageTransition';
import {
    Truck,
    History,
    MapPin,
    Menu,
    LogOut,
    Leaf,
    ChevronLeft,
    Bell
} from 'lucide-react';

const API = 'http://localhost:5001';

const DriverLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const user = getUser();

    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (!user?.id) return;
            try {
                const res = await fetch(`${API}/api/driver/notifications?driver_id=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (err) {
                console.error('Error fetching unread count:', err);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user?.id]);

    const handleLogout = () => {
        clearUser();
        navigate('/login');
    };

    const navItems = [
        { path: '/driver/deliveries', name: 'My Deliveries', icon: Truck },
        { path: '/driver/history', name: 'Delivery History', icon: History },
        { path: '/driver/notifications', name: 'Notifications', icon: Bell },
    ];

    return (
        <div className="app-container">
            {/* Dynamic Sidebar */}
            <div className={`sidebar admin-sidebar ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '80px' : '260px', transition: 'width 0.3s' }}>
                <div className="sidebar-header" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <Leaf className="logo-icon flex-shrink-0" size={28} />
                        {!collapsed && <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--white)', whiteSpace: 'nowrap' }}>Driver Portal</h2>}
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
                                        <span style={{ 
                                            backgroundColor: 'var(--danger)', 
                                            color: 'white', 
                                            borderRadius: '99px', 
                                            padding: '2px 8px', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 'bold',
                                            marginLeft: 'auto'
                                        }}>
                                            {unreadCount}
                                        </span>
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
                        <input type="text" placeholder="Global Search (Deliveries, Orders, Routes)..." className="form-control" style={{ width: '100%' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div 
                            style={{ position: 'relative', cursor: 'pointer' }}
                            onClick={() => navigate('/driver/notifications')}
                        >
                            <Bell size={24} color="var(--text-muted)" />
                            {unreadCount > 0 && (
                                <div style={{ 
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
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>{user?.name || 'Driver'}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <MapPin size={10} /> {user?.city || 'No city set'}
                                </span>
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

export default DriverLayout;
