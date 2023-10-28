var df_state = []; // To store CSV data

var stateDropdownLine = document.getElementById("state-select-line");
var variableDropdownLine = document.getElementById("variable-select-line");
var stateDropdownBar = document.getElementById("state-select-bar");
var variableDropdownBar = document.getElementById("variable-select-bar");

var lineChart = new Chart(document.getElementById("line-chart").getContext("2d"), {
    type: "line",
    data: {
        labels: [],
        datasets: []
    },
    options: {
        scales: {
            x: [
                {
                    title: {
                        display: true,
                        text: "Quarter"
                    }
                }
            ],
            y: [
                {
                    title: {
                        display: true
                    }
                }
            ]
        }
    }
});

var barChart = new Chart(document.getElementById("bar-chart").getContext("2d"), {
    type: "bar",
    data: {
        labels: [],
        datasets: []
    },
    options: {
        scales: {
            x: [
                {
                    title: {
                        display: true,
                        text: "State"
                    }
                }
            ],
            y: [
                {
                    title: {
                        display: true
                    }
                }
            ]
        }
    }
});

// Function to populate the state dropdown with unique state values from the CSV data
// Update the populateStateDropdown and populateVariableDropdown functions as follows:

// Function to populate the state dropdown with unique state values from the CSV data
function populateStateDropdown() {
    var uniqueStates = [...new Set(df_state.map(row => row.State))];

    stateDropdownLine.innerHTML = ""; // Clear the dropdown
    stateDropdownBar.innerHTML = ""; // Clear the dropdown

    uniqueStates.forEach(function (state) {
        var optionLine = document.createElement("option");
        var optionBar = document.createElement("option");
        optionLine.text = state;
        optionBar.text = state;
        stateDropdownLine.add(optionLine);
        stateDropdownBar.add(optionBar);
    });
}

// Function to populate the variable dropdown with variable names from the CSV data
function populateVariableDropdown() {
    var variableNames = Object.keys(df_state[0]);

    // Remove 'Quarter' and 'State' columns from the dropdown options
    var filteredVariables = variableNames.filter(name => name !== 'Quarter' && name !== 'State');

    variableDropdownLine.innerHTML = ""; // Clear the dropdown
    variableDropdownBar.innerHTML = ""; // Clear the dropdown

    filteredVariables.forEach(function (variable) {
        var optionLine = document.createElement("option");
        var optionBar = document.createElement("option");
        optionLine.text = variable;
        optionBar.text = variable;
        variableDropdownLine.add(optionLine);
        variableDropdownBar.add(optionBar);
    });
    updateLinePlot(); // Update the chart after populating the dropdown
}


// Function to update the line plot
function updateLinePlot() {
    var state = stateDropdownLine.value;
    var variable = variableDropdownLine.value;
    var df_state_filtered = df_state.filter(function (row) {
        return row.State === state;
    });

    var x = df_state_filtered.map(function (row) {
        return row.Quarter;
    });

    var y = df_state_filtered.map(function (row) {
        return row[variable];
    });

    lineChart.data.labels = x;
    lineChart.data.datasets = [
        {
            label: `${variable} in ${state}`,
            data: y,
            borderColor: "blue",
            backgroundColor: "rgba(0, 0, 255, 0.2)"
        }
    ];

    lineChart.options.scales.x[0].title.text = "Quarter";
    lineChart.options.scales.y[0].title.text = variable;
    lineChart.update();
}

// Function to update the bar chart
function updateBarChart() {
    var state = stateDropdownBar.value;
    var variable = variableDropdownBar.value;
    var topN = 10; // Set the number of top states you want to display

    // Sort the data based on the selected variable and take the top N states
    var sortedData = df_state.slice().sort(function(a, b) {
        return b[variable] - a[variable];
    }).slice(0, topN);

    var x = sortedData.map(function(row) {
        return row.State;
    });

    var y = sortedData.map(function(row) {
        return row[variable];
    });

    barChart.data.labels = x;
    barChart.data.datasets = [
        {
            label: `Top ${topN} States by Highest Avg ${variable}`,
            data: y,
            backgroundColor: "rgba(0, 0, 255, 0.2)"
        }
    ];

    barChart.options.scales.x[0].title.text = "State";
    barChart.options.scales.y[0].title.text = variable;
    barChart.update();
}


// Function to parse CSV data
function parseCSVData(csvData) {
    Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            df_state = results.data;
            // Populate the state and variable dropdowns after parsing the data
            populateStateDropdown();
            populateVariableDropdown();
        }
    });
}

// Load data from "data.csv" using AJAX
function loadDataFromCSVFile() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "data.csv", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var csvData = xhr.responseText;
            parseCSVData(csvData);
        }
    };
    xhr.send();
}

// Load data from "data.csv" when the page loads
loadDataFromCSVFile();

// Event listeners to update the charts when dropdowns change
stateDropdownLine.addEventListener("change", updateLinePlot);
variableDropdownLine.addEventListener("change", updateLinePlot);
stateDropdownBar.addEventListener("change", updateBarChart);
variableDropdownBar.addEventListener("change", updateBarChart);

// Call the initial update functions to populate dropdowns and charts
populateStateDropdown();
populateVariableDropdown();
