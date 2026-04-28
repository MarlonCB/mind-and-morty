import type { ReactNode, ChangeEvent } from 'react'
import type { GameCard } from './game'

export type ButtonProps = {
  variant?: 'primary' | 'secondary'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export type CardProps = {
  children: ReactNode
  className?: string
  hideLogo?: boolean
}

export type GameCardProps = {
  card: GameCard
  isFlipped: boolean
  isMatched: boolean
  isError: boolean
  onClick: () => void
}

export type InputProps = {
  type: 'email' | 'password'
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}
