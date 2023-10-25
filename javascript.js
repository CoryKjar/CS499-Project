$(document).ready(function() {
    $.get("data.csv", function(data) {
        Papa.parse(data, {
            header: true,  // Treat the first row as the header
            dynamicTyping: true,  // Automatically detect data types
            complete: function(results) {
                console.log(results.data[1513]);
                console.log(results.data[1513].State);
                // Populate the DataTable with parsed CSV data
                $('#csvTable').DataTable({
                    data: results.data,
                    columns: [
                        { data: 'Quarter', title: 'Quarter' },
                        { data: 'State', title: 'State' },
                        { data: 'Colonies_Added_And_Replaced', title: 'Colonies Added & Replaced' },
                        { data: 'Max_Colonies', title: 'Max Colonies' },
                        { data: 'Pct_Affected_Deadout', title: 'Pct Affected - Deadout' },
                        { data: 'Pct_Affected_Disease', title: 'Pct Affected - Disease' },
                        { data: 'Pct_Affected_Other', title: 'Pct Affected - Other' },
                        { data: 'Pct_Affected_Pesticides', title: 'Pct Affected - Pesticides' },
                        { data: 'Pct_Affected_Pests', title: 'Pct Affected - Pests' },
                        { data: 'Pct_Affected_Unknown', title: 'Pct Affected - Unknown' },
                        { data: 'Pct_Affected_Varroa_Mites', title: 'Pct Affected - Varroa Mites' },
                        { data: 'Num_Renovated', title: 'Num Renovated' },
                        { data: 'Pct_Renovated', title: 'Pct Renovated' },
                        { data: 'Max_Colonies_Percent_Change', title: 'Max Colonies Percent Change' },
                        { data: 'Pct_Affected_Colony_Collapse_Disorder', title: 'Pct Affected - Colony Collapse Disorder' }
                    ],
                    columnDefs: [
                        { "defaultContent": "-", "targets": "_all" }
                    ],
                    paging: true,      // Enable pagination
                    ordering: true,    // Enable sorting
                    searching: true    // Enable search
                });
            }
        });
    });
});
