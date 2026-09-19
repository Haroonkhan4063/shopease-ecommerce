import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ShoppingCart, User, LogOut, LayoutDashboard, KeyRound, Store, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const dashboardLink =
    user?.role === "seller" ? "/seller/dashboard" : user?.role === "admin" ? "/admin/dashboard" : null;

  return (
    <nav className="bg-gray-900 sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="bg-gradient-to-br from-brand to-indigo-500 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition">
            <Store size={18} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            ShopEase
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition rounded-lg hover:bg-white/10">
            Shop
          </Link>

          {user?.role === "buyer" && (
            <Link
              to="/cart"
              className="relative px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition rounded-lg hover:bg-white/10 flex items-center gap-1.5"
            >
              <ShoppingCart size={17} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-gray-900">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {dashboardLink && (
            <Link
              to={dashboardLink}
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition rounded-lg hover:bg-white/10 flex items-center gap-1.5"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}

          {!user ? (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-dark shadow-sm hover:shadow transition"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative ml-2" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/10 border border-white/10 transition"
              >
                <span className="w-7 h-7 rounded-full bg-brand/20 text-brand-light flex items-center justify-center">
                  <User size={15} className="text-indigo-300" />
                </span>
                <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                  {user.role === "buyer" && (
                    <Link
                      to="/my-orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <ShoppingCart size={15} /> My Orders
                    </Link>
                  )}
                  <Link
                    to="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <KeyRound size={15} /> Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-gray-900">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-300">
            Shop
          </Link>
          {user?.role === "buyer" && (
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-300">
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          )}
          {user?.role === "buyer" && (
            <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-300">
              My Orders
            </Link>
          )}
          {dashboardLink && (
            <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-300">
              Dashboard
            </Link>
          )}
          {user && (
            <Link to="/change-password" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-gray-300">
              Change Password
            </Link>
          )}
          {!user ? (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center border border-white/20 text-white py-2 rounded-lg text-sm">
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center bg-brand text-white py-2 rounded-lg text-sm"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="block py-2 text-sm text-red-400 w-full text-left">
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
