var df; // To store the CSV data
var selectedTopOption = "highest"; // Default to highest
var selectedTimeFrame = "all-time"; // Default to all time
var lastFourQuarters = []; // Store the last four quarters
var lastQuarter = ""; // Store the last quarter

// Function to load CSV data and parse it
function loadDataAndParseCSV() {
    Papa.parse("data.csv", {
        header: true,
        dynamicTyping: true,
        download: true,
        complete: function (results) {
            // Store the parsed data in the df variable
            df = results.data;
            populateDropdowns();
            updateTimeFrames(); // Call updateTimeFrames when data is loaded
            updateBarChart(); // Call updateBarChart when data is loaded
            colonyChangePlot(document.getElementById("colony-change-type").value);
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
    uniqueStates.forEach(function (state) {
        var option = document.createElement("option");
        option.value = state;
        option.text = state;
        stateDropdown.appendChild(option);
    });

    // Get variable names
    var variableNames = Object.keys(df[0]);
    var filteredVariables = variableNames.filter(name => name !== "Quarter" && name !== "State");

    // Add variables to the line plot variable dropdown
    filteredVariables.forEach(function (variable) {
        var option = document.createElement("option");
        option.value = variable;
        option.text = variable;
        yVariableDropdown.appendChild(option);
    });

    // Add variables to the bar chart variable dropdown
    filteredVariables.forEach(function (variable) {
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
    var df_state = df.filter(function (row) {
        return row.State === selectedState;
    });

    // Extract x and y data
    var x = df_state.map(function (row) {
        return row.Quarter;
    });

    var y = df_state.map(function (row) {
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
    var barChartVariableDropdown = document.getElementById("bar-chart-variable-dropdown");
    var selectedVariable = barChartVariableDropdown.value;

    // Filter the data based on the selected time frame
    var filteredData = df.filter(function (row) {
        if (selectedTimeFrame === "last-4-quarters") {
            return lastFourQuarters.includes(row.Quarter);
        } else if (selectedTimeFrame === "last-quarter") {
            return row.Quarter === lastQuarter;
        }
        return true; // "All Time" includes all data
    });

    // Calculate the mean of the selected variable for each state
    var meanValues = filteredData.reduce(function (result, row) {
        if (row.State !== "US TOTAL") { // Exclude "US TOTAL"
            result[row.State] = result[row.State] || { total: 0, count: 0 };
            result[row.State].total += row[selectedVariable];
            result[row.State].count += 1;
        }
        return result;
    }, {});

    // Sort states based on the selected top option (highest or lowest)
    var sortedStates = Object.keys(meanValues).sort(function (a, b) {
        var aValue = meanValues[a].total / meanValues[a].count;
        var bValue = meanValues[b].total / meanValues[b].count;
        if (selectedTopOption === "highest") {
            return bValue - aValue; // Highest
        } else {
            return aValue - bValue; // Lowest
        }
    });

    // Select the top 10 or lowest 10 states
    var topStates = sortedStates.slice(0, 10);

    var topStatesData = topStates.map(function (state) {
        return meanValues[state].total / meanValues[state].count;
    });

    // Create a Plotly bar chart for the top 10 or lowest 10 states
    var data = [{
        x: topStates,
        y: topStatesData,
        type: 'bar',
    }];

    var layout = {
        title: `Top 10 States by ${selectedTopOption} Average ${selectedVariable} <br> (${selectedTimeFrame}, Quarter: ${lastQuarter})`,
        xaxis: {
            title: 'State',
        },
        yaxis: {
            title: 'Average ' + selectedVariable,
        },
    };

    // Update the "second-plot" div with the bar chart
    Plotly.newPlot('second-plot', data, layout);
}

// Function to update the available time frames based on the unique values in the Quarter column
function updateTimeFrames() {
    // Filter out null values from the array
    var quarters = df.map(row => row.Quarter).filter(quarter => quarter !== null);
    // Remove duplicates and sort quarters in descending order (latest first)
    var uniqueQuarters = [...new Set(quarters)].sort(function (a, b) {
        return new Date(b) - new Date(a);
    });
    // Get the last four quarters
    lastFourQuarters = uniqueQuarters.slice(0, 4);

    // Get the last quarter
    lastQuarter = uniqueQuarters[0];

    // Update the bar chart title when the time frames change
    updateBarChart();
}

// Function to handle the colony change plot
function colonyChangePlot() {
    console.log("colonyChangePlot function called");

    var mostLostOrGained = document.getElementById("most-lost-or-gained").value;
    var selectedType = document.getElementById("colony-change-type").value;
    console.log("Selected options:", mostLostOrGained, selectedType);

    // Filter data for '2023_Q2' and '2015_Q1' quarters
    var df_2023_Q2 = df.filter(row => row.Quarter === '2023_Q2');
    var df_2015_Q1 = df.filter(row => row.Quarter === '2015_Q1');

    // Initialize the merged data array
    var merged_df = [];

    // Merge the two datasets based on the 'State' column
    for (var i = 0; i < df_2023_Q2.length; i++) {
        var entry2023 = df_2023_Q2[i];
        var entry2015 = df_2015_Q1.find(row => row.State === entry2023.State);

        if (entry2015 && entry2015.State !== 'US TOTAL') {
            if (entry2015.Max_Colonies !== null) {
                var colonyDiff = parseFloat(entry2023.Max_Colonies) - parseFloat(entry2015.Max_Colonies);
                var pctLost = (colonyDiff / parseFloat(entry2015.Max_Colonies)) * 100;

                merged_df.push({
                    'State': entry2023.State,
                    'colony_diff': colonyDiff,
                    'pct_lost': pctLost,
                });
            }
        }
    }

    // Sort the data based on selectedType and mostLostOrGained
    if (selectedType === "percent") {
        merged_df.sort((a, b) => {
            if (mostLostOrGained === "most-gained") {
                return b.pct_lost - a.pct_lost; // Sort by highest percent
            } else {
                return a.pct_lost - b.pct_lost; // Sort by lowest percent
            }
        });
    } else { // Default sorting for "value"
        merged_df.sort((a, b) => a.colony_diff - b.colony_diff);

        if (mostLostOrGained === "most-gained") {
            merged_df.reverse();
        }
    }

    // Select the top 5 states with the highest decrease or increase in colonies
    var top_5_states = merged_df.slice(0, 5);
    top_5_states.forEach(row => row.colony_diff = Math.abs(row.colony_diff));

    // Create a Plotly bar chart
    var states = top_5_states.map(row => row.State);

    var data;
    var title;

    if (selectedType === "value") {
        var colonyDiffs = top_5_states.map(row => row.colony_diff);
        data = [{
            x: states,
            y: colonyDiffs,
            type: 'bar',
            marker: {
                color: 'blue' // Change the color as needed
            }
        }];
        title = 'States With Highest Decrease or Increase in Colonies (Value)';
    } else if (selectedType === "percent") {
        var pctLost = top_5_states.map(row => row.pct_lost);
        data = [{
            x: states,
            y: pctLost,
            type: 'bar',
            marker: {
                color: 'green' // Change the color as needed
            }
        }];
        title = 'States With Highest Decrease or Increase in Colonies (Percent)';
    }

    var layout = {
        title: title,
        xaxis: {
            title: 'State',
        },
        yaxis: {
            title: selectedType === "value" ? 'Absolute Colony Difference' : 'Percentage Lost',
        }
    };

    // Update the "third-plot" div with the bar chart
    Plotly.purge('third-plot');
    Plotly.newPlot('third-plot', data, layout);
}


// Event listener for the state dropdown
var stateDropdown = document.getElementById("state-dropdown");
stateDropdown.addEventListener("change", updateLinePlot);

// Event listener for variable dropdown
var yVariableDropdown = document.getElementById("y-variable-dropdown");
yVariableDropdown.addEventListener("change", updateLinePlot);

// Event listener for bar chart variable dropdown
var barChartVariableDropdown = document.getElementById("bar-chart-variable-dropdown");
barChartVariableDropdown.addEventListener("change", updateBarChart);

// Event listener for top selector dropdown
var topSelector = document.getElementById("top-selector");
topSelector.addEventListener("change", function () {
    selectedTopOption = topSelector.value;
    updateBarChart();
});

var mostLostOrGainedDropdown = document.getElementById("most-lost-or-gained");
mostLostOrGainedDropdown.addEventListener("change", function () {
    colonyChangePlot();
});

// Event listener for the "colony-change-type" dropdown
var colonyChangeTypeDropdown = document.getElementById("colony-change-type");
colonyChangeTypeDropdown.addEventListener("change", function() {
    colonyChangePlot();
});


// Event listener for time frame selector dropdown
var timeFrameSelector = document.getElementById("time-frame-selector");
timeFrameSelector.addEventListener("change", function () {
    selectedTimeFrame = timeFrameSelector.value;
    updateBarChart();
});

// Load CSV data and parse it when the page loads
loadDataAndParseCSV();
