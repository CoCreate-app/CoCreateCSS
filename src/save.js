import ccCss from './';
import crud from '@cocreate/crud-client'
import crdt from '@cocreate/crdt'
// let async = crud.listenAsync(event)





window.addEventListener('load', async() => {


	let links = document.querySelectorAll('[data-save=true][collection][document_id][name]');

	for (let link of links) {

		const collection = link.getAttribute('collection');
		let name = link.getAttribute('name');
		const document_id = link.getAttribute('document_id');

		if (!(collection && name && document_id))
			return;


		window.addEventListener('newCoCreateCssStyles', function(e) {
			let { isFirst, styleList } = e.detail;

			// save as string
			/*if (crdt) {
				crdt.init({
					collection,
					document_id,
					name,
				})
				if (styleList.length)
					crdt.replaceText({ collection, name, document_id, name, value: styleList.join('\r\n') });

			}
			else {*/
			if (styleList.length) {
				// console.log('saveCss', styleList.join('\r\n'));
				crud.updateDocument({
					collection,
					document_id,
					upsert: true,
					// broadcast_sender,
					data: {
						[name]: styleList.join('\r\n')
					},
				});
			}

			//	}
			// save as array
			// if (styleList.length)
			// 	crud.updateDocument({
			// 		collection,
			// 		document_id,
			// 		upsert: true,
			// 		// broadcast_sender,
			// 		data: {
			// 			[name + 'Array']: JSON.stringify(styleList)
			// 		},
			// 	});

		})


	}

})
