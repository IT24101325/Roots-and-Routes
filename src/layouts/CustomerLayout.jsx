import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { ShoppingCart, LogOut, Leaf, Search, User } from 'lucide-react';
import { getUser, clearUser } from '../utils/userSession';
import { getCartCount } from '../utils/cartUtils';
import CustomerChatbot from '../components/CustomerChatbot';

const CustomerLayout = () => {
    const navigate = useNavigate();
    const user = getUser();
    const cartCount = getCartCount();
    const [searchFocused, setSearchFocused] = React.useState(false);
    const [searchVal, setSearchVal] = React.useState('');
    const [suggestions, setSuggestions] = React.useState({ products: [], farmers: [] });

    React.useEffect(() => {
        if (searchVal.trim().length < 2) {
            setSuggestions({ products: [], farmers: [] });
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/search/suggestions?q=${encodeURIComponent(searchVal)}`);
                const data = await res.json();
                if (data.success) {
                    setSuggestions({ products: data.products, farmers: data.farmers });
                }
            } catch (err) {
                console.error('Suggestion error:', err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchVal]);

    const handleLogout = () => {
        clearUser();
        navigate('/login');
    };

    const navItems = [
        { path: '/customer/home', name: 'Home' },
        { path: '/customer/products', name: 'Products' },
        { path: '/customer/orders', name: 'My Orders' },
        { path: '/customer/traceability', name: 'Traceability' },
        { path: '/customer/support', name: 'Support' }
    ];

    return (
        <div className="app-container" style={{ backgroundColor: 'var(--bg-color)', flexDirection: 'column' }}>
            <nav style={{ padding: '1rem 2rem', backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/customer/home')}>
                    <Leaf className="logo-icon" size={28} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Roots & Routes</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {navItems.map(item => (
                        <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "text-primary" : "text-muted"} style={{ fontWeight: 600, textDecoration: 'none' }}>{item.name}</NavLink>
                    ))}
                </div>

                <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', border: searchFocused ? '1px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s' }}>
                        <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                        <input
                            type="text"
                            value={searchVal}
                            placeholder="Search products, farmers, categories..."
                            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchVal.trim()) {
                                    navigate(`/customer/products?search=${encodeURIComponent(searchVal.trim())}`);
                                    setSearchFocused(false);
                                    e.target.blur();
                                }
                            }}
                        />
                    </div>

                    {searchFocused && (searchVal.trim().length >= 2) && (suggestions.products.length > 0 || suggestions.farmers.length > 0) && (
                        <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', padding: '0.75rem', zIndex: 100, boxShadow: 'var(--shadow-lg)', animation: 'slideDown 0.2s ease' }}>
                            {suggestions.products.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>Products</div>
                                    {suggestions.products.map(p => (
                                        <div 
                                            key={p.id} 
                                            onClick={() => navigate(`/customer/products?search=${encodeURIComponent(p.name)}`)}
                                            style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }} 
                                            className="hover-bg"
                                        >
                                            {p.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({p.category})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {suggestions.farmers.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>Farmers</div>
                                    {suggestions.farmers.map(f => (
                                        <div 
                                            key={f.id} 
                                            onClick={() => navigate(`/customer/products?search=${encodeURIComponent(f.name)}`)}
                                            style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }} 
                                            className="hover-bg"
                                        >
                                            {f.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{f.farm_location ? `· ${f.farm_location}` : ''}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }} onClick={() => navigate('/customer/cart')}>
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </button>
                    {user && (
                        <div
                            onClick={() => navigate('/customer/profile')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                            title="My Profile"
                        >
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                {user.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name?.split(' ')[0]}</span>
                        </div>
                    )}
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </nav>

            <div style={{ flex: 1, width: '100%', overflowY: 'auto' }}>
                <PageTransition>
                    <Outlet />
                </PageTransition>
            </div>
            {/* Floating chatbot — visible on all customer pages */}
            <CustomerChatbot />
        </div>
    );
};

export default CustomerLayout;
