import pandas as pd

# Load the Excel file
file_path = '/Users/danielvajda/00_ZOZNAM/Zoznam reklamácii_2024_1.xlsx'

# Load the sheets
df_internal = pd.read_excel(file_path, sheet_name='interne')
df_external = pd.read_excel(file_path, sheet_name='externe')

# Display the first few rows of the date columns to verify the format
print("Internal sheet dates:", df_internal['Dátum'].head())
print("External sheet dates:", df_external['Dátum'].head())
print("External sheet response dates:", df_external['Dátum odpovede'].head())