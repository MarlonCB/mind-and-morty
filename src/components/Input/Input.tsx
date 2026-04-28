import { useId, useState } from 'react'
import type { InputProps } from '../../types'

// Iconos inline en SVG para evitar dependencias externas y mantener
// el bundle pequeño. Se definen como componentes en lugar de JSX directo
// para mejorar la legibilidad del componente Input principal.
const EyeIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

/**
 * Campo de texto controlado con soporte para mostrar/ocultar contraseña.
 *
 * Accesibilidad:
 *  - useId() genera un ID único garantizado por React, solucionando el problema
 *    de IDs duplicados que ocurriría si dos campos del mismo tipo (`password`)
 *    usaran `input-${type}` como ID. El ID vincula el <label> al <input> via htmlFor.
 *  - aria-label en el botón de toggle comunica su función a lectores de pantalla.
 */
export const Input = ({
  type,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false)

  // useId genera un ID único por instancia del componente (e.g. ":r0:", ":r1:")
  // garantizando que label y input queden correctamente asociados incluso si
  // hay múltiples instancias del mismo tipo en el DOM.
  const id = useId()

  const isPassword = type === 'password'

  // Si el campo es password y el toggle está activo, se muestra como texto;
  // en cualquier otro caso se usa el tipo original del prop.
  const resolvedType = isPassword && showPassword ? 'text' : type

  return (
    <div className="input">
      <label htmlFor={id} className="input__label">
        {label}
      </label>
      <div className="input__field">
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          // La clase con-icono añade padding-right para que el texto no quede
          // tapado por el botón de toggle cuando el campo es de contraseña.
          className={`input__control${isPassword ? ' input__control--with-icon' : ''}`}
        />
        {/* El botón de toggle solo existe para campos de contraseña */}
        {isPassword && (
          <button
            type="button" // evita que este botón envíe el formulario padre
            className="input__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  )
}
