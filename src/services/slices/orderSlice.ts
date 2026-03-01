import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '@api';
import { TOrder } from '@utils-types';
import { fetchUserOrders } from './ordersSlice';

type TOrderState = {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
};

export const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const postOrder = createAsyncThunk<TOrder, string[]>(
  'order/post',
  async (data: string[], { dispatch }) => {
    const response = await orderBurgerApi(data);
    dispatch(fetchUserOrders());
    return response.order;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.orderModalData = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(postOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
        state.error = null;
      })
      .addCase(postOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message || 'Ошибка оформления заказа';
      });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
