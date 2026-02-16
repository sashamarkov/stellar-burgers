import { FC, useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import { login } from '../../services/slices/userSlice';
import { LoginUI } from '@ui-pages';
import { useForm } from '../../hooks/useForm';

export const Login: FC = () => {
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { values, handleChange } = useForm({
    email: '',
    password: ''
  });

  const { email, password } = values;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    //setError('');
    dispatch(login({ email, password }))
      .unwrap()
      .then(() => {
        navigate(from, { replace: true });
      })
      .catch((err) => {
        setError(err.message || 'Ошибка входа');
      });
  };

  return (
    <LoginUI
      errorText={error}
      email={email}
      password={password}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};
