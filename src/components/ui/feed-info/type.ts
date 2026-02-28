import { TOrdersData } from '@utils-types';

type StoryExtraFields = {
  orders?: TOrdersData['orders'];
  isLoading?: boolean;
  error?: null | string;
};

export type FeedInfoUIProps = {
  feed: {
    total: number;
    totalToday: number;
  } & Partial<StoryExtraFields>;
  readyOrders: number[];
  pendingOrders: number[];
};

export type HalfColumnProps = {
  orders: number[];
  title: string;
  textColor?: string;
};

export type TColumnProps = {
  title: string;
  content: number;
};
