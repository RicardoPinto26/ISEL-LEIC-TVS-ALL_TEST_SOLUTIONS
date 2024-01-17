import os       from 'node:os';
import path     from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fetch    from 'node-fetch';
import express  from 'express';

const DEFAULT_ELASTIC_URL = 'http://localhost:9200'
const DEFAULT_MESSAGE = "sudo apt install fortune-mod fortunes"

const NODE_PORT   = process.env["NODE_PORT"];
const ELASTIC_URL = process.env["ELASTIC_URL"] || DEFAULT_ELASTIC_URL;

const APP_DIR = path.dirname(fileURLToPath(import.meta.url));

///////////////////////////////////////////////////////
//
// Server: Listen on NODE_PORT and serve the homepage
//

if (!NODE_PORT) {
	process.stderr.write("ERROR: missing NODE_PORT configuration variable\n");
	process.exitCode = 1;
} else {
	const app = express();
	app.use("/files", express.static(path.join(APP_DIR, "files")))
	app.get("/", getHomePage);
	app.listen(NODE_PORT);
}

///////////////////////////////////////////////////////
//
// The only service available: 
//   - increment access counter
//   - inform about listening port and current count
//

async function getHomePage(req, res) {
	const host = os.hostname();
	const port = NODE_PORT;
	const counter = await incrementAndGetCounter();
	const fortune = await getFortune();
	const message = fortune ? fortune : DEFAULT_MESSAGE;
	
	const homePage = buildHomePage(host, port, counter, message);
	
	res.send(homePage);
}

///////////////////////////////////////////////////////
//
// Data access: 
//   - atomically increment the access counter
//   - return the current count
//   - returns undefined if database is unavailable
//

async function incrementAndGetCounter() {
	try {
		const response = await fetch(`${ELASTIC_URL}/stats/_update/1?retry_on_conflict=8&_source=counter`,
		{
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
					"script" : {
						"source": "ctx._source.counter += params.count",
						"lang": "painless",
						"params": {
							"count": 1
						}
					},
					"upsert": {
						"counter": 1
					}
				}
			),
		});
		const answer = await response.json();
		return answer.get._source.counter;
	} catch (err) {
		console.error(err);
		return null;
	}
}

///////////////////////////////////////////////////////
//
// Get fortune: 
//   - runs 'fortune' and collects what gets written
//     to standard output
//

async function getFortune() {
	return new Promise((resolve) => {
		exec("/usr/games/fortune", (error, stdout, stderr) => { resolve(stdout) })
	})
}

///////////////////////////////////////////////////////
//
// Build homepage: 
//   - title
//   - show listening port
//   - show counter, if available
//

function buildHomePage(host, port, counter, message) {
	const formattedCounter = (counter == null ? "----" : String(counter).padStart(4, '0'));
	return `
		<html>
			<head>
				<link rel="stylesheet" type="text/css" href="files/tvs.css">
			</head>
			<body>
				<div class="image-container">
					<img src="files/isel.png" alt="ISEL" width="164" height="97">
					<div class="title">
            <p>Técnicas de Virtualização de Sistemas</p>
						<p>System Virtualization Techniques</p>
					</div>
					<img src="files/tvs.png" alt="TVS" width="100" height="100">
				</div>
				<div class="info">
					<div>
						<span><strong>HOST: </strong>${host}</span>
						<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
						<span><strong>PORT: </strong>${port}</span>
					</div>
					<div>
						<span><strong>COUNT: </strong>${formattedCounter}</span>
					</div>
				</div>
				${
					counter == null ?
						`<div class="warning">(database unavailable)</div>` :	``
				}
				<div class="payload">
					<pre>${message}</pre>
				</div>
			</body>
		</html>
	`;
}
