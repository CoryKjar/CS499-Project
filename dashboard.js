// interactive_lineplot.js

// Function to update the line plot
function updateLinePlot(state, y_variable) {
    // Filter the data for the selected state
    var df_state = df.filter(function (row) {
        return row.State === state;
    });

    // Extract x and y data
    var x = df_state.map(function (row) {
        return row.Quarter;
    });

    var y = df_state.map(function (row) {
        return row[y_variable];
    });

    // Create a Plotly line plot
    var trace = {
        x: x,
        y: y,
        mode: 'lines',
        name: y_variable,
    };

    var data = [trace];

    var layout = {
        title: `${y_variable} Over Time in ${state}`,
        xaxis: {
            title: 'Quarter',
            tickangle: -45,
        },
        yaxis: {
            title: y_variable,
        },
    };

    Plotly.newPlot('line-plot', data, layout);
}

// Event listener for state and y_variable dropdowns
var stateDropdown = document.getElementById('state-dropdown');
var yVariableDropdown = document.getElementById('y-variable-dropdown');

stateDropdown.addEventListener('change', function () {
    var state = stateDropdown.value;
    var y_variable = yVariableDropdown.value;
    updateLinePlot(state, y_variable);
});

yVariableDropdown.addEventListener('change', function () {
    var state = stateDropdown.value;
    var y_variable = yVariableDropdown.value;
    updateLinePlot(state, y_variable);
});

// Initial update of the plot
var initialState = df[0].State; // You can set an initial state
var initialYVariable = df.columns[2]; // You can set an initial y variable
updateLinePlot(initialState, initialYVariable);
