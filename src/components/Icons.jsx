import React from 'react';
import { 
    Carrot, Apple, Wheat, Milk, Sprout, Package, 
    ShoppingCart, AlertTriangle, TrendingUp, Boxes, 
    RefreshCw, ArrowRight, CheckCircle, XCircle, 
    Trash2, Edit3, Search, Filter, Save, X, Leaf,
    Calendar, Clock, MapPin, Star, Plus, Minus,
    ArrowLeft, ShoppingBag, Truck, Lock, CreditCard, Banknote
} from 'lucide-react';

/**
 * CategoryIcon - Returns a Lucide icon for a given category name.
 */
export const CategoryIcon = ({ category, size = 20, color, ...props }) => {
    const iconProps = { size, color: color || 'currentColor', ...props };
    
    switch (category) {
        case 'Vegetables':
            return <Carrot {...iconProps} />;
        case 'Fruits':
            return <Apple {...iconProps} />;
        case 'Grains':
            return <Wheat {...iconProps} />;
        case 'Dairy':
            return <Milk {...iconProps} />;
        case 'Herbs':
            return <Sprout {...iconProps} />;
        case 'Other':
        default:
            return <Package {...iconProps} />;
    }
};

/**
 * Icon - A flexible icon component that maps to Lucide icons.
 * This is useful for replacing emojis in stat cards etc.
 */
export const AppIcon = ({ name, size = 20, color, ...props }) => {
    const iconProps = { size, color: color || 'currentColor', ...props };
    
    const map = {
        'cart': ShoppingCart,
        'search': Search,
        'filter': Filter,
        'package': Package,
        'low_stock': AlertTriangle,
        'revenue': TrendingUp,
        'boxes': Boxes,
        'refresh': RefreshCw,
        'arrow_right': ArrowRight,
        'active': CheckCircle,
        'out_of_stock': XCircle,
        'delete': Trash2,
        'edit': Edit3,
        'save': Save,
        'close': X,
        'organic': Leaf,
        'calendar': Calendar,
        'clock': Clock,
        'location': MapPin,
        'star': Star,
        'plus': Plus,
        'minus': Minus,
        'back': ArrowLeft,
        'bag': ShoppingBag,
        'truck': Truck,
        'lock': Lock,
        'card': CreditCard,
        'cash': Banknote,
        'total': Package,
        'ban': XCircle,
        'warning': AlertTriangle,
        'money': Banknote,
    };

    const IconComp = map[name] || Package;
    return <IconComp {...iconProps} />;
};

export default CategoryIcon;
