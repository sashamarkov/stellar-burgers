import React, { FC, useState } from 'react';
import { Input } from '@zlden/react-developer-burger-ui-components';

type TPasswordInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
};

// Библиотечный PasswordInput кривовато сделан.
// Из-за этого при клике показывал ошибку Некорректного пароля
// Ну короче я сделал свою обертку над их инпутом для пароля
export const PasswordInput: FC<TPasswordInputProps> = ({
  value,
  onChange,
  name = 'password',
  placeholder = 'Пароль'
}) => {
  const [visible, setVisible] = useState(false);

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setVisible(!visible);
  };

  return (
    <Input
      type={visible ? 'text' : 'password'}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      name={name}
      error={false}
      errorText=''
      size='default'
      icon={visible ? 'HideIcon' : 'ShowIcon'}
      onIconClick={handleIconClick}
    />
  );
};
