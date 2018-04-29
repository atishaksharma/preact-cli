module.exports = class PushManifestPlugin {
	apply(compiler) {
		compiler.plugin('emit', function(compilation, callback) {
			let mainJs, mainCss, scripts=[], styles=[];

			for (let filename in compilation.assets) {
				if (!/\.map$/.test(filename)) {
					if (/route-/.test(filename)) {
						scripts.push(filename);
					} else if (/chunk\.(.+)\.css$/.test(filename)) {
						styles.push(filename);
					} else if (/^bundle(.+)\.css$/.test(filename)) {
						mainCss = filename;
					} else if (/^bundle(.+)\.js$/.test(filename)) {
						mainJs = filename;
					}
				}
			}

			let defaults = {
				[mainCss]: {
					type: 'style',
					weight: 1
				},
				[mainJs]: {
					type: 'script',
					weight: 1
				},
			},
			manifest = {
				'/': defaults
			};

			let path, css, obj;
			scripts.forEach((filename, idx) => {
				obj = Object.assign({}, defaults);
				obj[filename] = { type:'script', weight:0.9 };
				if (css=styles[idx]) obj[css] = { type:'style', weight:0.9 };
				path = filename.replace(/route-/, '/').replace(/\.chunk(\.\w+)?\.js$/, '').replace(/\/home/, '/');
				manifest[path] = obj;
			});

			let output = JSON.stringify(manifest);
			compilation.assets['push-manifest.json'] = {
				source() {
					return output;
				},
				size() {
					return output.length;
				}
			};

			callback();
		});
	}
};
