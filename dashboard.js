var df; // To store the CSV data

// Function to load CSV data and parse it
function loadDataAndParseCSV() {
    Papa.parse("data.csv", {
        header: true,
        dynamicTyping: true,
        download: true,
        complete: function(results) {
            // Store the parsed data in the df variable
            df = results.data;
            populateDropdowns();
            updateBarChart(); // Call updateBarChart when data is loaded
        }
    });
}

// Function to populate state and variable dropdowns
function populateDropdowns() {
    var stateDropdown = document.getElementById("state-dropdown");
    var yVariableDropdown = document.getElementById("y-variable-dropdown");
    var barChartVariableDropdown = document.getElementById("bar-chart-variable-dropdown");

    // Clear existing options
    stateDropdown.innerHTML = "";
    yVariableDropdown.innerHTML = "";
    barChartVariableDropdown.innerHTML = "";

    // Get unique states
    var uniqueStates = [...new Set(df.map(row => row.State))];

    // Add states to the state dropdown
    uniqueStates.forEach(function(state) {
        var option = document.createElement("option");
        option.value = state;
        option.text = state;
        stateDropdown.appendChild(option);
    });

    // Get variable names
    var variableNames = Object.keys(df[0]);
    var filteredVariables = variableNames.filter(name => name !== "Quarter" && name !== "State");

    // Add variables to the line plot variable dropdown
    filteredVariables.forEach(function(variable) {
        var option = document.createElement("option");
        option.value = variable;
        option.text = variable;
        yVariableDropdown.appendChild(option);
    });

    // Add variables to the bar chart variable dropdown
    filteredVariables.forEach(function(variable) {
        var option = document.createElement("option");
        option.value = variable;
        option.text = variable;
        barChartVariableDropdown.appendChild(option);
    });

    // Initialize the plot with default values
    updateLinePlot();
}

// Function to update the line plot
function updateLinePlot() {
    var stateDropdown = document.getElementById("state-dropdown");
    var yVariableDropdown = document.getElementById("y-variable-dropdown");
    var selectedState = stateDropdown.value;
    var selectedVariable = yVariableDropdown.value;

    // Filter the data for the selected state
    var df_state = df.filter(function(row) {
        return row.State === selectedState;
    });

    // Extract x and y data
    var x = df_state.map(function(row) {
        return row.Quarter;
    });

    var y = df_state.map(function(row) {
        return row[selectedVariable];
    });

    // Create a Plotly line plot
    var trace = {
        x: x,
        y: y,
        mode: 'lines',
        name: selectedVariable,
    };

    var data = [trace];

    var layout = {
        title: `${selectedVariable} Over Time in ${selectedState}`,
        xaxis: {
            title: 'Quarter',
            tickangle: -45,
        },
        yaxis: {
            title: selectedVariable,
        },
    };

    Plotly.newPlot('line-plot', data, layout);
}

function updateBarChart() {
    var barChartVariableDropdown = document.getElementById("bar-chart-variable-dropdown");
    var selectedVariable = barChartVariableDropdown.value;
    console.log("Selected Variable:", selectedVariable);

    // Calculate the mean of the selected variable for each state
    var meanValues = df.reduce(function(result, row) {
        result[row.State] = result[row.State] || { total: 0, count: 0 };
        result[row.State].total += row[selectedVariable];
        result[row.State].count += 1;
        return result;
    }, {});
    console.log("Mean Values:", meanValues);

    // Calculate the average and sort by the highest average
    var sortedStates = Object.keys(meanValues).sort(function (a, b) {
        return meanValues[b].total / meanValues[b].count - meanValues[a].total / meanValues[a].count;
    });
    console.log("Sorted States:", sortedStates);

    // Select the top 10 states
    var topStates = sortedStates.slice(0, 10);
    console.log("Top 10 States:", topStates);

    var topStatesData = topStates.map(function(state) {
        return meanValues[state].total / meanValues[state].count;
    });
    console.log("Top States Data:", topStatesData);

    // Create a Plotly bar chart for the top 10 states
    var data = [{
        x: topStates,
        y: topStatesData,
        type: 'bar',
    }];
    console.log("Chart Data:", data);

    var layout = {
        title: `Top 10 States by Highest Average ${selectedVariable}`,
        xaxis: {
            title: 'State',
        },
        yaxis: {
            title: 'Average ' + selectedVariable,
        },
    };
    console.log("Layout:", layout);

    // Update the "second-plot" div with the bar chart
    Plotly.newPlot('second-plot', data, layout);
    console.log("Bar chart updated.");
}

// New function to populate only the bar chart dropdown
function populateBarChartDropdown() {
    var barChartVariableDropdown = document.getElementById("bar-chart-variable-dropdown");

    // Get variable names
    var variableNames = Object.keys(df[0]);
    var filteredVariables = variableNames.filter(name => name !== "Quarter" && name !== "State");

    // Add variables to the bar chart variable dropdown
    filteredVariables.forEach(function(variable) {
        var option = document.createElement("option");
        option.value = variable;
        option.text = variable;
        barChartVariableDropdown.appendChild(option);
    });
}

// Load CSV data and parse it when the page loads
loadDataAndParseCSV();

// Event listener for state dropdown
var stateDropdown = document.getElementById("state-dropdown");
stateDropdown.addEventListener("change", updateLinePlot);

// Event listener for variable dropdown
var yVariableDropdown = document.getElementById("y-variable-dropdown");
yVariableDropdown.addEventListener("change", updateLinePlot);

// Event listener for bar chart variable dropdown
var barChartVariableDropdown = document.getElementById("bar-chart-variable-dropdown");
barChartVariableDropdown.addEventListener("change", updateBarChart);

// Call populateBarChartDropdown() to populate the bar chart dropdown when the page loads
populateBarChartDropdown();
