import React, { useState } from 'react';
import { Leaf, User, Tractor, ShieldCheck, Truck, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react';

const SRI_LANKA_CITIES = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Batticaloa',
    'Trincomalee', 'Anuradhapura', 'Polonnaruwa', 'Ratnapura',
    'Matara', 'Kurunegala', 'Badulla', 'Kegalle', 'Nuwara Eliya',
    'Hambantota', 'Puttalam', 'Vavuniya', 'Mannar', 'Ampara',
    'Matale', 'Gampaha', 'Kalutara',
];

const AuthPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        address: '',
        licenseNumber: '',
        vehicleNumber: '',
        vehicleType: '',
    });

    const API_BASE_URL = 'http://localhost:5001';

    const handleModeToggle = (e) => {
        e.preventDefault();
        const nextIsLogin = !isLogin;
        setIsLogin(nextIsLogin);
        setError('');
        if (!nextIsLogin && role === 'admin') {
            setRole('customer');
        }
        setShowPassword(false);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validate = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z\s]+$/;

        if (!emailRegex.test(formData.email)) return 'Please enter a valid email address.';
        if (formData.password.length < 6) return 'Password must be at least 6 characters.';

        if (!isLogin) {
            if (!formData.firstName.trim()) return 'First name is required.';
            if (!nameRegex.test(formData.firstName)) return 'First name cannot contain symbols or numbers.';
            
            if (!formData.lastName.trim()) return 'Last name is required.';
            if (!nameRegex.test(formData.lastName)) return 'Last name cannot contain symbols or numbers.';

            if (!/^\d{10}$/.test(formData.phone)) return 'Phone number must be exactly 10 numerical digits.';
            
            if ((role === 'customer' || role === 'driver') && !formData.city) return 'Please select your city.';
            if ((role === 'customer' || role === 'farmer') && !formData.address.trim()) return 'Address is required.';
            if (role === 'driver') {
                if (!formData.licenseNumber.trim()) return 'License number is required.';
                if (!formData.vehicleNumber.trim()) return 'Vehicle number is required.';
                if (!formData.vehicleType.trim()) return 'Vehicle type is required.';
            }
        }
        return null;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) { setError(validationError); return; }
        setLoading(true);

        try {
            if (isLogin) {
                const response = await fetch(`${API_BASE_URL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email, password: formData.password, userType: role })
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    setError(data.message || 'Invalid email or password');
                    setLoading(false);
                    return;
                }
                const userData = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    phone: data.user.phone,
                    city: data.user.city || null,
                    address: data.user.address || null,
                    role: role,
                };
                onLogin(userData, role);
            } else {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        phone: formData.phone,
                        city: formData.city || null,
                        address: formData.address || null,
                        licenseNumber: formData.licenseNumber || null,
                        vehicleNumber: formData.vehicleNumber || null,
                        vehicleType: formData.vehicleType || null,
                        userType: role
                    })
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    setError(data.message || 'Unable to create account');
                    setLoading(false);
                    return;
                }
                setIsLogin(true);
                setError('');
                setFormData({ email: formData.email, password: '', firstName: '', lastName: '', phone: '', city: '', licenseNumber: '', vehicleNumber: '', vehicleType: '' });
                setLoading(false);
            }
        } catch (err) {
            setError('Connection error. Make sure the server is running on port 5001.');
            console.error('Auth error:', err);
            setLoading(false);
        }
    };

    const needsCity = !isLogin && (role === 'customer' || role === 'driver');

    return (
        <div className="auth-page page-transition">
            <div className="auth-card animate-tile">
                <div className="auth-header flex flex-col items-center">
                    <div className="bg-primary flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: '50%', color: 'white' }}>
                        <Leaf size={32} />
                    </div>
                    <h1 className="auth-title">Roots and Routes</h1>
                    <p className="text-muted" style={{ marginTop: '0.5rem', marginBottom: '2rem' }}>
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>

                {!isLogin && (
                    <div className="role-selector">
                        <button type="button" className={`role-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
                            <User size={24} /><span>Customer</span>
                        </button>
                        <button type="button" className={`role-btn ${role === 'farmer' ? 'active' : ''}`} onClick={() => setRole('farmer')}>
                            <Tractor size={24} /><span>Farmer</span>
                        </button>
                        <button type="button" className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => setRole('driver')}>
                            <Truck size={24} /><span>Driver</span>
                        </button>
                    </div>
                )}

                {isLogin && (
                    <div className="role-selector">
                        <button type="button" className={`role-btn ${role === 'customer' ? 'active' : ''}`} onClick={() => { setRole('customer'); setError(''); }}>
                            <User size={24} /><span>Customer</span>
                        </button>
                        <button type="button" className={`role-btn ${role === 'farmer' ? 'active' : ''}`} onClick={() => { setRole('farmer'); setError(''); }}>
                            <Tractor size={24} /><span>Farmer</span>
                        </button>
                        <button type="button" className={`role-btn ${role === 'driver' ? 'active' : ''}`} onClick={() => { setRole('driver'); setError(''); }}>
                            <Truck size={24} /><span>Driver</span>
                        </button>
                        <button type="button" className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => { setRole('admin'); setError(''); }}>
                            <ShieldCheck size={24} /><span>Admin</span>
                        </button>
                    </div>
                )}

                {!isLogin && (
                    <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Admin accounts are created manually by the system.
                    </div>
                )}

                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input type="text" name="firstName" className="form-control" placeholder="John"
                                    value={formData.firstName} onChange={handleInputChange} required 
                                    pattern="[a-zA-Z\s]*" title="Only letters and spaces allowed" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input type="text" name="lastName" className="form-control" placeholder="Doe"
                                    value={formData.lastName} onChange={handleInputChange} required 
                                    pattern="[a-zA-Z\s]*" title="Only letters and spaces allowed" />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Phone Number</label>
                                <input type="tel" name="phone" className="form-control" placeholder="0771234567"
                                    value={formData.phone} onChange={handleInputChange} required 
                                    maxLength={10} inputMode="numeric" />
                            </div>

                            {/* City field only for customer and driver */}
                            {needsCity && (
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <MapPin size={13} /> Your City *
                                    </label>
                                    <select name="city" className="form-control" value={formData.city}
                                        onChange={handleInputChange} required style={{ cursor: 'pointer' }}>
                                        <option value="">— Select your city —</option>
                                        {SRI_LANKA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {role === 'customer'
                                            ? 'Your city is used to match you with a local delivery driver.'
                                            : 'You will receive delivery orders from customers in your city.'}
                                    </p>
                                </div>
                            )}

                            {/* Address field only for customer and farmer */}
                            {!isLogin && (role === 'customer' || role === 'farmer') && (
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Full Address *</label>
                                    <textarea 
                                        name="address" 
                                        className="form-control" 
                                        placeholder={role === 'customer' ? "Your home or delivery address" : "Your farm or business address"}
                                        value={formData.address} 
                                        onChange={handleInputChange} 
                                        required 
                                        rows={2}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            )}

                            {/* Driver specific fields */}
                            {!isLogin && role === 'driver' && (
                                <>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">License Number *</label>
                                        <input type="text" name="licenseNumber" className="form-control" placeholder="B1234567"
                                            value={formData.licenseNumber} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vehicle Number *</label>
                                        <input type="text" name="vehicleNumber" className="form-control" placeholder="WP ABC-1234"
                                            value={formData.vehicleNumber} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Vehicle Type *</label>
                                        <select name="vehicleType" className="form-control" value={formData.vehicleType}
                                            onChange={handleInputChange} required style={{ cursor: 'pointer' }}>
                                            <option value="">— Select —</option>
                                            <option value="Motorcycle">Motorcycle</option>
                                            <option value="Three-Wheeler">Three-Wheeler</option>
                                            <option value="Mini Van">Mini Van</option>
                                            <option value="Small Truck">Small Truck</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" name="email" className="form-control" placeholder="you@example.com"
                            value={formData.email} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password" 
                                className="form-control" 
                                placeholder="••••••••"
                                style={{ paddingRight: '2.75rem' }}
                                value={formData.password} 
                                onChange={handleInputChange} 
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }} disabled={loading}>
                        {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : isLogin ? 'Sign In' : 'Create Account'}
                    </button>

                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33', fontSize: '0.875rem' }}>
                            <AlertCircle size={16} className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span className="text-muted">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <a href="#" onClick={handleModeToggle} style={{ fontWeight: 600 }}>
                        {isLogin ? "Sign up" : "Sign in"}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
