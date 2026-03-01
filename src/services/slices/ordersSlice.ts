import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

type TOrdersState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
};

export const initialState: TOrdersState = {
  orders: [],
  loading: false,
  error: null
};

export const fetchUserOrders = createAsyncThunk<TOrder[]>(
  'orders/fetchUserOrders',
  async () => {
    const response = await getOrdersApi();
    return response;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки заказов';
      });
  }
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
