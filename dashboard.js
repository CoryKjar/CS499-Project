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
    var yVariableDropdown = document.getElementById("y-variable-dropdown");
    var selectedVariable = yVariableDropdown.value;

    // Filter the data
    var filteredData = df.filter(function(row) {
        return row.State !== 'US TOTAL';
    });

    // Group by state and calculate the mean of the selected variable
    var meanData = d3.nest()
        .key(function(d) { return d.State; })
        .rollup(function(v) { return d3.mean(v, function(d) { return d[selectedVariable]; }); })
        .entries(filteredData);

    // Sort by mean value
    meanData.sort(function(a, b) {
        return b.value - a.value;
    });

    // Get top N states
    var topN = meanData.slice(0, 10);

    var stateNames = topN.map(function(d) {
        return d.key;
    });

    var meanValues = topN.map(function(d) {
        return d.value;
    });

    var barData = [
        {
            x: stateNames,
            y: meanValues,
            type: 'bar'
        }
    ];

    var barLayout = {
        title: `Top 10 States by Highest Avg ${selectedVariable}`,
        xaxis: {
            title: 'State',
            tickangle: -45
        },
        yaxis: {
            title: `Avg ${selectedVariable}`
        }
    };

    // Create or update the bar chart
    if (barChart) {
        Plotly.newPlot('bar-plot', barData, barLayout);
    } else {
        barChart = Plotly.newPlot('bar-plot', barData, barLayout);
    }
}

// Load CSV data and parse it when the page loads
loadDataAndParseCSV();

// Event listener for state dropdown
var stateDropdown = document.getElementById("state-dropdown");
stateDropdown.addEventListener("change", updateLinePlot);

// Event listener for variable dropdown
var yVariableDropdown = document.getElementById("y-variable-dropdown");
yVariableDropdown.addEventListener("change", updateLinePlot);
yVariableDropdown.addEventListener("change", updateBarChart); // Update the bar chart on variable change
