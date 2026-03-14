import { Link } from 'react-router-dom'

export default function TransitionLink({ to, children, className, style, ...props }) {
  return (
    <Link to={to} className={className} style={style} {...props}>
      {children}
    </Link>
  )
}
