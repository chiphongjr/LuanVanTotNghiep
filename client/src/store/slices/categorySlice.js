import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchAllCategories = createAsyncThunk(
  "category/fetchAllCategories",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/category`);
      return res.data.categories;
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải danh mục");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (formData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/category/admin/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      return res.data.category;
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo danh mục thất bại");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ categoryId, formData }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/category/admin/update/${categoryId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success(res.data.message);
      return res.data.category;
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật danh mục thất bại");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/category/admin/delete/${categoryId}`
      );
      toast.success(res.data.message);
      return categoryId;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Xóa danh mục thất bại"
      );
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState: {
    loading: false,
    categories: [],
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createCategory.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isCreating = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state) => {
        state.isCreating = false;
      })
      .addCase(updateCategory.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.categories.findIndex(
          (cat) => cat.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state) => {
        state.isUpdating = false;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state) => {
        state.isDeleting = false;
      });
  },
});

export default categorySlice.reducer;
