import React, { FC } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import { Portal } from '../portal'


const backdrop: any = {
  visible: { opacity: 1, visibility: 'visible' },
  hidden: { opacity: 0, visibility: 'hidden' },
}

const modal: any = {
  hidden: { opacity: 0, visibility: 'hidden' },
  visible: {
    opacity: 1,
    visibility: 'visible',
    transition: { delay: 0.2 },
  },
}

type ModalProps = {
  isShown: boolean,
  keyName: string | null,
  titleText: string,
  hideModal: any,
}

export const Modal: FC<ModalProps> = ({ children, isShown, titleText, hideModal }) => {
  React.useEffect(() => {
    const handleEscKey = (e: any) => {
      if (e.keyCode === 27) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [])

  const closeModal = () => {
    hideModal()
  }

  return (
    <AnimatePresence exitBeforeEnter>
      {isShown && (
        <Portal>
          <motion.div
            className="pp"
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="pp__bg" onClick={closeModal}></div>
            <motion.div className="pp__content pp__club-request" variants={modal}>
              <button className="pp__close" onClick={closeModal}>
                <span className="close__lane" />
                <span className="close__lane" />
              </button>

              <div className="pp__content-head">
                <h4 className="pp__title">{titleText}</h4>
              </div>
              <div className="pp__content-body">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  )
}
