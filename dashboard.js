// Assuming you have already loaded your CSV data into df_state
// You can use the same populateStateDropdown and populateVariableDropdown functions

// Create a function to update the line plot
function interactiveLinePlot(state, yVariable) {
    var dfState = df_state.filter(function (row) {
        return row.State === state;
    });

    var xData = dfState.map(function (row) {
        return row.Quarter;
    });

    var yData = dfState.map(function (row) {
        return row[yVariable];
    });

    // Create a line chart using Chart.js
    var lineChart = new Chart(document.getElementById("line-chart").getContext("2d"), {
        type: "line",
        data: {
            labels: xData,
            datasets: [
                {
                    label: `${yVariable} Over Time in ${state}`,
                    data: yData,
                    borderColor: "blue",
                    fill: false, // To make it a line chart without fill
                },
            ],
        },
        options: {
            scales: {
                x: [
                    {
                        title: {
                            display: true,
                            text: "Quarter",
                        },
                    },
                ],
                y: [
                    {
                        title: {
                            display: true,
                            text: yVariable,
                        },
                    },
                ],
            },
        },
    });

    // Update the chart
    lineChart.update();
}

// Add event listeners for dropdowns
stateDropdownLine.addEventListener("change", function () {
    var selectedState = stateDropdownLine.value;
    var selectedYVariable = variableDropdownLine.value;
    interactiveLinePlot(selectedState, selectedYVariable);
});

variableDropdownLine.addEventListener("change", function () {
    var selectedState = stateDropdownLine.value;
    var selectedYVariable = variableDropdownLine.value;
    interactiveLinePlot(selectedState, selectedYVariable);
});

// Initialize the line plot with default selections
var initialSelectedState = stateDropdownLine.value;
var initialSelectedYVariable = variableDropdownLine.value;
interactiveLinePlot(initialSelectedState, initialSelectedYVariable);
