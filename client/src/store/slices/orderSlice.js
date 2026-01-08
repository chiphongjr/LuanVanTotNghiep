import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchMyOrders = createAsyncThunk(
  "order/orders/me",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/order/orders/me");
      return res.data.myOrders;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "order/new",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/order/new", data);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "Tạo đơn hàng thất bại, thử lại"
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const cancelOrderPayment = createAsyncThunk(
  "order/cancelPayment",
  async ({ orderId }, thunkAPI) => {
    try {
      const { data } = await axiosInstance.post("/order/cancel-payment", {
        orderId,
      });
      toast.success(data.message);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Hủy thanh toán thất bại");
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    fetchingOrders: false,
    placingOrder: false,
    finalPrice: null,
    paymentIntent: null,
    isCancelling: false,
    orderId: null,
    discount_code:null
  },
  reducers: {
    resetOrder(state) {
      state.paymentIntent = null;
      state.finalPrice = null;
      state.placingOrder = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.fetchingOrders = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.fetchingOrders = false;
      })
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        (state.finalPrice = action.payload.final_price),
          (state.paymentIntent = action.payload.paymentIntent);
        state.orderId = action.payload.orderId;
      })
      .addCase(placeOrder.rejected, (state) => {
        state.placingOrder = false;
      })

      .addCase(cancelOrderPayment.pending, (state) => {
        state.isCancelling = true;
      })
      .addCase(cancelOrderPayment.fulfilled, (state) => {
        state.isCancelling = false;
        state.paymentIntent = null;
        state.orderId = null;
      })
      .addCase(cancelOrderPayment.rejected, (state) => {
        state.isCancelling = false;
      });
  },
});

export default orderSlice.reducer;
export const { toggleOrderStep, resetOrder } = orderSlice.actions;
