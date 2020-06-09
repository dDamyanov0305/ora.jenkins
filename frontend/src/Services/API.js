export class API {
	constructor(url) {
		this.handlers = {}

		this.tasks = []

		this.socket = new WebSocket(url)

		this.socket.onopen = () => {

            console.log("socket opened")
            
			this.tasks.forEach(task => {
				task()
			})
			this.tasks = []
		}

		this.socket.onmessage = event => {
			const data = JSON.parse(event.data)

			const handler = this.handlers[data.type]

			if(handler !== undefined){
				handler(data)
			}
			else {
				//console.log(`unknown event: ${data.type}`)
			}
		}

		this.socket.onclose = () => {
			console.log("socket disconnected")
		}
	}

	on = (event, callback) => {
		//console.log(`registered event ${event}`)
		this.handlers[event] = callback
		
	}

	send = (event, data = {}) => {
		const fnToFulfill = () => {
			this.socket.send(
				JSON.stringify({
					type: event,
					data:{...data, token:localStorage.getItem('token') },
				
				}),
			)
		}

		if (this.socket.readyState !== WebSocket.OPEN) {
			//console.log(`queued event "${event}"`)

			this.tasks.push(fnToFulfill)
		} else {
			fnToFulfill()
		}
	}
}

const api = new API("ws://192.168.1.51:8888/ws")
export default api
