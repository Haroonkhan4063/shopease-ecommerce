import { Link } from "react-router-dom";
import { Store, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gradient-to-br from-brand to-indigo-700 text-white w-8 h-8 rounded-lg flex items-center justify-center">
              <Store size={16} />
            </span>
            <span className="text-lg font-extrabold text-white">ShopEase</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            A multi-vendor marketplace connecting independent sellers with buyers — built on the MERN stack.
          </p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand transition"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/refunds" className="hover:text-white transition">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Sell on ShopEase</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/register" className="hover:text-white transition">Become a Seller</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-white transition">Seller Dashboard</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5 text-center text-sm text-gray-500">
          © {year} Muhammad Haroon Khan — Full Stack Engineer
        </div>
      </div>
    </footer>
  );
};

export default Footer;
