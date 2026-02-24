import { useState, ChangeEvent } from 'react';

export function useForm<T extends Record<string, string>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const setValue = (name: keyof T, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = (newValues?: T) => {
    setValues(newValues || initialValues);
  };

  return {
    values,
    handleChange,
    setValue,
    resetForm,
    setValues
  };
}
