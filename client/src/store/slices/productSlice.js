import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAIModal } from "./popupSlice";

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAllProducts",
  async (
    {
      category = "",
      price = `0-99999999`,
      search = "",
      ratings = "",
      page = 1,
    },
    thunkAPI
  ) => {
    try {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (price) params.append("price", price);
      if (search) params.append("search", search);
      if (ratings) params.append("ratings", ratings);
      if (page) params.append("page", page);

      const res = await axiosInstance.get(`/product?${params.toString()}`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải sản phẩm");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const fetchSingleProduct = createAsyncThunk(
  "product/singleProduct",
  async (productId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`product/singleProduct/${productId}`);
      return res.data.product;
    } catch (err) {
      toast.error(err.response?.data?.message || "Không tìm thấy sản phẩm");
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const postReview = createAsyncThunk(
  "product/post-new/review",
  async ({ productId, review }, thunkAPI) => {
    const state = thunkAPI.getState();
    const authUser = state.auth.authUser;
    try {
      const res = await axiosInstance.put(
        `/product/post-new/review/${productId}`,
        review
      );
      toast.success(res.data.message);
      return {
        review: res.data.review,
        authUser,
      };
    } catch (error) {
      toast.error(error.response.data.message || "Đăng đánh giá thất bại");
      return thunkAPI.rejectWithValue(
        error.response.data.message || "Đăng đánh giá thất bại"
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "product/delete/review",
  async ({  reviewId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/product/delete/review/${reviewId}`
      );
      toast.success(res.data.message);
      return reviewId;
    } catch (error) {
      toast.error(error.response.data.message || "Xóa đánh giá thất bại");
      return thunkAPI.rejectWithValue(
        error.response.data.message || "Xóa đánh giá thất bại"
      );
    }
  }
);

export const fetchProductWithAI = createAsyncThunk(
  "product/ai-search",
  async (userPrompt, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/product/ai-search`, {
        userPrompt,
      });
      thunkAPI.dispatch(toggleAIModal());
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message);
      return thunkAPI.rejectWithValue(
        err.response.data.message || "Lọc theo AI chi tiết sản phẩm thất bại"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/admin/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Tạo sản phẩm thành công!");
      return res.data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo sản phẩm thất bại");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    isPostingReview: false,
    productReviews: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.newProducts = action.payload.newProducts;
        state.topRatedProducts = action.payload.topRatedProducts;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchSingleProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSingleProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
        state.productReviews = action.payload.reviews;
      })
      .addCase(fetchSingleProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(postReview.pending, (state) => {
        state.isPostingReview = true;
      })
      // .addCase(postReview.fulfilled, (state, action) => {
      //   state.isPostingReview = false;
      //   // state.productReviews = [action.payload, ...state.productReviews];

      //   const newReview = action.payload.review;
      //   const authUser = action.payload.authUser;

      //   const existingReviewIndex = state.productReviews.findIndex(
      //     (rev) => rev.reviewer?.id === newReview.user_id
      //   );
      //   if (existingReviewIndex !== -1) {
      //     state.productReviews[existingReviewIndex].rating = Number(
      //       newReview.rating
      //     );
      //     state.productReviews[existingReviewIndex].comment = newReview.comment;
      //   } else {
      //     state.productReviews = [
      //       {
      //         ...newReview,
      //         reviewer: {
      //           id: authUser?.id,
      //           name: authUser?.name,
      //           avatar: authUser?.avatar?.url,
      //         },
      //       },
      //       ...state.productReviews,
      //     ];
      //   }
      // })

      .addCase(postReview.fulfilled, (state, action) => {
  state.isPostingReview = false;

  state.productReviews.unshift({
    ...action.payload.review,
    reviewer: {
      id: action.payload.authUser.id,
      name: action.payload.authUser.name,
      avatar: action.payload.authUser.avatar,
    },
  });
})

      .addCase(postReview.rejected, (state) => {
        state.isPostingReview = false;
      })
      .addCase(deleteReview.pending, (state) => {
        state.isReviewDeleting = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isReviewDeleting = false;
        state.productReviews = state.productReviews.filter(
          (review) => review.review_id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state) => {
        state.isReviewDeleting = false;
      })
      .addCase(fetchProductWithAI.pending, (state) => {
        state.aiSearching = true;
      })
      .addCase(fetchProductWithAI.fulfilled, (state, action) => {
        state.aiSearching = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.products.length;
      })
      .addCase(fetchProductWithAI.rejected, (state) => {
        state.aiSearching = false;
      })

      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
