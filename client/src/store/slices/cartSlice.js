import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// GET CART
export const getCart = createAsyncThunk("cart/getCart", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/cart/cart");
    return res.data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

// ADD TO CART
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product_id, quantity }, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/cart/add-cart", {
        product_id,
        quantity,
      });
      toast.success("Đã thêm vào giỏ hàng!");
      return res.data.cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thêm giỏ hàng");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// UPDATE CART ITEM
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ cart_item_id, quantity }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/cart/update-cart`, {
        cart_item_id,
        quantity,
      });
      return res.data.cart;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không cập nhật được giỏ hàng"
      );
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// REMOVE CART ITEM
export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (cart_item_id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/cart/remove-cart/${cart_item_id}`
      );
      return res.data.cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa sản phẩm");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// CLEAR CART
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/cart/clear-cart`);
      return res.data.cart;
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa giỏ hàng");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: {
      cart_id: null,
      cart_items: [],
      cart_total_quantity: 0,
    },
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export default cartSlice.reducer;
