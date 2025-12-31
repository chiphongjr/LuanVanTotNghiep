import { Truck, Shield, Headphones, CreditCard } from "lucide-react";

const FeatureSection = () => {
  const features = [
    { icon: Truck, title: "Giao hàng nhanh", description: "Miễn phí giao hàng cho đơn từ 500.000đ" },
    { icon: Shield, title: "Thanh toán an toàn", description: "Bảo mật 100% với tiêu chuẩn SSL" },
    { icon: Headphones, title: "Hỗ trợ 24/7", description: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng" },
    { icon: CreditCard, title: "Hàng hóa uy tín", description: "Các sản phẩm được gói kĩ càng và đảm bảo" },
  ];

  return (
    <section className="my-16">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
