import { Users, Target, Award, Cpu } from "lucide-react";
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  
  const values = [
    {
      icon: Award,
      title: "Chất lượng sản phẩm",
      description:
        "Tất cả thiết bị điện tử đều được kiểm tra nghiêm ngặt, đảm bảo hiệu suất và độ bền cao.",
    },
    {
      icon: Cpu,
      title: "Công nghệ tiên tiến",
      description:
        "Luôn cập nhật các thiết bị mới nhất, mang đến trải nghiệm hiện đại cho khách hàng.",
    },
    {
      icon: Users,
      title: "Hỗ trợ khách hàng",
      description:
        "Đội ngũ tư vấn và hỗ trợ luôn sẵn sàng giúp bạn chọn sản phẩm phù hợp.",
    },
    {
      icon: Target,
      title: "Đổi mới sáng tạo",
      description:
        "Liên tục cải tiến dịch vụ, trải nghiệm mua sắm và tính năng website.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tổng quan JrShop
          </h1>
          <p className="text-lg text-gray-600">
            Nền tảng thương mại điện tử chuyên về thiết bị điện tử, cung cấp sản
            phẩm chất lượng, chính hãng và dịch vụ khách hàng tận tâm.
          </p>
        </div>

        {/* VALUES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <value.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>

        {/* OUR STORY */}
        <div className="bg-white shadow-md rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Câu chuyện của chúng tôi
          </h2>
          <p className="text-gray-600 leading-relaxed">
            JrShop ra đời với sứ mệnh mang đến trải nghiệm mua sắm thiết bị điện
            tử trực tuyến an toàn và tiện lợi. Chúng tôi cam kết cung cấp sản
            phẩm chính hãng, cập nhật công nghệ mới nhất và dịch vụ khách hàng
            tận tâm. Niềm tin và sự hài lòng của khách hàng luôn là ưu tiên hàng
            đầu của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
