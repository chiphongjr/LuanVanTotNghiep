import { createSlice } from "@reduxjs/toolkit";

const extraSlice = createSlice({
  name: "extra",
  initialState: {
    isNavbarOpened: false,
    isViewProductModalOpened: false,
    isCreateProductModalOpened: false,
    isUpdateProductModalOpened: false,
    isCreateDiscountModalOpened: false,
    isUpdateDiscountModalOpened: false,
  },
  reducers: {
    toggleNavbar: (state) => {
      state.isNavbarOpened = !state.isNavbarOpened;
    },
    toggleCreateProductModal: (state) => {
      state.isCreateProductModalOpened = !state.isCreateProductModalOpened;
    },
    toggleViewProductModal: (state) => {
      state.isViewProductModalOpened = !state.isViewProductModalOpened;
    },
    toggleUpdateProductModal: (state) => {
      state.isUpdateProductModalOpened = !state.isUpdateProductModalOpened;
    },
    toggleCreateDiscountModal: (state) => {
      state.isCreateDiscountModalOpened = !state.isCreateDiscountModalOpened;
    },
    toggleUpdateDiscountModal: (state) => {
      state.isUpdateDiscountModalOpened = !state.isUpdateDiscountModalOpened;
    },
  },
});

export const {
  toggleComponent,
  toggleNavbar,
  toggleCreateProductModal,
  toggleViewProductModal,
  toggleUpdateProductModal,
  toggleCreateDiscountModal,
  toggleUpdateDiscountModal,
} = extraSlice.actions;

export default extraSlice.reducer;
