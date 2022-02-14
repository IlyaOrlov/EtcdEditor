import { Stack, alert, defaultModules } from '@pnotify/core'
import '@pnotify/core/dist/PNotify.css'
import '@pnotify/confirm/dist/PNotifyConfirm.css'


var defaultStack = new Stack({
	dir1: 'down',
	dir2: 'left',
	firstpos1: 25,
	firstpos2: 25,
	spacing1: 10,
	spacing2: 10,
	push: 'bottom',
	maxOpen: 4,
	maxStrategy: 'close', //wait
	context: document.body,
	modal: false, //ish
})

export function notifyMain(title, text, className) {
	alert({
		title,
		text,
		stack: defaultStack,
		addClass: `custom-notify ${className || ''}`,
		icon: false,
		closerHover: false,
		sticker: false,
		stickerHover: false,
		styling: '',
		delay: 2000,
		hide: true,
	})
}

export function notifyError(title, text) {
	alert({
		title,
		text,
		stack: defaultStack,
		addClass: 'custom-notify error',
		icon: false,
		closerHover: false,
		sticker: false,
		stickerHover: false,
		styling: '',
		delay: 2000,
		hide: true,
	})
}