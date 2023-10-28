// dashboard.js

var df_state = []; // To store CSV data

function populateStateDropdown() {
    var uniqueStates = [...new Set(df_state.map(row => row.State))];
    var stateDropdownLine = document.getElementById("state-select-line");

    stateDropdownLine.innerHTML = ""; // Clear the dropdown

    uniqueStates.forEach(function (state) {
        var optionLine = document.createElement("option");
        optionLine.text = state;
        stateDropdownLine.add(optionLine);
    });
}

function populateVariableDropdown() {
    // Check if df_state is defined and not empty
    if (df_state.length > 0) {
        var variableNames = Object.keys(df_state[0]);

        // Remove 'Quarter' and 'State' columns from the dropdown options
        var filteredVariables = variableNames.filter(name => name !== 'Quarter' && name !== 'State');

        var variableDropdownLine = document.getElementById("variable-select-line");
        variableDropdownLine.innerHTML = ""; // Clear the dropdown

        filteredVariables.forEach(function (variable) {
            var optionLine = document.createElement("option");
            optionLine.text = variable;
            variableDropdownLine.add(optionLine);
        });
    }
}

function updateLinePlot() {
    var state = document.getElementById("state-select-line").value;
    var variable = document.getElementById("variable-select-line").value;

    // Check if df_state is defined and not empty
    if (df_state.length > 0) {
        var df_state_filtered = df_state.filter(function (row) {
            return row.State === state;
        });

        var x = df_state_filtered.map(function (row) {
            return row.Quarter;
        });

        var y = df_state_filtered.map(function (row) {
            return row[variable];
        });

        var lineChart = new Chart(document.getElementById("line-chart").getContext("2d"), {
            type: "line",
            data: {
                labels: x,
                datasets: [
                    {
                        label: `${variable} in ${state}`,
                        data: y,
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.2)"
                    }
                ]
            },
            options: {
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: "Quarter"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            scaleLabel: {
                                display: true,
                                labelString: variable
                            }
                        }
                    ]
                }
            }
        });
    }
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

// Event listeners to update the chart when dropdowns change
document.getElementById("state-select-line").addEventListener("change", updateLinePlot);
document.getElementById("variable-select-line").addEventListener("change", updateLinePlot);

// Call the initial update functions to populate dropdowns and charts
populateStateDropdown();
populateVariableDropdown();
