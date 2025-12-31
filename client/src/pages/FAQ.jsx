import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const faqs = [
    {
      question: "Làm thế nào để đặt hàng?",
      answer:
        "Bạn chỉ cần duyệt sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Làm theo các hướng dẫn để hoàn tất đơn hàng.",
    },
    {
      question: "Những phương thức thanh toán nào được chấp nhận?",
      answer:
        "Chúng tôi chấp nhận tất cả các thẻ tín dụng chính, PayPal và các phương thức thanh toán an toàn khác.",
    },
    {
      question: "Thời gian vận chuyển mất bao lâu?",
      answer:
        "Vận chuyển tiêu chuẩn mất từ 3-5 ngày làm việc. Chúng tôi cũng cung cấp dịch vụ vận chuyển nhanh tại bước thanh toán.",
    },
    {
      question: "Chính sách đổi trả của ShopMate là gì?",
      answer:
        "Chúng tôi cung cấp chính sách đổi trả trong vòng 30 ngày cho hầu hết các sản phẩm. Sản phẩm phải còn nguyên trạng và có nhãn mác.",
    },
    {
      question: "Sản phẩm có được bảo hành không?",
      answer:
        "Có! Hầu hết các thiết bị điện tử đều có bảo hành nhà sản xuất 1 năm. Bạn cũng có thể mua thêm gói bảo hành mở rộng khi thanh toán.",
    },
  ];

  const toggleItem = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Câu hỏi thường gặp (FAQ)
          </h1>
          <p className="text-lg text-gray-600">
            Các câu hỏi phổ biến về mua sắm thiết bị điện tử tại ShopMate
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                {openItems[index] ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                )}
              </button>
              {openItems[index] && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
