type CardProps = {
  children: React.ReactNode
  className?: string
  hideLogo?: boolean
}

export const Card = ({ children, className, hideLogo }: CardProps) => {
  return (
    <div className={`card${className ? ` ${className}` : ''}`}>
      {!hideLogo && (
        <img
          src="/Rick_and_Morty.svg"
          alt="Rick and Morty"
          className="card__logo"
        />
      )}
      {children}
    </div>
  )
}
