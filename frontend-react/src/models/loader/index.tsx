import React from 'react'
import { motion } from 'framer-motion'

const backdrop: any = {
  visible: { opacity: 1, visibility: 'visible' },
  hidden: { opacity: 0, visibility: 'hidden' },
}

export const Loader = () => {
	return (
		<motion.div
			className="loader-wrapper"
			variants={backdrop}
			initial="hidden"
			animate="visible"
			exit="hidden"
		>
			<div className="loader">
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
		</motion.div>
	)
}
