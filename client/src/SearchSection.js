import React, { useState, useEffect, useCallback, useRef  } from "react";
import CollapsibleSection from './CollapsibleSection';
import DatePicker from "react-datepicker";
import Button from './Button';
import Checkbox from './Checkbox';

import "react-datepicker/dist/react-datepicker.css";

let currentPage = 1;
const PaginatorButtons = ({currentPage, clickForward, clickBack, enabled}) => {

	return (
		<div id="paginatorButtons">

			<Button label="<<" onClick={clickBack} isDisabled={enabled}/>
			<label>{currentPage}</label>
			<Button label=">>" onClick={clickForward} isDisabled={enabled}/>
		</div>
	);

}

const DurationRangePicker = ({setMinDuration, setMaxDuration }) => {

    const [left, setLeft] = useState("");
    const [right, setRight] = useState("");
  
    const handleLeftChange = (e) => {
      const newLeft = e.target.value;
      if (newLeft === "" || (/^\d+$/.test(newLeft) && parseInt(newLeft) >= 0)) {
        setLeft(newLeft);
        if (newLeft !== "" && right !== "" && parseInt(newLeft) > parseInt(right)) {
          setRight(newLeft);
        }
      }

      setMinDuration(e.target.value)
      setMaxDuration(right)

      console.log(left, right)

    };
  
    const handleRightChange = (e) => {
		const newRight = e.target.value;
		if (newRight === "" || (/^\d+$/.test(newRight) && parseInt(newRight) >= 0)) {
			setRight(newRight);
			if (newRight !== "" && left !== "" && parseInt(newRight) < parseInt(left)) {
				setLeft(newRight);
			}
		}

		setMinDuration(left)
		setMaxDuration(newRight)
    };
  
    return (
		<div className="flex space-x-2 published-picker number-range">
			<input
			type="text"
			value={left}
			onChange={handleLeftChange}
			placeholder="Min Sec Long"
			className="border rounded p-2"
			/>
			<input
			type="text"
			value={right}
			onChange={handleRightChange}
			placeholder="Max Secs Long"
			className="border rounded p-2"
			/>
		</div>
    );

}

const NumberRange = ({setMinViews, setMaxViews }) => {
    const [left, setLeft] = useState("");
    const [right, setRight] = useState("");
  
    const handleLeftChange = (e) => {
		const newLeft = e.target.value;
		if (newLeft === "" || (/^\d+$/.test(newLeft) && parseInt(newLeft) >= 0)) {

			setLeft(newLeft);
			if (newLeft !== "" && right !== "" && parseInt(newLeft) > parseInt(right)) {
				setRight(newLeft);
			}

		}

		setMinViews(e.target.value);
		setMaxViews(right);
    };
  
    const handleRightChange = (e) => {
	const newRight = e.target.value;
	if (newRight === "" || (/^\d+$/.test(newRight) && parseInt(newRight) >= 0)) {
		setRight(newRight);
		if (newRight !== "" && left !== "" && parseInt(newRight) < parseInt(left)) {
			setLeft(newRight);
		}
	}

	setMinViews(left);
	setMaxViews(e.target.value);

    
    };
  
    return (
		<div className="flex space-x-2 number-range">
			<input
			type="text"
			value={left}
			onChange={handleLeftChange}
			placeholder="Minimum Views"
			className="border rounded p-2"
			/>
			<input
			type="text"
			value={right}
			onChange={handleRightChange}
			placeholder="Maximum Views"
			className="border rounded p-2"
			/>
		</div>
    );
}

const DateRangePicker = ({setMinDate, setMaxDate }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	function changeStartDate(date){
		setStartDate(date);
		setMinDate(date);
	}

	function changeEndDate(date){
		setEndDate(date);
		setMaxDate(date);

	}

	return (
		<div class="date-range-picker">
			<DatePicker
			selected={startDate}
			onChange={(date) => changeStartDate(date)}
			selectsStart
			startDate={startDate}
			endDate={endDate}
			showTimeSelect
			dateFormat="Pp"
			placeholderText="Start Date"
			/>
			<DatePicker
			selected={endDate}
			onChange={(date) => changeEndDate(date)}
			selectsEnd
			startDate={startDate}
			endDate={endDate}
			minDate={startDate}
			showTimeSelect
			dateFormat="Pp"
			placeholderText="End Date"
			/>
		</div>
	);
}

const SortBy = ({ value, setValue }) => {
	return (
	<>
		<label className="">Sort by </label>
		<select value={value} onChange={(e) => setValue(e.target.value)}>
			<option value="duration">Duration</option>
			<option value="published">Published</option>
			<option value="views">Views</option>
		</select>
	</>
	);
}

function formatNumber(num) {
	if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
	if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
	if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
	return num.toString();
}

function formatTime(seconds) {
	const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
	const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
	const secs = (seconds % 60).toString().padStart(2, '0');
	return `${hrs}:${mins}:${secs}`;
}

function formatDate(unixTimestamp) {
	const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}

const ResultsGrid = ({ results }) => {
    const [displayedResults, setDisplayedResults] = useState([]);

    useEffect(() => {
        setDisplayedResults(results);
    }, [results]);

    return (
        <div className="results-grid">

			{displayedResults.map((result, index) => (
				<div
				key={index}
				className="result-item"
				>
					<a href={`https://www.youtube.com/watch?v=${result.id}`}>
						<img src={`https://img.youtube.com/vi/${result.id}/hqdefault.jpg`}></img>
						<span className="video-title">{result.title}</span>
					</a>
					<div className="video-meta">

						<span className="views">{formatNumber(result.views)} views</span> -  
						<span className="duration"> {formatTime(result.duration)}</span>
						<span className="published"> {formatDate(result.published)}</span>

					</div>
				</div>
			))}

        </div>
    );
}

const SearchSection = () => {

    const [results, setResults] = useState([]);
	const [paginatorsDisabled, setPaginatorsDisabled] = useState(false);
	const [displayCurrentPage, setDisplayCurrentPage] = useState(currentPage);
	const [sortBy, setSortBy] = useState("published");

	const [ws, setWs] = useState(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:5000");

		socket.onopen = () => console.log("Connected to WebSocket");
		socket.onmessage = (event) => {

			const message = JSON.parse(event.data);

      		console.log("got message ", message);

			if (message.cmd == "search_results") {

				setPaginatorsDisabled(false);
				setResults(message.data);
			}


		};

		socket.onclose = () => console.log("WebSocket closed");

		setWs(socket);
		return () => socket.close();

	}, []);

	const [inputValue, setInputValue] = useState("");

	const [searchIsDisabled, setSearchIsDisabled] = useState(false);
	const [ascCheckState, updateAscCheckState] = useState(false);
	const [minDuration, setMinDuration] = useState();
	const [maxDuration, setMaxDuration] = useState();
	const [minViews, setMinViews] = useState();
	const [maxViews, setMaxViews] = useState();
	const [minDate, setMinDate] = useState();
	const [maxDate, setMaxDate] = useState();

	const [page, setPage] = useState(1);

	function clickBack() {

		if (displayCurrentPage == 1) {return;}

		setPaginatorsDisabled(true);
		currentPage--;


		search();
	}

	function clickForward() {

		setPaginatorsDisabled(true);
		currentPage++;

		search();
	}

	function search() {

		const searchObject = {};

		if (inputValue == "") {

			alert("Need a channel id");
			return;

		}

		if ((minDate != null) && (minDate != undefined)) {

			searchObject["min_published"] = minDate.getTime() / 1000;

		}

		if ((maxDate != null) && (maxDate != undefined)) {

			searchObject["max_published"] = maxDate.getTime() / 1000;

		}

		if ((minViews != null) && (minViews != undefined) && (minViews != "")) {

			searchObject["min_views"] = parseInt(minViews);

		}

		if ((maxViews != null) && (maxViews != undefined) && (maxViews != "")) {

			searchObject["max_views"] = parseInt(maxViews);

		}

		if ((minDuration != null) && (minDuration != undefined)) {

			searchObject["min_duration"] = parseInt(minDuration);

		}

		if ((maxDuration != null) && (maxDuration != undefined)) {

			searchObject["max_duration"] = parseInt(maxDuration);

		}

		searchObject["channelId"] = inputValue;
		searchObject["sortby"] = sortBy;
		searchObject["asc"] = ascCheckState;
		searchObject["page"] = currentPage;

		console.log(searchObject);

		const message = {cmd: "search", data: JSON.stringify(searchObject)};
  
		setDisplayCurrentPage(currentPage);
		console.log({currentPage, displayCurrentPage})

		ws.send(JSON.stringify(message));

	}

	function clickSearch() {

		setPaginatorsDisabled(true);
		currentPage = 1;

		search();


	}
	return (
		<div>
			<CollapsibleSection title="Search">
				<input
				type="text"
				maxLength={300}
				placeholder="Enter Channel ID"
				className="border p-2 rounded w-full input-box"
				onChange={(e) => setInputValue(e.target.value)}
				/>
				<Button label="Search" onClick={clickSearch} isDisabled={searchIsDisabled}/>
				
				<div className="search-controls">
					<PaginatorButtons clickBack={clickBack} clickForward={clickForward} currentPage={displayCurrentPage} enabled={paginatorsDisabled}></PaginatorButtons>
					<div className="sort">
						<SortBy value={sortBy} setValue={setSortBy}></SortBy>
						<Checkbox label="Asc" state={ascCheckState} setState={updateAscCheckState}></Checkbox>
					</div>
				</div>

				<div class="advanced-features">    
					<NumberRange setMinViews={setMinViews}  setMaxViews={setMaxViews}></NumberRange>
					<DurationRangePicker setMinDuration={setMinDuration}  setMaxDuration={setMaxDuration}></DurationRangePicker>
					<DateRangePicker setMinDate={setMinDate}  setMaxDate={setMaxDate}></DateRangePicker> 
				</div>
				<ResultsGrid results={results}></ResultsGrid>

			</CollapsibleSection>
		</div>
	);
    
}

export default SearchSection;