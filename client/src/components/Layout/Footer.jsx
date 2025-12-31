import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer = () => {
  const footerLinks = {
    company: [
      { name: "Về chúng tôi", path: "/about" },
      { name: "Công việc", path: "#" },
      { name: "Ấn tượng", path: "#" },
      { name: "Tạp chí", path: "#" },
    ],
    customer: [
      { name: "Liên hệ chúng tôi", path: "/contact" },
      { name: "FAQ", path: "/faq" },
      { name: "Thông tin giao hàng", path: "#" },
      { name: "Đổi trả", path: "#" },
    ],
    legal: [
      { name: "Chính sách điều lệ", path: "#" },
      { name: "Chính sách hoạt động", path: "#" },
      { name: "Chính sách bảo hành", path: "#" },
      { name: "Chính sách bảo mật", path: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="mt-16 border-t bg-white">
      <div className="container mx-auto px-4 py-16">
        {/* TOP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">Jr Shop</h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Đối tác mua sắm trực tuyến đáng tin cậy của bạn. Khám phá những
              sản phẩm tuyệt vời với chất lượng và dịch vụ vượt trội.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>ckjfong204@gmail.com</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>0123 451 566</span>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>TP. Hồ Chí Minh, Bình Tân</span>
              </div>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Doanh nghiệp
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Dịch vụ
            </h3>
            <ul className="space-y-2">
              {footerLinks.customer.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Chính sách
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-black">
          {/* Social */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="p-2 rounded-full border hover:bg-gray-100 transition"
              >
                <social.icon className="w-5 h-5 text-gray-700" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm">
              © 2025 JrShop. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Developed by chiphongjr
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
