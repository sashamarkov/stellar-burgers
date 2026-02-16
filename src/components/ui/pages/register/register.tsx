import { FC } from 'react';
import { Input, Button } from '@zlden/react-developer-burger-ui-components';
import { PasswordInput } from '../../password-input/password-input';
import styles from '../common.module.css';
import { Link } from 'react-router-dom';
import { ChangeEvent } from 'react';

type RegisterUIProps = {
  errorText: string | undefined;
  email: string;
  password: string;
  userName: string;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
};

export const RegisterUI: FC<RegisterUIProps> = ({
  errorText,
  email,
  userName,
  password,
  handleChange,
  handleSubmit
}) => (
  <main className={styles.container}>
    <div className={`pt-6 ${styles.wrapCenter}`}>
      <h3 className='pb-6 text text_type_main-medium'>Регистрация</h3>
      <form
        className={`pb-15 ${styles.form}`}
        name='register'
        onSubmit={handleSubmit}
      >
        <div className='pb-6'>
          <Input
            type='text'
            placeholder='Имя'
            onChange={handleChange}
            value={userName}
            name='name'
            error={false}
            errorText=''
            size='default'
          />
        </div>
        <div className='pb-6'>
          <Input
            type='email'
            placeholder='E-mail'
            onChange={handleChange}
            value={email}
            name='email'
            error={false}
            errorText=''
            size='default'
          />
        </div>
        <div className='pb-6'>
          <PasswordInput
            onChange={handleChange}
            value={password}
            name='password'
          />
        </div>
        <div className={`pb-6 ${styles.button}`}>
          <Button type='primary' size='medium' htmlType='submit'>
            Зарегистрироваться
          </Button>
        </div>
        {errorText && (
          <p className={`${styles.error} text text_type_main-default pb-6`}>
            {errorText}
          </p>
        )}
      </form>
      <div className={`${styles.question} text text_type_main-default pb-6`}>
        Уже зарегистрированы?
        <Link to='/login' className={`pl-2 ${styles.link}`}>
          Войти
        </Link>
      </div>
    </div>
  </main>
);
