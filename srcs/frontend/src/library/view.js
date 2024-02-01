// 삭제 요망
export default class View {
	constructor(params) {
		this.params = params; // params 어디에 쓰는지 모르겠음
		this.components = {};
	}

	setTitle(title) {
		document.title = title;
	}

	async render() {
		return "";
	}

	async handleEvent() {}
}
