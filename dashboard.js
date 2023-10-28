var df; // To store the CSV data
var barChart;

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
        }
    });
}

// Function to populate state and variable dropdowns
function populateDropdowns() {
    var stateDropdown = document.getElementById("state-dropdown");
    var yVariableDropdown = document.getElementById("y-variable-dropdown");

    // Clear existing options
    stateDropdown.innerHTML = "";
    yVariableDropdown.innerHTML = "";

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

    // Add variables to the variable dropdown
    filteredVariables.forEach(function(variable) {
        var option = document.createElement("option");
        option.value = variable;
        option.text = variable;
        yVariableDropdown.appendChild(option);
    });

    // Initialize the plot with default values
    updateLinePlot();
    updateBarChart(); // Initialize the bar chart
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

// Function to update the bar chart
function updateBarChart() {
    var stateDropdown = document.getElementById("state-dropdown");
    var variableDropdown = document.getElementById("variable-dropdown");
    var selectedState = stateDropdown.value;
    var selectedVariable = variableDropdown.value;

    // Filter the data for the selected state
    var df_state = df.filter(function(row) {
        return row.State === selectedState;
    });

    // Calculate the mean of the selected variable for each state
    var meanValues = df_state.reduce(function(result, row) {
        result[row.State] = result[row.State] || { total: 0, count: 0 };
        result[row.State].total += row[selectedVariable];
        result[row.State].count += 1;
        return result;
    }, {});

    var states = Object.keys(meanValues);
    var meanData = states.map(function(state) {
        return meanValues[state].total / meanValues[state].count;
    });

    // Create a Plotly bar chart
    var trace = {
        x: states,
        y: meanData,
        type: 'bar',
    };

    var data = [trace];

    var layout = {
        title: `Average ${selectedVariable} by State`,
        xaxis: {
            title: 'State',
        },
        yaxis: {
            title: 'Average ' + selectedVariable,
        },
    };

    Plotly.newPlot('bar-chart', data, layout);
}

// Load CSV data and parse it when the page loads
loadDataAndParseCSV();

// Event listener for state dropdown
// Event listener for state dropdown
var stateDropdown = document.getElementById("state-dropdown");
stateDropdown.addEventListener("change", updateLinePlot);

// Event listener for variable dropdown
var variableDropdown = document.getElementById("variable-dropdown");
variableDropdown.addEventListener("change", updateLinePlot);
variableDropdown.addEventListener("change", updateBarChart); // Update both line and bar charts on variable change
