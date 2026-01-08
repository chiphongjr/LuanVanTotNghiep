import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleCreateDiscountModal } from "./extraSlice";

export const createNewDiscount = createAsyncThunk(
  "discount/createNewDiscount",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/discount/admin/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Thêm mã giảm giá thành công");
      thunkAPI.dispatch(fetchAllDiscounts());
      thunkAPI.dispatch(toggleCreateDiscountModal())

      return res.data.discount;
    } catch (error) {
      toast.error(error.response?.data?.message || "Thêm mã giảm giá thất bại");
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchAllDiscounts = createAsyncThunk(
  "discount/fetchAllDiscounts",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/discount/admin/fetch-all");
      return res.data.discounts;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const discountSlice = createSlice({
  name: "discount",
  initialState: {
    loading: false,
    discounts: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewDiscount.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = [action.payload, ...state.discounts];
      })
      .addCase(createNewDiscount.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchAllDiscounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload;
      })
      .addCase(fetchAllDiscounts.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default discountSlice.reducer;
