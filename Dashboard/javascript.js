$(document).ready(function() {
    $.get("C:\Users\ckjar\Documents\GitHub\CS499-Project\Data\data.csv", function(data) {
        Papa.parse(data, {
            header: true,  // Treat the first row as the header
            dynamicTyping: true,  // Automatically detect data types
            complete: function(results) {
                // Populate the DataTable with parsed CSV data
                $('#csvTable').DataTable({
                    data: results.data,
                    columns: Object.keys(results.data[0]).map(function(key) {
                        return { data: key, title: key };
                    }),
                    paging: true,      // Enable pagination
                    ordering: true,    // Enable sorting
                    searching: true    // Enable search
                });
            }
        });
    });
});
