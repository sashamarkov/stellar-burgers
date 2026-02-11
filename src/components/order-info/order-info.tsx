import { FC, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from '../../services/store';
import {
  fetchOrderByNumber,
  clearOrder
} from '../../services/slices/orderByNumberSlice';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';

export const OrderInfo: FC = () => {
  const { number } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const isModal = location.state?.background;

  const orderData = useSelector((state) => state.orderByNumber.order);
  const loading = useSelector((state) => state.orderByNumber.loading);
  const ingredients = useSelector((state) => state.ingredients.ingredients);

  useEffect(() => {
    if (number) {
      dispatch(fetchOrderByNumber(Number(number)));
    }
    return () => {
      dispatch(clearOrder());
    };
  }, [dispatch, number]);

  useEffect(() => {
    if (orderData && isModal) {
      // Находим элемент заголовка модалки и обновляем его
      const modalTitle = document.querySelector('.modal_title');
      if (modalTitle) {
        modalTitle.textContent = `#${String(orderData.number).padStart(6, '0')}`;
      }
    }
  }, [orderData, isModal]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (loading || !orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
