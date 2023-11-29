import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
import itertools
import matplotlib.pyplot as plt
from pmdarima.arima import auto_arima
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import TimeSeriesSplit
import numpy as np
from sklearn.feature_selection import RFE
from sklearn.feature_selection import RFECV
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression, Lasso, Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV
import warnings
from itertools import combinations
import seaborn as sns
from pmdarima import ARIMA
import os
# Set the maximum number of rows and columns to display
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('display.float_format', lambda x: '%.3f' % x)

# Suppress the specified warnings
warnings.filterwarnings("ignore", category=UserWarning, module="statsmodels.tsa.statespace.sarimax")

# Load your data into a DataFrame called 'df'
cwd = os.getcwd()
data_folder = os.path.join(cwd, "Data")
data_path = os.path.join(data_folder, "data.csv")

df = pd.read_csv(data_path)
df = df[df['State'] == 'ALABAMA']
df = df.drop(['Max_Colonies_Pct_Change', 'Pct_Affected_Colony_Collapse_Disorder'], axis=1)
df = df.fillna(0)

# Make sure 'Quarter' is in datetime format
df['Quarter'] = pd.to_datetime(df['Quarter'].str.replace('_', '-'))

# Set 'Quarter' as the index and specify the frequency as quarterly ('Q-DEC')
df.set_index('Quarter', inplace=True)
df.index = df.index.to_period('Q-DEC')

# Group data by 'State'
grouped = df.groupby('State')

n_periods_to_forecast = 4  # You can adjust this as needed

accuracy_metrics = {}

progress_count = 0
total_states = df.State.nunique()

# Create an empty DataFrame to store metrics and hyperparameters
metrics_df = pd.DataFrame(columns=['State', 'Order', 'Seasonal_Order', 'Selected_Features', 'MAE', 'MSE', 'RMSE', 'MPE', 'PRMSE', 'AIC'])

# Create an empty list to store skipped states and error messages
skipped_states = []

# Perform SARIMAX modeling
for state, data in grouped:
    print('Fitting SARIMAX for', state)
    data = data.drop(columns=['State'])

    try:
        # Create lagged features for all columns
        n_lags = 4

        # Create lagged features for all columns
        for col in data.columns:
            for i in range(1, n_lags + 1):
                lagged_col_name = f'{col}_lag_{i}'
                data[lagged_col_name] = data[col].shift(i)

        # Drop non-lagged features
        data = data.filter(regex='_lag|Max_Colonies')

        # Drop rows with NaN values
        data = data.dropna()

        # Split the data
        test_data = data[-n_periods_to_forecast:]
        train_data = data[:-n_periods_to_forecast]

        # Use all available features for modeling
        X_train = train_data.drop(columns=['Max_Colonies'])
        y_train = train_data['Max_Colonies']

        # Initialize variables to track the best model
        best_aic = np.inf
        best_order = None
        best_seasonal_order = None
        best_selected_features = None

        # Loop over different feature sets (1 to 5 features)
        for num_features in range(1, 2):
            # Feature selection using RFE
            rf = RandomForestRegressor()
            rfe = RFE(rf, n_features_to_select=num_features)
            rfe.fit(X_train, y_train)

            # Get selected features
            feature_ranking = rfe.ranking_
            selected_features = X_train.columns[feature_ranking == 1]
            print(selected_features)

            # Use only the selected features for modeling
            X_train_selected = X_train[selected_features]

            # Use auto_arima for automatic model selection
            autoarima_model = auto_arima(
                y_train,
                X=X_train_selected,
                m=4,
                trace=False,
                suppress_warnings=False,
                seasonal=True,
                maxiter=1000,
                start_p=1,
                start_q=1,
                max_p=5,
                max_d=5,
                max_q=5,
                start_P=1,
                start_Q=1,
                max_P=5,
                max_D=2,
                max_Q=5,
                max_order=None,
                stepwise=True
            )  # Adjust 'm' based on your frequency

            # Track AIC for the current model
            current_aic = autoarima_model.aic()

            # If current model has lower AIC, update best model information
            if current_aic < best_aic:
                best_aic = current_aic
                best_order = autoarima_model.order
                best_seasonal_order = autoarima_model.seasonal_order
                best_selected_features = selected_features

        # Forecast using the best model
        best_model = auto_arima(y_train, X=X_train[best_selected_features], order=best_order, seasonal_order=best_seasonal_order, suppress_warnings=True, maxiter=1000)
        forecasted_values, conf_int = best_model.predict(n_periods=n_periods_to_forecast, X=test_data[best_selected_features], return_conf_int=True)

        # Calculate accuracy metrics for the best model
        actual_values = test_data['Max_Colonies'].values

        mae = mean_absolute_error(actual_values, forecasted_values)
        mse = mean_squared_error(actual_values, forecasted_values)
        rmse = np.sqrt(mse)
        mpe = np.mean((actual_values - forecasted_values) / actual_values) * 100
        prmse = (rmse / np.mean(actual_values)) * 100

        # Append metrics and hyperparameters to the metrics DataFrame
        metrics_entry = {
            'State': state,
            'Order': best_order,
            'Seasonal_Order': best_seasonal_order,
            'Selected_Features': best_selected_features,
            'MAE': mae,
            'MSE': mse,
            'RMSE': rmse,
            'MPE': mpe,
            'PRMSE': prmse,
            'AIC': best_aic
        }
        metrics_df = metrics_df.append(metrics_entry, ignore_index=True)

        # Update progress count
        progress_count += 1
        print(f'Progress: {progress_count}/{total_states}')

    except Exception as e:
        # Handle the exception
        print(f"Error for state {state}: {e}")
        skipped_states.append({'state': state, 'error': str(e)})
        print(e)
        continue

# Print the list of skipped states and errors
print("Skipped states and errors:")
for skipped_state in skipped_states:
    print(f"State: {skipped_state['state']}, Error: {skipped_state['error']}")

# Assuming your 'grouped' variable is a DataFrameGroupBy object

# Define the number of periods to forecast
n_periods_to_forecast = 4

# Create an empty DataFrame to store final forecasts
final_forecasts_df = pd.DataFrame(columns=['State', 'Forecast Quarter', 'Forecast'])

# Iterate through each state in the metrics DataFrame
for idx, row in metrics_df.iterrows():
    state = row['State']
    p, d, q = row['Order']  # Unpack order values
    P, D, Q, m = row['Seasonal_Order']  # Unpack seasonal order values
    selected_features = row['Selected_Features']
    MAE = row['MAE']
    MSE = row['MSE']
    RMSE = row['RMSE']
    MPE = row['MPE']
    PRMSE = row['PRMSE']

    # Filter historic data for the current state
    state_data = df[df['State'] == state].copy()

    # Create lagged features for all columns
    for col in state_data.columns:
        for i in range(1, n_lags + 1):
            lagged_col_name = f'{col}_lag_{i}'
            state_data[lagged_col_name] = state_data[col].shift(i)

    # Drop non-lagged features
    state_data = state_data.filter(regex='_lag|Max_Colonies')

    # Drop rows with NaN values
    state_data = state_data.dropna()

    # Use selected features for modeling
    X_train = state_data[selected_features]
    y_train = state_data['Max_Colonies']

    # Use auto_arima for forecasting with the specified parameters
    final_model = ARIMA(order=(p, d, q), seasonal_order=(P, D, Q, m), suppress_warnings=False)

    final_model.fit(y_train, X=X_train)

    # Forecast using the fitted auto_arima model
    final_forecast, conf_int = final_model.predict(n_periods=n_periods_to_forecast, X=state_data.iloc[-n_periods_to_forecast:][selected_features], return_conf_int=True)

    # Convert the forecasted values to a DataFrame and set the index
    forecast_start_date = pd.period_range(start=state_data.index[-1].to_timestamp() + pd.DateOffset(months=3), periods=n_periods_to_forecast, freq='Q')
    final_forecast_index = forecast_start_date.strftime('%Y-Q%q')

    final_forecast_values = pd.DataFrame({
        'State': [state] * n_periods_to_forecast,
        'Forecast Quarter': final_forecast_index,
        'Forecast': final_forecast,
        'MAE': MAE,
        'MSE': MSE,
        'RMSE': RMSE,
        'MPE': MPE,
        'PRMSE': PRMSE
    })

    # Append the final_forecast_values to the final_forecasts_df
    final_forecasts_df = pd.concat([final_forecasts_df, final_forecast_values], ignore_index=True)

forecasts = pd.pivot_table(final_forecasts_df, values=['Forecast', 'MAE', 'MPE'], index=['State', 'Forecast Quarter'])

output_path = os.path.join(data_folder, 'forecast-data.csv')
forecasts.to_csv(output_path, index=True)
print('Forecasted Data Saved!')
