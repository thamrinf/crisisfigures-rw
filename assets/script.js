"use strict";

let _T_DATA;
let _GEO_WORLD = [];
let _geojson_layer = [];
let baseColor = ["#E84D6B", "#98AAD0", "#FAE173", "#DA625D", "#336778"];
let styleCss = getComputedStyle(document.body);
let tmpChart = [];
let _TooltipMap = [];
let dataForTable = [];
let dataForTableDetail = [];
let barChart = [];
let dtTable;
let dtTableDetail;
let dataComboBox = [];
let dataDetailMaps = [];
let dataDetailMapsForTable = [];
let tmpArrDataDetailMaps = [];
let dataCountry = [];
let tmpCountry = [];
let arrDataTables = [];

// SET INTIAL MAP
const InitMap = () => {
	let baseLat = 17.722424,
		baseLong = 11.7036507,
		baseZoom = 2.73,
		baseDelta = 0.5,
		baseSnap = 0.5,
		baseMinZoom = 2,
		baseMaxZoom = 12;
	let baseOption = {
		center: [baseLat, baseLong],
		zoom: baseZoom,
		zoomDelta: baseDelta,
		zoomSnap: baseSnap,
		minZoom: baseMinZoom,
		maxZoom: baseMaxZoom,
		zoomControl: false,
		scrollWheelZoom: false,
		doubleClickZoom: false,
		preferCanvas: true,
	};

	let mymap = L.map("main-map", baseOption);
	var gv_baseMap = L.mapboxGL({
		accessToken:
			"pk.eyJ1IjoidGhhbXJpbmYiLCJhIjoiYzA1MmJjMzI1N2E5NzNhN2I2MzU4MDkzZWU4ODQxNzAifQ.3qQApYaqLA0bGC3Z5PCnUg",
		style: "mapbox://styles/thamrinf/ck10tppqm034k1cr0bu9mhdpl",
		zIndex: 1,
	});
	gv_baseMap.addTo(mymap);

	return mymap;
};

let map = InitMap();
// END OF INITIAL MAP

// draw map
function drawGeoJson(id, geojsonData) {

	return new Promise((success, error) => {

		if (map.hasLayer(_geojson_layer[id])) {
			map.removeLayer(_geojson_layer[id]);
		}

		let colBorder = styleCss.getPropertyValue('--colBorder').trim()
		let dataOps = {
			getColor: (col) => {
				if (col != "") {
					return col;
				} else {
					return "transparent";
				}
			},
			style: (f) => {
				return {
					weight: 0.5,
					opacity: 1,
					color: f.properties.color != "transparent" ? colBorder : "transparent",
					fillOpacity: 0.7,
					fillColor: dataOps.getColor(f.properties.color)
				};
			},
			highlightFeature: (e) => {
				let layer = e.target;
				let tmpWeight = 0.8;
				if (layer.feature.properties.color != "transparent") {
					tmpWeight = 2;
				}
				layer.setStyle({
					weight: tmpWeight,
					opacity: 1,
					color: "#FFFFFF",
					fillColor: dataOps.getColor(layer.feature.properties.color)
				});

				if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
					layer.bringToFront();
				}
			},
			resetHighlight: (e) => {
				_geojson_layer[id].resetStyle(e.target);
			},
			onEachFeature: (f, layer) => {

				let idxToolTip = "tooltip" + f.properties.adm0_a3;
				if (_TooltipMap[idxToolTip] !== undefined) {
					_TooltipMap[idxToolTip].unbindTooltip();
				}

				if (tmpArrDataDetailMaps.includes(f.properties.adm0_a3) == true) {

					let tmpContent = "";
					tmpContent += "<div class='w-tooltip'>"
						+ "<div class='border-bottom py-2 px-1 f-12px mb-1'>"
						+ (f.properties.admin).toUpperCase()
						+ "</div>";
					dataDetailMaps[f.properties.adm0_a3].forEach((val, idx) => {
						tmpContent += "<div class='border-top p-1'>"
							+ "<span class='f-11px d-inline-block'>" + val.figure_name + "</span>"
							+ "<div class='row mt-1 mx-0'>"
							+ "<div class='col-6 f-10px px-1'>"
							+ "VALUE:<br />" + (isNumber(val.figure_value) == true ? convertToInternationalCurrencySystem(val.figure_value) : val.figure_value) + "<br />DATE:<br />" + val.figure_date
							+ "</div>"
							+ "<div class='col-6 f-10px px-1'>"
							+ "SOURCE:<br />" + val.figure_source
							+ "</div>"
							+ "</div>"
							+ "</div>";
					});
					tmpContent += "</div>";

					_TooltipMap[idxToolTip] = layer.bindTooltip(
						tmpContent
					);
					// _TooltipMap[idxToolTip + "_popup"] = layer.bindPopup(
					// 	tmpContent
					// );
				}

				layer.on({
					mouseover: dataOps.highlightFeature,
					mouseout: dataOps.resetHighlight,
					click: mapClick,
				});
			}
		};

		_geojson_layer[id] = L.geoJson(geojsonData, {
			style: dataOps.style,
			onEachFeature: dataOps.onEachFeature,
		}).addTo(map);

	});
}

// fungsi pas click map
function mapClick(e) {
	let layer = e.target.feature.properties;
	let idxCountry = dataCountry.indexOf(layer.admin);

	if (idxCountry != '-1') {
		$(".allCountry").val(idxCountry).trigger('change');
	}
}


// highchart, hanya untuk backup
function barChartMultiDataLabel(arrCategories, arrSeries, arrColor, total, idBarChartDataLabel) {

	if (tmpChart[idBarChartDataLabel] === undefined) {
		tmpChart[idBarChartDataLabel] = "";
	}

	if (tmpChart[idBarChartDataLabel] != "") {
		tmpChart[idBarChartDataLabel].destroy();
	}

	let bgColor = "#fff";
	let brColor = "#283552";
	let clsName = "tmpTitleCategory";
	let colTxt = "#000";

	let heightChart = arrCategories.length * 60;

	let hChart = Highcharts.chart(idBarChartDataLabel, {
		chart: {
			type: 'bar',
			width: 425,
			height: heightChart,
			backgroundColor: bgColor,
			borderColor: brColor
		},
		title: {
			text: ""
		},
		xAxis: {
			categories: arrCategories,
			title: {
				text: null
			},
			labels: {
				useHTML: true,
				x: 2,
				y: -20,
				align: 'left',
				style: {
					color: colTxt,
					fontSize: "10px",
					// wordBreak: 'break-all',
					textOverflow: 'allow'
				},
				overflow: "allow",
				allowOverlap: true
			},
			gridLineColor: "transparent"
		},
		yAxis: {
			visible: false,
			min: 0,
			title: {
				enabled: false
			},
			labels: {
				overflow: 'justify'
			},
			opposite: true,
			gridLineColor: brColor
		},
		tooltip: {
			valueSuffix: ' Cable'
		},
		plotOptions: {
			bar: {
				dataLabels: {
					enabled: true,
					allowOverlap: true,
					// useHTML:true,
					formatter: function () {
						return (this.y != 0) ? convertToInternationalCurrencySystem(this.y) + " (" + round((this.y / total) * 100, 2) + "%)" : "";
						// return '<div class="datalabel" style="position: relative; top: 20px"><b>'+ round((this.y/totalCable)*100, 2) +' Cable</div><br/><div class="datalabelInside" style="position: absolute; top: 45px"><b>'+ this.y +'%</div>';
					},
					color: colTxt,
					borderColor: "transparent",
					shadow: false,
				},
				shadow: false,
				borderRadius: 5,
				borderColor: "transparent",
				className: clsName,
				cursor: "pointer"
			},
			series: {
				colorByPoint: true,
				colors: arrColor,
				pointWidth: 20,
				groupPadding: 0.01,
				pointPadding: 0.01,
				dataLabels: {
					shadow: false
				}
			}
		},
		legend: {
			enabled: false
		},
		series: [{
			name: "Total",
			data: arrSeries,
			type: "bar",
		}]
	});

	tmpChart[idBarChartDataLabel] = hChart;
}

// bar chart c3js
function barChartC3(arrCountry, arrSeries, categories, idBarChartDataLabel, tmpHeight = 30) {
	if (tmpChart[idBarChartDataLabel] === undefined) {
		tmpChart[idBarChartDataLabel] = "";
	}

	if (tmpChart[idBarChartDataLabel] != "") {
		tmpChart[idBarChartDataLabel].destroy();
	}

	let lbl = arrSeries[0];

	let hChart = c3.generate({
		bindto: idBarChartDataLabel,
		legend: {
			hide: true
		},
		padding: {
			left: 110,
		},
		transition: {
			duration: 1000
		},
		size: {
			height: parseInt(arrCountry.length) * tmpHeight,
		},
		data: {
			x: 'x',
			columns: [
				arrCountry, // ['x', 'United States of America','India','Brazil','Russian Federation','Colombia','Peru','Mexico','Spain','Argentina','South Africa'],
				arrSeries //[categories, 7009110,6074702,4717991,1159573,806038,800142,726431,716481,702484,670766],
			],
			type: 'bar',
			labels: {
				format: function (v, id, i, j) {
					return d3.format('.3s')(v);
				}
			},
		},
		color: {
			pattern: ['#007CE0']
		},

		axis: {
			rotated: true,
			x: {
				type: 'category', // this needed to load string x value
				tick: {
					outer: false,
					multiline: true,
					multilineMax: 3,
				},
			},
			y: {
				show: false,
				// max: 216000000
				max: (arrSeries.length > 1 ? parseInt(arrSeries[1]) + 2500000 : 0), //set the max so that the label does not get cropped
			}
		},

		tooltip: {
			format: {
				value: function (value) {
					return d3.format(".3s")(value)
				},
				name: function (name) { return name + ':'; },
			}
		},

		bar: {
			width: {
				ratio: .7
			},
			spacing: 100
		}

	});

	tmpChart[idBarChartDataLabel] = hChart;
}

// pembulatan
function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

// cek integer atau bukan
function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

// convert ke currency
function convertToInternationalCurrencySystem(labelValue) {

	// Nine Zeroes for Billions
	return Math.abs(Number(labelValue)) >= 1.0e+9

		? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
		// Six Zeroes for Millions 
		: Math.abs(Number(labelValue)) >= 1.0e+6

			? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + "M"
			// Three Zeroes for Thousands
			: Math.abs(Number(labelValue)) >= 1.0e+3

				? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

				: Math.abs(Number(labelValue));

}

// bar chart supaya dinamis
function changeBarChart(idxComboBox, idChart) {
	let country = (barChart[dataComboBox[parseInt(idxComboBox)]]["crisis_name"].substr(0, barChart[dataComboBox[parseInt(idxComboBox)]]["crisis_name"].length - 1)).split(";");
	let data = (barChart[dataComboBox[parseInt(idxComboBox)]]["figure_value"].substr(0, barChart[dataComboBox[parseInt(idxComboBox)]]["figure_value"].length - 1)).split(";");
	let dataConvert = data.map(function (x) {
		return parseInt(x, 10);
	});

	let tmpArr = [];
	country.forEach((val, idx) => {
		let tmpObj = {};
		tmpObj.crisis_name = val;
		tmpObj.figure_value = dataConvert[idx];
		tmpArr.push(tmpObj);
	});

	tmpArr.sort(function (a, b) {
		return b.figure_value - a.figure_value;
	});

	let sortCountry = [];
	let sortValue = [];

	tmpArr.forEach((val2, idx2) => {
		sortCountry.push(val2.crisis_name);
		sortValue.push(val2.figure_value);
	});

	// let total = dataConvert.reduce((a, b) => a + b, 0);

	// barChartMultiDataLabel(country, dataConvert, baseColor, total, idChart);
	sortCountry.unshift("x");
	sortValue.unshift(dataComboBox[parseInt(idxComboBox)]);
	// console.log(sortCountry);
	// console.log(sortValue);
	// console.log(dataComboBox[parseInt(idxComboBox)]);
	barChartC3(sortCountry, sortValue, dataComboBox[parseInt(idxComboBox)], idChart);
}

function createBar(cls, value, totalValue, colorHex) {
	let data = [value];
	let width = 200;
	let x = d3.scaleLinear()
		.domain([0, 10])
		.range([0, width])

	let y = d3.scaleBand()
		.domain(d3.range(data.length))
		.range([0, totalValue * data.length])


	const svg = d3.select(cls + " svg")
		.attr("width", width)
		.attr("height", 20)
		.attr("font-family", "sans-serif")
		.attr("font-size", "10")
		.attr("text-anchor", "end");

	const bar = svg.selectAll("g")
		.data(data)
		.join("g")
		.attr("transform", (d, i) => `translate(0,${y(i)})`);

	bar.append("rect")
		.attr("fill", colorHex)
		.attr("width", value / totalValue * 200)
		.attr("height", 20);

	// bar.append("text")
	// 	.attr("fill", "white")
	// 	.attr("x", d => x(d) - 3)
	// 	.attr("y", (y.bandwidth() - 1) / 2)
	// 	.attr("dy", "0.35em");

	return svg.node();
}

async function init() {
	let tmpObj = {};
	tmpObj.need = "";
	tmpObj.target = "";
	tmpObj.appeals = "";
	tmpObj.requirment = 0;
	tmpObj.link = "";
	let x = 1;
	let tmpCrisisIndex = "";
	let tmpCrisisName = "";
	let tmpIso3 = "";

	_T_DATA = await d3.csv("assets/csv/dataviz-reliefweb-new.csv").then((dt) => {
		// for table
		let tmpTotalPeopleInNeed = 0;
		let tmpPeopleTargeted = 0;
		dt.forEach((val, idx) => {
			if (val.figure_name == "People in Need" || val.figure_name == "Total People in Need") {
				if (tmpTotalPeopleInNeed < parseInt(val.figure_value)) {
					tmpTotalPeopleInNeed = parseInt(val.figure_value);
				}
			}
			if (val.figure_name == "People Targeted for Assistance" || val.figure_name == "Total People Targeted for Assistance") {
				if (tmpPeopleTargeted < parseInt(val.figure_value)) {
					tmpPeopleTargeted = parseInt(val.figure_value);
				}
			}

			if (dataDetailMapsForTable[val.crisis_index] === undefined) {
				dataDetailMapsForTable[val.crisis_index] = [];
				dataDetailMapsForTable[val.crisis_index]["maxValue"] = 0;
			}
			let obj = {};
			obj.crisis_index = val.crisis_index;
			obj.crisis_name = val.crisis_name;
			obj.crisis_iso3 = val.crisis_iso3;
			obj.figure_name = val.figure_name;
			obj.figure_source = val.figure_source;
			obj.figure_value = val.figure_value;
			obj.figure_date = val.figure_date;
			obj.figure_url = val.figure_url;

			dataDetailMapsForTable[val.crisis_index].push(obj);
			dataDetailMapsForTable[val.crisis_index]["maxValue"] = parseInt(dataDetailMapsForTable[val.crisis_index]["maxValue"]) > parseInt(val.figure_value) ? parseInt(dataDetailMapsForTable[val.crisis_index]["maxValue"]) : parseInt(val.figure_value);
		});

		dt.forEach((val, idx) => {

			// DATATABLES
			if (tmpObj.appeals != "" && tmpObj.appeals != val.crisis_name) {

				tmpObj.need = convertToInternationalCurrencySystem(tmpObj.need) + "<br /><div data-value='" + tmpObj.need + "' data-max='" + tmpTotalPeopleInNeed + "' class='need" + tmpIso3 + "'></div>";
				tmpObj.target = convertToInternationalCurrencySystem(tmpObj.target) + "<br /><div data-value='" + tmpObj.target + "' data-max='" + tmpPeopleTargeted + "' class='target" + tmpIso3 + "'></div>";
				tmpObj.requirment = convertToInternationalCurrencySystem(tmpObj.requirment) + "<br /><div class='requirment" + tmpIso3 + "'></div>";

				dataForTable.push(tmpObj);
				dataCountry.push(tmpCrisisName);
				// dataCountry[tmpCrisisIndex] = tmpCrisisName;
				tmpCountry.push(tmpIso3);

				tmpObj = {};
				tmpObj.need = "";
				tmpObj.target = "";
				tmpObj.requirment = 0;
				tmpObj.link = "";

				tmpCrisisName = "";
				tmpCrisisIndex = "";
				tmpIso3 = "";
			}
			tmpCrisisName = val.crisis_name;
			tmpCrisisIndex = val.crisis_index;
			tmpIso3 = val.crisis_iso3;

			tmpObj.appeals = val.crisis_name;

			tmpObj.type = "HRP";
			if (tmpObj.need == "") {
				tmpObj.need = 0;
			}
			if (tmpObj.target == "") {
				tmpObj.target = 0;
			}
			if (val.figure_name == "People in Need" || val.figure_name == "Total People in Need") {
				tmpObj.need = parseInt(val.figure_value);
			}
			if (val.figure_name == "People Targeted for Assistance" || val.figure_name == "Total People Targeted for Assistance") {
				tmpObj.target = parseInt(val.figure_value);
			}

			if (isNumber(val.figure_value) == true) {
				tmpObj.requirment += parseInt(val.figure_value);
			}

			tmpObj.link += "<a href='" + val.figure_url + "' target='_blank'>LINK</a><br />";



			// BARCHART
			let tmpFigureName = val.figure_name.includes("Refugees");
			if (tmpFigureName === true) {
				tmpFigureName = "Refugees";
			} else {
				tmpFigureName = val.figure_name;
			}

			if (dataComboBox.includes(tmpFigureName) === false) {
				dataComboBox.push(tmpFigureName);
			}

			if (barChart[tmpFigureName] === undefined) {
				barChart[tmpFigureName] = [];
				barChart[tmpFigureName]["crisis_name"] = "";
				barChart[tmpFigureName]["figure_value"] = "";

				barChart[tmpFigureName]["crisis_name"] += val.crisis_name + ";";
				barChart[tmpFigureName]["figure_value"] += (val.figure_value != undefined ? val.figure_value : "-") + ";";
			} else {
				barChart[tmpFigureName]["crisis_name"] += val.crisis_name + ";";
				barChart[tmpFigureName]["figure_value"] += (val.figure_value != undefined ? val.figure_value : "-") + ";";
			}

			// MAPS
			let tmpObj2 = {};
			if (tmpArrDataDetailMaps.includes(val.crisis_iso3) === false) {
				tmpArrDataDetailMaps.push(val.crisis_iso3);
				dataDetailMaps[val.crisis_iso3] = [];
			}
			dataDetailMaps[val.crisis_iso3].push(val);



			// if(x==1){
			// 	dataCountry.push(val.crisis_name);
			// 	tmpCountry.push(val.crisis_iso3);
			// }

			if (x == dt.length) {
				// tmpObj.need = convertToInternationalCurrencySystem(tmpObj.need);
				// tmpObj.target = convertToInternationalCurrencySystem(tmpObj.target);
				// tmpObj.requirment = convertToInternationalCurrencySystem(tmpObj.requirment);

				// dataForTable.push(tmpObj);


				tmpObj.need = convertToInternationalCurrencySystem(tmpObj.need) + "<br /><div data-value='" + tmpObj.need + "' data-max='" + tmpTotalPeopleInNeed + "' class='need" + tmpIso3 + "'></div>";
				tmpObj.target = convertToInternationalCurrencySystem(tmpObj.target) + "<br /><div data-value='" + tmpObj.target + "' data-max='" + tmpPeopleTargeted + "' class='target" + tmpIso3 + "'></div>";
				tmpObj.requirment = convertToInternationalCurrencySystem(tmpObj.requirment) + "<br /><div class='requirment" + tmpIso3 + "'></div>";

				dataForTable.push(tmpObj);
				dataCountry.push(tmpCrisisName);
				// dataCountry[tmpCrisisIndex] = tmpCrisisName;
				tmpCountry.push(tmpIso3);
			}
			x++;
		});

		return dt;
	});

	_GEO_WORLD = await d3.json("assets/geojson/world.geojson").then((d) => {
		d.features.forEach((f) => {
			try {
				if (dataDetailMaps[f.properties.adm0_a3] != undefined) {
					let tmpVal = (dataDetailMaps[f.properties.adm0_a3]).find(o => o.figure_name == "People in Need");
					let tmpFigureValue = tmpVal.figure_value;
					let color = "";
					if (tmpFigureValue < 3000000) {
						color = "#F7DBD9";
					} else if (tmpFigureValue >= 3000000 && tmpFigureValue < 5000000) {
						color = "#F6BDB9";
					} else if (tmpFigureValue >= 5000000 && tmpFigureValue < 10000000) {
						color = "#F5A09A";
					} else if (tmpFigureValue >= 10000000 && tmpFigureValue < 15000000) {
						color = "#F4827A";
					} else if (tmpFigureValue >= 5000000) {
						color = "#F2645A";
					}
					f.properties.color = color;
				} else {
					f.properties.color = "transparent";
				}
			} catch (err) {
				f.properties.color = "transparent";
			}
		});
		return d;
	});

	// init map
	drawGeoJson("idGeoWorld", _GEO_WORLD);

	// init bar chart
	changeBarChart(0, "#barChart1");
	changeBarChart(1, "#barChart2");

	// untuk isi combobox country, combobox bar chart
	$("#main-chart1 select.selectChart1 option, #main-chart2 select.selectChart2 option, .allCountry option").remove();
	let textOption1 = "", textOption2 = "", textOptionCountry = "";
	let y = 0;
	dataComboBox.forEach((val, idx) => {
		textOption1 += "<option " + (y == 0 ? "selected='selected'" : "") + " value='" + idx + "'>" + val.toUpperCase() + "</option>";
		textOption2 += "<option " + (y == 1 ? "selected='selected'" : "") + " value='" + idx + "'>" + val.toUpperCase() + "</option>";
		y++;
	});
	textOptionCountry += "<option value='all' data-crisisnsame = 'all'>ALL COUNTRY</option>";
	dataCountry.forEach((val, idx) => {
		textOptionCountry += "<option value='" + idx + "' data-crisisName='" + val + "'>" + val.toUpperCase() + "</option>";
	});
	$("#main-chart1 select.selectChart1").append(textOption1);
	$("#main-chart2 select.selectChart2").append(textOption2);
	$("select.allCountry").append(textOptionCountry);

	$(".detailContentFromMaps").hide();
}

function createTable(idDiv, fixData, dataColumns, type = "default") {
	setTimeout(() => {
		if (type != "default") {
			if (arrDataTables[idDiv] !== undefined) {
				arrDataTables[idDiv].destroy();
			}
		}

		if (arrDataTables[idDiv] == undefined) {
			arrDataTables[idDiv] = [];
		}

		arrDataTables[idDiv] = $(idDiv).DataTable({
			data: fixData,
			"bLengthChange": false,
			columns: dataColumns,
			"fnDrawCallback": function (oSettings) {
				// console.log(oSettings);
				if (type == "default") {
					let start = (oSettings.iDraw * 10) - 10;
					let end = oSettings.iDraw * 10;

					for (start; start < end; start++) {
						$(".need" + tmpCountry[start] + " svg").remove();
						$(".need" + tmpCountry[start]).append("<svg></svg>");
						let value = $(".need" + tmpCountry[start]).data("value");
						let max = $(".need" + tmpCountry[start]).data("max");
						createBar('.need' + tmpCountry[start], value, max, "#e65454");

						$(".target" + tmpCountry[start] + " svg").remove();
						$(".target" + tmpCountry[start]).append("<svg></svg>");
						let value2 = $(".target" + tmpCountry[start]).data("value");
						let max2 = $(".target" + tmpCountry[start]).data("max");
						createBar('.target' + tmpCountry[start], value2, max2, "#689ece");
					}
				} else {
					let start = (oSettings.iDraw * 10) - 10;
					let end = oSettings.iDraw * 10;
					for (start; start < end; start++) {
						$(".figureValue" + start + " svg").remove();
						$(".figureValue" + start).append("<svg></svg>");
						let value2 = $(".figureValue" + start).data("value");
						let max2 = $(".figureValue" + start).data("max");
						createBar('.figureValue' + start, value2, max2, "#689ece");
					}
				}
			}
		}).on('page.dt', function () {
			// let info = dtTable.page.info();
			// console.log(info.page+1);
		});

	}, 2000);
}

$(document).ready(function () {
	init();
	createTable('#dtTable', dataForTable, [
		{ data: "appeals" },
		{ data: "type" },
		{ data: "need" },
		{ data: "target" },
		{ data: "requirment" },
		{ data: "link" },
	], "default");
	// setTimeout(() => {
	// 	dtTable = $('#dtTable').DataTable({
	// 		data: dataForTable,
	// 		"bLengthChange": false,
	// 		columns: [
	// 			{ data: "appeals" },
	// 			{ data: "type" },
	// 			{ data: "need" },
	// 			{ data: "target" },
	// 			{ data: "requirment" },
	// 			{ data: "link" },
	// 		],
	// 		"fnDrawCallback": function (oSettings) {
	// 			// console.log(oSettings);
	// 			let start = (oSettings.iDraw * 10) - 10;
	// 			let end = oSettings.iDraw * 10;
	// 			for (start; start < end; start++) {
	// 				$(".need" + tmpCountry[start] + " svg").remove();
	// 				$(".need" + tmpCountry[start]).append("<svg></svg>");
	// 				let value = $(".need" + tmpCountry[start]).data("value");
	// 				let max = $(".need" + tmpCountry[start]).data("max");
	// 				createBar('.need' + tmpCountry[start], value, max, "#e65454");

	// 				$(".target" + tmpCountry[start] + " svg").remove();
	// 				$(".target" + tmpCountry[start]).append("<svg></svg>");
	// 				let value2 = $(".target" + tmpCountry[start]).data("value");
	// 				let max2 = $(".target" + tmpCountry[start]).data("max");
	// 				createBar('.target' + tmpCountry[start], value2, max2, "#689ece");
	// 			}
	// 		}
	// 	}).on('page.dt', function () {
	// 		// let info = dtTable.page.info();
	// 		// console.log(info.page+1);
	// 	});
	// }, 2000);

	$("#main-chart1 select").on("change", function () {
		let id = $(this).val();
		changeBarChart(id, "#barChart1");
	});
	$("#main-chart2 select").on("change", function () {
		let id = $(this).val();
		changeBarChart(id, "#barChart2");
	});
	$("select.allCountry").on("change", function () {
		let id = $(this).val();
		if (id != null) {
			if (id != "all") {
				let getDataObj = (_T_DATA).find(o => o.crisis_name == $(".allCountry option:selected").data("crisisname"));
				let getCrisisIndex = getDataObj.crisis_index;

				let tmpCountryName = dataCountry[id];
				let tmpGeoJson = (_GEO_WORLD.features).find(o => o.properties.name_long == tmpCountryName);
				let tmp_map = L.geoJSON(tmpGeoJson);
				let cur_location = tmp_map.getBounds();
				map.fitBounds(cur_location, {
					maxZoom: 9
				});
				$(".mainChart").hide();
				$(".mainTable").hide();


				let data = "";
				data = dataDetailMapsForTable[getCrisisIndex];
				let arrFigureName = ["x"];
				let arrFigureValue = ["Figure Value"];

				data.sort(function (a, b) {
					return b.figure_value - a.figure_value;
				});

				dataForTableDetail = [];
				let x = 0;
				data.forEach((val, idx) => {
					arrFigureName.push(val.figure_name);
					arrFigureValue.push(val.figure_value);

					let obj = {};
					obj = val;
					obj.link = "<a href='" + val.figure_url + "' target='_blank'>LINK</a><br />";
					obj.figureValue = convertToInternationalCurrencySystem(parseInt(val.figure_value)) + "<br /><div data-value='" + parseInt(val.figure_value) + "' data-max='" + dataDetailMapsForTable[getCrisisIndex]["maxValue"] + "' class='figureValue" + x + "'></div>";

					dataForTableDetail.push(obj);
					x++;
				});

				barChartC3(arrFigureName, arrFigureValue, "", "#barChartDetail", 50);

				createTable('#dtTableDetail', dataForTableDetail, [
					{ data: "crisis_name" },
					{ data: "crisis_iso3" },
					{ data: "figure_name" },
					{ data: "figure_source" },
					{ data: "figureValue" },
					{ data: "figure_date" },
					{ data: "link" },
				], "detail");

				$(".detailContentFromMaps").show();

				$(".mainMenu").removeClass("active");
				$(".menuMaps").addClass("active");

			} else {
				map.setView(L.latLng(42.722424, 34.7036507), 2.5);
				$(".mainChart").show();
				$(".mainTable").show();
				$(".detailContentFromMaps").hide();

				// changeBarChart(0, "#barChart1");
				// changeBarChart(1, "#barChart2");
				$(".selectChart1").val("0").trigger('change');
				$(".selectChart2").val("1").trigger('change');

				$(".mainMenu").removeClass("active");
				$(".menuDashboard").addClass("active");
				$(".mainDiv").show();
			}
		}

	});

	$(".mainMenu").on("click", function () {
		$(".mainMenu").removeClass("active");
		$(this).addClass("active");
		let getDiv = $(this).find("label").attr("for");
		if (getDiv != "dashboard") {
			$(".mainDiv").hide();
			$(".main" + getDiv).show();
		} else {
			$(".allCountry").val("all").trigger('change');
			$(".mainDiv").show();
		}
	});

});