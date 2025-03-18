import React, { useState, useEffect, useCallback } from "react";
import CollapsibleSection from './CollapsibleSection';
import Button from './Button';
import Checkbox from './Checkbox';



const InfoPane = ( {text, color }) => {

  return (

      <div style={{ color: color, fontSize: "16px", padding: "10px 0px" }}>{text}</div>

  );

}

const ImportSection = () => {

	const [ws, setWs] = useState(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:5000"); // Adjust URL as needed

		socket.onopen = () => console.log("Connected to WebSocket");
		socket.onmessage = (event) => {

			const message = JSON.parse(event.data);

			if (message.cmd == "history_deleted") {

				setInfoText(`Channel deleted`)

			} else if (message.cmd === "import_started") {

				setStopIsDisabled(false);
				setImportIsDisabled(true);
				setInfoText(`Started importing ${message.channelId}`)
				setInfoColor("#000")

			} else if (message.cmd === "import_progress") {

				setInfoText(`${message.progressMessage}`)

			} else if (message.cmd === "import_finished") {

				setStopIsDisabled(true);
				setImportIsDisabled(false);
				setInfoText(`Import finished`);
				setInfoColor("#000");
			}

		};
		socket.onclose = () => console.log("WebSocket closed");

		setWs(socket);
		return () => socket.close();
	}, []);


	const [inputValue, setInputValue] = useState("");
	const [updateCheckState, setUpdateCheckState] = useState(true);
	const [videosCheckState, setVideosCheckState] = useState(true);
	const [shortsCheckState, setShortsCheckState] = useState(false);
	const [livesCheckState, setLivesCheckState] = useState(false);
	const [importIsDisabled, setImportIsDisabled] = useState(false);
	const [stopIsDisabled, setStopIsDisabled] = useState(true);
	const [infoText, setInfoText] = useState("");
	const [infoColor, setInfoColor] = useState("#fffff");

	const clickImport = () => {

		if (inputValue === "") {return;}

		setStopIsDisabled(false);
		setImportIsDisabled(true);
		setInfoText("Calling import on " + inputValue);
		setInfoColor("#000");

		const message = {cmd: "import", data: JSON.stringify({
			channelId: inputValue, 
			videos: videosCheckState, 
			shorts: shortsCheckState, 
			lives: livesCheckState, 
			update: updateCheckState
		})};

		ws.send(JSON.stringify(message));
	}

	const clickDelete = () => {

		const message = {cmd: "delete", data: inputValue};
		ws.send(JSON.stringify(message));
	}

	const clickStop = () => {

		const message = {cmd: "stop_import"};
		ws.send(JSON.stringify(message));

	}

	return (
		<div>
			<CollapsibleSection title="Import">
				<input
					type="text"
					maxLength={300}
					placeholder="Enter Channel ID"
					className="border p-2 rounded w-full input-box"
					onChange={(e) => setInputValue(e.target.value)}
				/>
				<Button label="Import" onClick={clickImport} isDisabled={importIsDisabled}/>
				<Button label="Delete Cache" onClick={clickDelete} />
				<Button label="Stop" onClick={clickStop} isDisabled={stopIsDisabled}/>
				<div className="import-options-pane"> 
					
					<Checkbox label="Update Only" state={updateCheckState} setState={setUpdateCheckState}></Checkbox>
					<Checkbox label="Videos" state={videosCheckState} setState={setVideosCheckState}></Checkbox>
					<Checkbox label="Shorts" state={shortsCheckState} setState={setShortsCheckState}></Checkbox>
					<Checkbox label="Lives" state={livesCheckState} setState={setLivesCheckState}></Checkbox>
			
				</div>
				<InfoPane text={infoText} color={infoColor} />
			</CollapsibleSection>
		</div>
	);

};




export default ImportSection;