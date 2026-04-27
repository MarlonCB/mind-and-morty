import styles from './Button.module.scss'

type ButtonProps = {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export const Button = ({ variant = 'primary', children, onClick, disabled, type = 'button', className }: ButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  )
}
