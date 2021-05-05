// import crud from '@cocreate/crud-client'
// import crdt from '@cocreate/crdt'


// window.addEventListener('load', () => {
// 	let links = document.querySelectorAll('link[data-save=true]');
// 	for (let link of links) {
// 		let collection = link.getAttribute('data-collection');
// 		let name = link.getAttribute('name');
// 		let document_id = link.getAttribute('data-document_id');
// 		if (collection && name && document_id)
// 			window.addEventListener('newCoCreateCssStyles', function(isFirst, styleList) {
// 				crdt.replaceText({ collection, name, document_id, name: 'css', value: styleList.join('\r\n') });
// 			})

// 	}

// })




if (window.CoCreate.crdt) {
	window.addEventListener('load', () => {
		let links = document.querySelectorAll('link[data-save=true]');
		for (let link of links) {
			let collection = link.getAttribute('data-collection');
			let name = link.getAttribute('name');
			let document_id = link.getAttribute('data-document_id');
			if (collection && name && document_id)
				window.addEventListener('newCoCreateCssStyles', function(isFirst, styleList) {

					window.CoCreate.crdt.init({
						collection,
						document_id,
						name,
					})
					window.CoCreate.crdt.replaceText({ collection, name, document_id, name: 'css', value: styleList.join('\r\n') });
				})
		}
	})
}
else {

	window.addEventListener('load', () => {
		let links = document.querySelectorAll('link[data-save=true]');
		for (let link of links) {
			let collection = link.getAttribute('data-collection');
			let name = link.getAttribute('name');
			let document_id = link.getAttribute('data-document_id');
			if (collection && name && document_id)
				window.addEventListener('newCoCreateCssStyles', function(isFirst, styleList) {
					window.CoCreate.crud.updateDocument({
						collection,
						document_id,
						upsert: true,
						// broadcast_sender,
						data: {
							[name]: styleList.join('\r\n')
						},
					});
				})
		}
	})

}

