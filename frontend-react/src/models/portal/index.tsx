import React, {FC} from 'react'
import ReactDOM from 'react-dom'

export const Portal: FC = ({ children }) => {
	const [container] = React.useState(() => document.createElement('div'))

	React.useEffect(() => {
		document.body.style.overflow = 'hidden'
		document?.body?.querySelector('#root')?.appendChild(container)
		return () => {
			document.body.style.overflow = 'visible'
			document?.body?.querySelector('#root')?.removeChild(container)
		}
	}, [])
	return ReactDOM.createPortal(children, container)
}