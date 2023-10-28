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

        // Load CSV data and parse it when the page loads
        loadDataAndParseCSV();

        // Event listener for state dropdown
        var stateDropdown = document.getElementById("state-dropdown");
        stateDropdown.addEventListener("change", updateLinePlot);

        // Event listener for variable dropdown
        var yVariableDropdown = document.getElementById("y-variable-dropdown");
        yVariableDropdown.addEventListener("change", updateLinePlot);