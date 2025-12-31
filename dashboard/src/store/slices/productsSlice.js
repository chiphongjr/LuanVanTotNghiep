import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import {
  toggleCreateProductModal,
  toggleUpdateProductModal,
} from "./extraSlice";

export const createNewProduct = createAsyncThunk(
  "product/createNewProduct",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/product/admin/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Tạo sản phẩm thành công");
      thunkAPI.dispatch(fetchAllProducts());
      thunkAPI.dispatch(toggleCreateProductModal());

      return res.data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Thêm sản phẩm thất bại");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAllProducts",
  async (page = 1, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/product?page=${page}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async ({ data, id }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/product/admin/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Cập nhật sản phẩm thành công");
      thunkAPI.dispatch(fetchAllProducts());
      thunkAPI.dispatch(toggleUpdateProductModal());

      return res.data.updatedProduct;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Cập nhật sản phẩm thất bại"
      );
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async ({ id, page }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/product/admin/delete/${id}`);
      toast.success(res.data.message || "Xóa sản phẩm thành công");

      const state = thunkAPI.getState();
      const updatedTotal = state.product.totalProducts - 1;
      const updateMaxPage = Math.ceil(updatedTotal / 10 || 1);
      const validPage = Math.min(page, updateMaxPage);

      thunkAPI.dispatch(fetchAllProducts(validPage));

      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa sản phẩm thất bại");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    createLoading:false,
    isfetchingProduct: false,
    products: [],
    totalProducts: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createNewProduct.pending, (state) => {
        state.createLoading = true;
      })
      .addCase(createNewProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.products = [action.payload, ...state.products];
      })
      .addCase(createNewProduct.rejected, (state) => {
        state.createLoading = false;
      })
      .addCase(fetchAllProducts.pending, (state) => {
        state.isfetchingProduct = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isfetchingProduct = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchAllProducts.rejected, (state) => {
        state.isfetchingProduct = false;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        );
      })
      .addCase(updateProduct.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
        state.totalProducts = Math.max(0, state.totalProducts - 1);
      })
      .addCase(deleteProduct.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
