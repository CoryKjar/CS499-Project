import pandas as pd

def process_and_save_data(df, state_file_path, national_file_path):
    # Remove columns with all NaN values
    df = df.dropna(axis=1, how='all')

    # Columns to remove
    columns_to_remove = [col for col in df.columns if 'CV' in col] + \
                        ['Program', 'Geo Level', 'Domain Category', 'State ANSI', 'watershed_code', 'Commodity', 'Domain']

    df.drop(columns=columns_to_remove, inplace=True)

    # Remove commas and convert to numeric
    df = df.replace(',', '', regex=True)
    df.iloc[:, 3:] = df.iloc[:, 3:].apply(pd.to_numeric, errors='coerce')

    # Filter national and state data
    national_df = df[df['State'] == 'US TOTAL']
    state_df = df[df['State'] != 'US TOTAL']

    # Remove all NaN columns in both national and state DataFrames
    state_df = state_df.dropna(axis=1, how='all')
    national_df = national_df.dropna(axis=1, how='all')

    # Map 'Period' to 'Quarter'
    state_df['Period'] = state_df['Period'].map({
        'JAN THRU MAR': 'Q1',
        'APR THRU JUN': 'Q2',
        'JUL THRU SEP': 'Q3',
        'OCT THRU DEC': 'Q4',
    })

    national_df['Period'] = national_df['Period'].map({
        'JAN THRU MAR': 'Q1',
        'APR THRU JUN': 'Q2',
        'JUL THRU SEP': 'Q3',
        'OCT THRU DEC': 'Q4',
    })

    # Create the 'Quarter' column
    national_df['Quarter'] = national_df['Year'].astype(str) + '_' + national_df['Period']
    state_df['Quarter'] = state_df['Year'].astype(str) + '_' + state_df['Period']

    # Remove 'Period' and 'Year' columns
    national_df = national_df.drop(columns=['Period', 'Year'])
    state_df = state_df.drop(columns=['Period', 'Year'])

    # Reorder columns
    national_df = national_df[['Quarter'] + [col for col in national_df.columns if col != 'Quarter']]
    state_df = state_df[['Quarter'] + [col for col in state_df.columns if col != 'Quarter']]

    # Sort DataFrames by 'Quarter'
    national_df = national_df.sort_values(by='Quarter', ascending=True)
    state_df = state_df.sort_values(by='Quarter', ascending=True)

    # Reset the index
    national_df = national_df.reset_index(drop=True)
    state_df = state_df.reset_index(drop=True)

    # Save DataFrames to CSV files
    state_df.to_csv(state_file_path, index=False)
    national_df.to_csv(national_file_path, index=False)

    print('Data Saved to path')


# Define the file paths for saving the state and national data
state_file_path = r'C:\Users\ckjar\Documents\GitHub\CS499-Project\Data\state_data.csv'
national_file_path = r'C:\Users\ckjar\Documents\GitHub\CS499-Project\Data\national_data.csv'

# Load your raw data from the CSV file (if not already loaded)
raw_df = pd.read_csv(r'C:\Users\ckjar\Documents\GitHub\CS499-Project\Data\bee-data-RAW.csv')

# Call the function to process and save the data
process_and_save_data(raw_df, state_file_path, national_file_path)