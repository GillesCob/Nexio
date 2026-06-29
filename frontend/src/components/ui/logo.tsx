interface ILogoProps {
  className?: string
}

export function Logo({ className }: ILogoProps) {
  return (
    <>
      <img src="/logo_clair.png" alt="Nexio" className={`block dark:hidden ${className ?? ''}`} />
      <img src="/logo_sombre.jpeg" alt="Nexio" className={`hidden dark:block ${className ?? ''}`} />
    </>
  )
}

Logo.displayName = 'Logo'
