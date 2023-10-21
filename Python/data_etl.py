import pandas as pd
import os



def process_data(raw_data_path, output_folder):

    # Read the raw data
    raw_df = pd.read_csv(raw_data_path)

    # Data cleaning and transformation
    raw_df = raw_df.dropna(axis=1, how='all')
    raw_df = raw_df[raw_df['Domain Category'] != 'INVENTORY OF BEE COLONIES: (LESS THAN 5 COLONIES)']
    
    columns_to_remove = [col for col in raw_df.columns if 'CV' in col] + [
        'Program', 'Geo Level', 'Domain Category', 'State ANSI', 'watershed_code',
        'Commodity', 'Domain'
    ]
    raw_df.drop(columns=columns_to_remove, inplace=True)
    
    column_mapping ={'HONEY, BEE COLONIES - ADDED & REPLACED, MEASURED IN COLONIES  -  <b>VALUE</b>' : 'Colonies_Added_And_Replaced',
                                'HONEY, BEE COLONIES - INVENTORY, MAX, MEASURED IN COLONIES  -  <b>VALUE</b>' : 'Max_Colonies',
                                'HONEY, BEE COLONIES - LOSS, COLONY COLLAPSE DISORDER, MEASURED IN COLONIES  -  <b>VALUE</b>' : 'Num_Affected_Colony_Collapse_Disorder',
                                'HONEY, BEE COLONIES - LOSS, DEADOUT, MEASURED IN COLONIES  -  <b>VALUE</b>' : 'Num_Affected_Deadout',
                                'HONEY, BEE COLONIES - LOSS, DEADOUT, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Deadout',
                                'HONEY, BEE COLONIES, AFFECTED BY DISEASE - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Disease',
                                'HONEY, BEE COLONIES, AFFECTED BY OTHER CAUSES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Other',
                                'HONEY, BEE COLONIES, AFFECTED BY PESTICIDES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Pesticides',
                                'HONEY, BEE COLONIES, AFFECTED BY PESTS ((EXCL VARROA MITES)) - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Pests',
                                'HONEY, BEE COLONIES, AFFECTED BY UNKNOWN CAUSES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Unknown',
                                'HONEY, BEE COLONIES, AFFECTED BY VARROA MITES - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Affected_Varroa_Mites',
                                'HONEY, BEE COLONIES, RENOVATED - INVENTORY, MEASURED IN COLONIES  -  <b>VALUE</b>' : 'Num_Renovated',
                                'HONEY, BEE COLONIES, RENOVATED - INVENTORY, MEASURED IN PCT OF COLONIES  -  <b>VALUE</b>' : 'Pct_Renovated'
                               }
                               
    raw_df = raw_df.rename(columns=column_mapping)
    
    raw_df = raw_df.replace(',', '', regex=True)
    raw_df[raw_df.columns[3:]] = raw_df.iloc[:, 3:].apply(pd.to_numeric, errors='coerce')

    # Split the dataset
    national_df = raw_df[raw_df['State'] == 'US TOTAL']
    state_df = raw_df[raw_df['State'] != 'US TOTAL']

    state_df = state_df.dropna(axis=1, how='all')
    national_df = national_df.dropna(axis=1, how='all')

    # Map "Period" to quarters
    quarters_mapping = {
        'JAN THRU MAR': 'Q1',
        'APR THRU JUN': 'Q2',
        'JUL THRU SEP': 'Q3',
        'OCT THRU DEC': 'Q4',
    }
    state_df['Period'] = state_df['Period'].map(quarters_mapping)
    national_df['Period'] = national_df['Period'].map(quarters_mapping)

    # Create and format "Quarter" column
    national_df['Quarter'] = national_df['Year'].astype(str) + '_' + national_df['Period']
    state_df['Quarter'] = state_df['Year'].astype(str) + '_' + state_df['Period']

    # Drop unnecessary columns
    national_df = national_df.drop(columns=['Period', 'Year'])
    state_df = state_df.drop(columns=['Period', 'Year'])

    # Rearrange and sort data
    national_df = national_df[['Quarter'] + [col for col in national_df.columns if col != 'Quarter']]
    state_df = state_df[['Quarter'] + [col for col in state_df.columns if col != 'Quarter']]
    national_df = national_df.sort_values(by='Quarter', ascending=True)
    state_df = state_df.sort_values(by='Quarter', ascending=True)

    # Reset index and calculate state_sum
    national_df = national_df.reset_index(drop=True)
    state_df = state_df.reset_index(drop=True)
    state_sum = state_df.groupby('Quarter')['Max_Colonies'].sum().reset_index()
    national_df = national_df.merge(state_sum, on='Quarter', how='left')
    national_df = national_df.rename(columns={'Max_Colonies_x': 'Max_Colonies'})

    # Define file paths using the output folder
    state_file_path = os.path.join(data_folder, 'state_data.csv')
    national_file_path = os.path.join(data_folder, 'national_data.csv')

    # Save data to CSV files
    state_df.to_csv(state_file_path, index=False)
    national_df.to_csv(national_file_path, index=False)

    print("Data Saved")






# # Define the data folder path
current_directory = os.path.dirname(__file__)

# Get the parent directory
parent_directory = os.path.abspath(os.path.join(current_directory, os.pardir))
data_folder = os.path.join(parent_directory, 'Data')
print(data_folder)

# Define the raw data file path
raw_data_filename = "bee-data-RAW.csv"
raw_data_path = os.path.join(data_folder, raw_data_filename)




# # # Call the function with the defined paths
process_data(raw_data_path, data_folder)
