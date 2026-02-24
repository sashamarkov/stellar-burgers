import { FC, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import { forgotPassword } from '../../services/slices/userSlice';
import { ForgotPasswordUI } from '@ui-pages';
import { useForm } from '../../hooks/useForm';

export const ForgotPassword: FC = () => {
  const [error, setError] = useState<Error | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { values, handleChange } = useForm({
    email: ''
  });

  const { email } = values;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    dispatch(forgotPassword(email))
      .unwrap()
      .then(() => {
        localStorage.setItem('resetPassword', 'true');
        navigate('/reset-password', { replace: true });
      })
      .catch((err) => setError(err));
  };

  return (
    <ForgotPasswordUI
      errorText={error?.message}
      email={email}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};
