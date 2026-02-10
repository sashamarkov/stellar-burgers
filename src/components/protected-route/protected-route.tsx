import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
//import { getAuthChecked, getUser } from '../../services/slices/userSlice';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  component: ReactElement;
};

const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  component
}) =>
  // const user = useSelector(getUser);
  // const isAuthChecked = useSelector(getAuthChecked);
  // const location = useLocation();

  // if (!isAuthChecked) {
  //   return null;
  // }

  // if (onlyUnAuth && user) {
  //   const from = location.state?.from || { pathname: '/' };
  //   return <Navigate to={from} replace />;
  // }

  // if (!onlyUnAuth && !user) {
  //   return <Navigate to='/login' state={{ from: location }} replace />;
  // }

  component;
export const OnlyAuth = ProtectedRoute;
export const OnlyUnAuth: FC<{ component: ReactElement }> = ({ component }) => (
  <ProtectedRoute onlyUnAuth component={component} />
);
