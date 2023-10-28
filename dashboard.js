
var df_state = []; // To store CSV data

// Function to populate the state dropdown with unique state values from the CSV data
function populateStateDropdown() {
    var stateDropdown = document.getElementById("state-select");
    var uniqueStates = [...new Set(df_state.map(row => row.State))];

    uniqueStates.forEach(function (state) {
        var option = document.createElement("option");
        option.text = state;
        stateDropdown.add(option);
    });
}

// Function to populate the variable dropdown with variable names from the CSV data
function populateVariableDropdown() {
    var variableDropdown = document.getElementById("variable-select");
    var variableNames = Object.keys(df_state[0]);

    // Remove 'Quarter' and 'State' columns from the dropdown options
    var filteredVariables = variableNames.filter(name => name !== 'Quarter' && name !== 'State');

    filteredVariables.forEach(function (variable) {
        var option = document.createElement("option");
        option.text = variable;
        variableDropdown.add(option);
    });
}

// Function to update the line plot
function updateLinePlot() {
    var state = stateDropdown.value;
    var variable = variableDropdown.value;
    var df_state_filtered = df_state.filter(function (row) {
        return row.State === state;
    });

    var x = df_state_filtered.map(function (row) {
        return row.Quarter;
    });

    var y = df_state_filtered.map(function (row) {
        return row[variable];
    });

    var trace = {
        x: x,
        y: y,
        type: "scatter",
        mode: "lines+markers",
        name: `${variable} in ${state}`
    };

    var layout = {
        title: `${variable} Over Time in ${state}`,
        xaxis: {
            title: "Quarter"
        },
        yaxis: {
            title: variable
        }
    };

    var data = [trace];

    Plotly.newPlot("line-plot", data, layout);
}

// Function to update the bar chart
function updateBarChart() {
    var variable = variableDropdown.value;
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

    var trace = {
        x: x,
        y: y,
        type: "bar",
        name: `Top ${topN} States by Highest Avg ${variable}`
    };

    var layout = {
        title: `Top ${topN} States by Highest Avg ${variable}`,
        xaxis: {
            title: "State"
        },
        yaxis: {
            title: variable
        }
    };

    var data = [trace];

    Plotly.newPlot("bar-plot", data, layout);
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
            // Initial plots
            updateLinePlot();
            updateBarChart();
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

var stateDropdown = document.getElementById("state-select");
var variableDropdown = document.getElementById("variable-select");

// Event listeners to update the plots when dropdowns change
stateDropdown.addEventListener("change", updateLinePlot);
variableDropdown.addEventListener("change", updateLinePlot);
variableDropdown.addEventListener("change", updateBarChart);