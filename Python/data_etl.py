import pandas as pd
import os

def process_data(raw_data_path, output_folder):
    # Read the raw data
    df = pd.read_csv(raw_data_path)

    # Data cleaning and transformation
    df = df.dropna(axis=1, how='all')
    df = df[df['Domain Category'] != 'INVENTORY OF BEE COLONIES: (LESS THAN 5 COLONIES)']

    columns_to_remove = [col for col in df.columns if 'CV' in col] + [
        'Program', 'Geo Level', 'Domain Category', 'State ANSI', 'watershed_code',
        'Commodity', 'Domain', 'HONEY, BEE COLONIES - LOSS, DEADOUT, MEASURED IN COLONIES  -  <b>VALUE</b>'
    ]

    df.drop(columns=columns_to_remove, inplace=True)

    column_mapping = {'HONEY, BEE COLONIES - ADDED & REPLACED, MEASURED IN COLONIES  -  <b>VALUE</b>': 'Colonies_Added_And_Replaced',
                      'HONEY, BEE COLONIES - INVENTORY, MAX, MEASURED IN COLONIES  -  <b>VALUE</b>': 'Max_Colonies',
                      'HONEY, BEE COLONIES - LOSS, COLONY COLLAPSE DISORDER, MEASURED IN COLONIES  -  <b>VALUE</b>': 'Num_Affected_Colony_Collapse_Disorder',
                      'HONEY, BEE COLONIES - LOSS, DEADOUT, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Deadout',
                      'HONEY, BEE COLONIES, AFFECTED BY DISEASE - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Disease',
                      'HONEY, BEE COLONIES, AFFECTED BY OTHER CAUSES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Other',
                      'HONEY, BEE COLONIES, AFFECTED BY PESTICIDES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Pesticides',
                      'HONEY, BEE COLONIES, AFFECTED BY PESTS ((EXCL VARROA MITES)) - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Pests',
                      'HONEY, BEE COLONIES, AFFECTED BY UNKNOWN CAUSES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Unknown',
                      'HONEY, BEE COLONIES, AFFECTED BY VARROA MITES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Affected_Varroa_Mites',
                      'HONEY, BEE COLONIES, RENOVATED - INVENTORY, MEASURED IN COLONIES  -  <b>VALUE</b>': 'Num_Renovated',
                      'HONEY, BEE COLONIES, RENOVATED - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>': 'Pct_Renovated'
                      }

    df = df.rename(columns=column_mapping)

    df = df[df['State'] != 'OTHER STATES']

    df = df.replace(',', '', regex=True)
    df = df.replace(' (Z)', 0)

    df[df.columns[3:]] = df.iloc[:, 3:].apply(pd.to_numeric, errors='coerce')

    # Split the dataset

    df = df.dropna(axis=1, how='all')

    # Map "Period" to quarters
    quarters_mapping = {
        'JAN THRU MAR': 'Q1',
        'APR THRU JUN': 'Q2',
        'JUL THRU SEP': 'Q3',
        'OCT THRU DEC': 'Q4',
    }
    df['Period'] = df['Period'].map(quarters_mapping)

    # Create and format "Quarter" column
    df['Quarter'] = df['Year'].astype(str) + '_' + df['Period']

    # Drop unnecessary columns
    df = df[['Quarter'] + [col for col in df.columns if col != 'Quarter']]

    # Concatenate the new rows with the existing DataFrame

    # Calculate the sum of 'Max_Colonies' for each quarter for 'US TOTAL'
    quarterly_sums = df.groupby('Quarter')['Max_Colonies'].sum()
    for quarter, sum_value in quarterly_sums.items():
        df.loc[(df['State'] == 'US TOTAL') & (df['Quarter'] == quarter), 'Max_Colonies'] = sum_value


    # Calculate percent change for each state, excluding 2015_Q1
    df.sort_values(by=['State', 'Quarter'], inplace=True)
    df['prev_max_colonies'] = df.groupby('State')['Max_Colonies'].shift(1)
    df['Max_Colonies_Pct_Change'] = (df['Max_Colonies'] - df['prev_max_colonies']) / df['prev_max_colonies'] * 100
    df.drop(columns=['prev_max_colonies'], inplace=True)


    # Calculate the percentage of colonies affected by Colony Collapse Disorder
    df['Pct_Affected_Colony_Collapse_Disorder'] = (df['Num_Affected_Colony_Collapse_Disorder'] / df['Max_Colonies']) * 100
    df = df.drop(columns=['Num_Affected_Colony_Collapse_Disorder', 'Period', 'Year'])

    df = df.round(2)

    # Define file paths using the output folder
    file_path = os.path.join(output_folder, 'data.csv')

    # Save data to CSV files
    df.to_csv(file_path, index=False)

    print("Data Saved")

# Define the data folder path
current_directory = os.path.dirname(__file__)

# Get the parent directory
parent_directory = os.path.abspath(os.path.join(current_directory, os.pardir))
data_folder = os.path.join(parent_directory, 'Data')
print(data_folder)

# Define the raw data file path
raw_data_filename = "bee-data-RAW.csv"
raw_data_path = os.path.join(data_folder, raw_data_filename)

# Call the function with the defined paths
process_data(raw_data_path, data_folder)
