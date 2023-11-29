# Honey Bee Population Analysis and Forecasting Dashboard

## Overview

This project aims to address the critical issue of honey bee population decline by providing a comprehensive analysis and forecasting tool. The Honey Bee Population Analysis and Forecasting Dashboard offer insights into honey bee population trends, affecting factors, and forecasts. The dashboard targets beekeepers, conservationists, and policymakers, enabling them to make informed decisions based on data analysis.

## Table of Contents

- Data Preprocessing
- Dashboard
- JavaScript
- Forecasting
- Usage
- Evaluation and Key Results
- Proof of Work
- Conclusion and Future Work

## Data Preprocessing

The data preprocessing script (`data-etl`) is responsible for cleaning and transforming the raw data. Key steps include handling missing values, filtering rows, dropping columns, mapping values, and calculating aggregates. The resulting dataset is saved to a CSV file for further analysis.

## Dashboard

The dashboard is implemented using HTML, Plotly.js, and PapaParse. It consists of interactive visualizations, including line plots and bar charts. Users can select specific states, variables, and time frames to analyze and visualize honey bee population data.

### HTML

The HTML structure includes container divs with class "plot-container" for different plots. Dropdowns for selecting states, variables, and time frames are provided. The dashboard is designed for user-friendly interaction.

### JavaScript

JavaScript handles the dynamic loading and parsing of the CSV data. It populates dropdown options, updates line plots, and creates bar charts based on user selections. Event listeners ensure that visualizations are responsive to user inputs.

## Forecasting

The forecasting is implemented using a pmdarima's auto_arima, this allows for automated parameter tuning. The model trains on a subset of features determined by RFE and finds the best features and hyperparameters and then trains a model using those settings.

## Usage

1. **Clone the Repository:**
   ```
   git clone https://github.com/CoryKjar/CS499-Project.git
   cd CS499-Project
   ```

2. **Run the Data Preprocessing Script:**
   Ensure Python is installed as well as the libraries in requirements.txt, navigate to the Python subfolder then execute the data preprocessing script.
   ```
   cd Python
   python data_etl.py
   ```
   
3. **Run the Forecasting Script:**
   ```
   python forecast.py
   ```

3. **Open the Dashboard:**
   Open the `index.html` file in your preferred web browser.

4. **Explore the Dashboard:**
   - Use the dropdowns to select specific states, variables, and time frames.
   - Interact with line plots and bar charts to analyze honey bee population data.
   - Use the 'View Tabular Data' button to access a data table where you can search, filter, and sort the tabular dataset

## Evaluation and Key Results

### Main Results and Implications

- Data-Driven Insights: Users can explore honey bee population data for informed decision-making.
- Trends Forecasts: SARIMA model implementation provides seasonal trend forecasts.
- Data Preprocessing Automation: Scripts automate messy data handling.
- User Interaction: The dashboard allows dynamic data analysis and visualization.

### SRS Items Satisfied

- Data Retrieval and Preprocessing
- User Interface
- Time Series Forecasting
- Forecast Validation
- Data Visualization

### SRS Items Not Finished

- Automated Data Retrieval


## Proof of Work

The project has made significant progress in data processing, forecasting, and dashboard development. Some features, such as automated data retrieval, are yet to be implemented.

## Conclusion and Future Work

The Honey Bee Population Analysis and Forecasting Dashboard have successfully addressed several key requirements. Future work includes automating data retrieval, enhancing forecasting models, and implementing machine learning for deeper insights into honey bee populations.
- Enhanced Forecasting: Explore additional models and features for improved predictions.
- Machine Learning for Insights: Implement techniques for identifying trends and factors affecting honey bee populations.
