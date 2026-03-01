import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { fetchUserOrders } from '../../services/slices/ordersSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const loading = useSelector((state) => state.orders.loading);

  useEffect(() => {
    if (!orders.length) {
      dispatch(fetchUserOrders());
    }
  }, [dispatch, orders.length]);

  return <ProfileOrdersUI orders={orders} loading={loading} />;
};
