import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  component: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  component
}) => {
  const isAuthChecked = useSelector(
    (state) => state.user?.isAuthChecked ?? false
  );
  const user = useSelector((state) => state.user?.user);
  const location = useLocation();

  if (!isAuthChecked) {
    return null;
  }

  if (onlyUnAuth && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate to={from} replace />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return component;
};

export const OnlyAuth = ProtectedRoute;
export const OnlyUnAuth: FC<{ component: ReactElement }> = ({ component }) => (
  <ProtectedRoute onlyUnAuth component={component} />
);
