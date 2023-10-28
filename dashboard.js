function updateBarChart() {
    var selectedVariable = yVariableDropdown.value;
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
