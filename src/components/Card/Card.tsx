import styles from './Card.module.scss'

type CardProps = {
  children: React.ReactNode
}

export const Card = ({ children }: CardProps) => {
  return (
    <div className={styles.card}>
      <img
        src="/Rick_and_Morty.svg"
        alt="Rick and Morty"
        className={styles.logo}
      />
      {children}
    </div>
  )
}
