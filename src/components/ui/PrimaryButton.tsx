import * as React from 'react';
import { Button, ButtonProps } from '@fluentui/react-components';

export const PrimaryButton: React.FC<ButtonProps> = ({ style, appearance = 'primary', ...props }) => {
  return (
    <Button
      appearance={appearance}
      style={{
        backgroundImage: 'linear-gradient(90deg, rgba(var(--confirm-grad-1) / var(--confirm-grad-opacity)), rgba(var(--confirm-grad-2) / var(--confirm-grad-opacity)), rgba(var(--confirm-grad-3) / var(--confirm-grad-opacity)))',
        border: '1px solid rgba(255,255,255,0.28)',
        backdropFilter: 'blur(10px) saturate(120%)',
        WebkitBackdropFilter: 'blur(10px) saturate(120%)',
        ...style,
      }}
      {...props}
    />
  );
};

export default PrimaryButton;