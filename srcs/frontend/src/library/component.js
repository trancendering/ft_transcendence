/**
 * @class Component
 * @description Base class of a component
 */
export default class Component {
	constructor(props = {}) {
		this.element = props.element;
		this.components = {};
	}

	async render() {}

	async renderAll() {
		this.render();
		for (let component in this.components) {
			this.components[component].render();
		}
	}

	async handleEvent() {
		for (let component in this.components) {
			this.components[component].handleEvent();
		}
	}
}
