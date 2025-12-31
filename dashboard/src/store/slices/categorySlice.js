import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    loading: false,
    categories: [],
  },
  reducers: {
    getCategoriesRequest(state) {
      state.loading = true;
    },
    getCategoriesSuccess(state, action) {
      state.loading = false;
      state.categories = action.payload;
    },
    getCategoriesFailed(state) {
      state.loading = false;
    },
  },
});

export const fetchAllCategories = () => async (dispatch) => {
  dispatch(categorySlice.actions.getCategoriesRequest());
  try {
    const res = await axiosInstance.get("/category");
    dispatch(categorySlice.actions.getCategoriesSuccess(res.data.categories));
  } catch (error) {
    dispatch(categorySlice.actions.getCategoriesFailed());
    toast.error(error.response?.data?.message || "Lỗi tải danh mục");
  }
};

export const createCategory = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/category/admin/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(res.data.message);
    dispatch(fetchAllCategories());
  } catch (error) {
    toast.error(error.response?.data?.message || "Tạo danh mục thất bại");
  }
};

export const updateCategory = (categoryId, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.put(
      `/category/admin/update/${categoryId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    toast.success(res.data.message);
    dispatch(fetchAllCategories());
  } catch (error) {
    toast.error(error.response?.data?.message || "Cập nhật danh mục thất bại");
  }
};

export const deleteCategory = (categoryId) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(
      `/category/admin/delete/${categoryId}`
    );
    toast.success(res.data.message);
    dispatch(fetchAllCategories());
  } catch (error) {
    toast.error(error.response?.data?.message || "Xóa danh mục thất bại");
  }
};

export default categorySlice.reducer;
