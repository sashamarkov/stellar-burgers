import React, { FC, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  CurrencyIcon,
  FormattedDate
} from '@zlden/react-developer-burger-ui-components';

import styles from './order-card.module.css';

import { OrderCardUIProps } from './type';
import { OrderStatus } from '@components';

export const OrderCardUI: FC<OrderCardUIProps> = memo(
  ({ orderInfo, maxIngredients, locationState }) => (
    <Link
      to={orderInfo.number.toString()}
      relative='path'
      state={locationState}
      className={`p-6 mb-4 mr-2 ${styles.order}`}
    >
      <div className={styles.order_info}>
        <span className={`text text_type_digits-default ${styles.number}`}>
          #{String(orderInfo.number).padStart(6, '0')}
        </span>
        <span className='text text_type_main-default text_color_inactive'>
          <FormattedDate date={orderInfo.date} />
        </span>
      </div>
      <h4 className={`pt-6 text text_type_main-medium ${styles.order_name}`}>
        {orderInfo.name}
      </h4>
      {location.pathname === '/profile/orders' && (
        <OrderStatus status={orderInfo.status} />
      )}
      <div className={`pt-6 ${styles.order_content}`}>
        <ul className={styles.ingredients}>
          {orderInfo.ingredientsToShow.map((ingredient, index) => {
            let zIndex = maxIngredients - index;
            let right = 20 * index;
            return (
              <li
                className={styles.img_wrap}
                style={{ zIndex: zIndex, right: right }}
                key={index}
              >
                <img
                  style={{
                    opacity:
                      orderInfo.remains && maxIngredients === index + 1
                        ? '0.5'
                        : '1'
                  }}
                  className={styles.img}
                  src={ingredient.image_mobile}
                  alt={ingredient.name}
                />
                {maxIngredients === index + 1 ? (
                  <span
                    className={`text text_type_digits-default ${styles.remains}`}
                  >
                    {orderInfo.remains > 0 ? `+${orderInfo.remains}` : null}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div>
          <span
            className={`text text_type_digits-default pr-1 ${styles.order_total}`}
          >
            {orderInfo.total}
          </span>
          <CurrencyIcon type='primary' />
        </div>
      </div>
    </Link>
  )
);

/* import { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { OrderCardUIProps } from './type';

export const OrderCardUI: FC<OrderCardUIProps> = memo(({ orderInfo }) => {
  const location = useLocation();

  return (
    <div
      style={{
        border: '1px solid #4c4cff',
        borderRadius: '40px',
        padding: '20px',
        margin: '10px 0',
        background: '#1c1c21'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#f2f2f3' }}>#{orderInfo.number}</span>
        <span style={{ color: '#8585ad' }}>
          {new Date(orderInfo.createdAt).toLocaleDateString()}
        </span>
      </div>
      <h3 style={{ color: '#f2f2f3', margin: '10px 0' }}>{orderInfo.name}</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#00cccc' }}>
          {orderInfo.status === 'done' ? 'Выполнен' : 'Готовится'}
        </span>
        <span style={{ color: '#f2f2f3' }}>
          {orderInfo.ingredients.length} ингредиентов
        </span>
      </div>
    </div>
  );
});
 */
