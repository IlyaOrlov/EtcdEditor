import axios from 'axios'
import { ConfigNode } from '../types'

const apiBase = '/api'

// request templates

export const getResourse = async (url: string) => {
	try {
		const res = await axios.get(`${apiBase}${url}`, {
			headers: {
				'Content-Type': 'application/json',
				// 'Authorization': `Bearer ${this.jwtToken}`,
				// 'X-API-Key': apiKey,
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
		let status = res.status
		if (status === 404 || status === 500) {
			throw new Error(`Couldn't fetch ${url}; received ${status} `)
		}
		let response = res.data

		return {
			status,
			response,
		}
	} catch (e: any) {
		return {
			response: e.message,
		}
	}
}

export const putResourse = async (url: string, data = {}) => {

	const res = await axios.put(`${apiBase}${url}`, data)
	let response = res.data
	let status = res.status

	if (status === 404 || status === 500) {
		throw new Error(`Couldn't fetch ${url}; received ${status} `)
	}
	return {
		status,
		response,
	}
}

export const getNodes = async () => {
	const res = await getResourse('/v2/keys/')
	return res
}

export const saveNode = async (key: string, node?: ConfigNode) => {
	const res = await putResourse(`/v2/keys/${key}`, {value: node?.value || "{}"})
	return res
}