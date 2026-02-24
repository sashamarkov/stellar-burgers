import { FC, useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import { resetPassword } from '../../services/slices/userSlice';
import { ResetPasswordUI } from '@ui-pages';
import { useForm } from '../../hooks/useForm';

export const ResetPassword: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<Error | null>(null);

  const { values, handleChange } = useForm({
    password: '',
    token: ''
  });

  const { password, token } = values;

  useEffect(() => {
    if (!localStorage.getItem('resetPassword')) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    dispatch(resetPassword({ password, token }))
      .unwrap()
      .then(() => {
        localStorage.removeItem('resetPassword');
        navigate('/login');
      })
      .catch((err) => setError(err));
  };

  return (
    <ResetPasswordUI
      errorText={error?.message}
      password={password}
      token={token}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};
