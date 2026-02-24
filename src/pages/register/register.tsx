import { FC, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from '../../services/store';
import { register } from '../../services/slices/userSlice';
import { RegisterUI } from '@ui-pages';
import { useForm } from '../../hooks/useForm';

export const Register: FC = () => {
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { values, handleChange } = useForm({
    name: '',
    email: '',
    password: ''
  });

  const { name, email, password } = values;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError('Заполните все поля');
      return;
    }

    setError('');
    dispatch(register({ name, email, password }))
      .unwrap()
      .then(() => {
        navigate('/');
      })
      .catch((err) => {
        setError(err.message || 'Ошибка регистрации');
      });
  };

  return (
    <RegisterUI
      errorText={error}
      email={email}
      userName={name}
      password={password}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  );
};
