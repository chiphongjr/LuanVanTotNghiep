import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteReview, postReview } from "../../store/slices/productSlice";
import { Star } from "lucide-react";

const ReviewsContainer = ({ product, productReviews }) => {
  const { authUser } = useSelector((state) => state.auth);
  const { isReviewDeleting, isPostingReview } = useSelector(
    (state) => state.product
  );

  const dispatch = useDispatch();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!isPostingReview) {
      setRating(0);
      setComment("");
    }
  }, [isPostingReview]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    dispatch(postReview({ productId: product.id, review: formData }));
  };

  return (
    <>
      {authUser && (
        <form onSubmit={handleReviewSubmit} className="mb-8 space-y-4">
          <h4 className="text-lg font-semibold">Để lại nhận xét</h4>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className={`text-2xl ${
                  i < rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ☆
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Hãy chia sẻ trải nghiệm thực tế của bạn về sản phẩm..."
            className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {comment.length > 0 && comment.length < 10 && (
            <p className="text-sm text-red-500">
              Nhận xét phải có ít nhất 10 ký tự
            </p>
          )}

          <button
            type="submit"
            disabled={isPostingReview || rating === 0 || comment.length < 10}
            className="px-6 py-2 rounded-2xl bg-blue-600 border text-white font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {isPostingReview ? "Đang gửi..." : "Gửi nhận xét"}
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mb-6 pt-4 border-t border-black">
        Đánh giá khách hàng
      </h3>

      {productReviews && productReviews.length > 0 && (
        <div className="space-y-6">
          {productReviews.map((review) => (
            <div
              key={review.review_id}
              className="border rounded-lg p-6 bg-white"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={review.review?.avatar?.url || "/avatar-holder.avif"}
                  alt={review?.reviewer?.name}
                  className="w-12 h-12 rounded-full"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {review?.reviewer?.name}
                  </h4>

                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.ceil(review.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 mb-2">{review.comment}</p>

                {authUser?.id === review.reviewer?.id && (
                  <button
                    onClick={() =>
                      dispatch(
                        deleteReview({
                          productId: product.id,
                          reviewId: review.review_id,
                        })
                      )
                    }
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    {isReviewDeleting ? "Đang xóa..." : "Xóa đánh giá"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ReviewsContainer;
