import { Link } from 'react-router-dom'
// import { usePixelTransition } from './PixelTransition'

export default function TransitionLink({ to, children, className, style, ...props }) {
  // Pixel transition disabled for now — uncomment to re-enable
  // const navigateTo = usePixelTransition()
  // const handleClick = (e) => {
  //   e.preventDefault()
  //   navigateTo(to)
  // }

  return (
    <Link to={to} className={className} style={style} {...props}>
      {children}
    </Link>
  )
}
