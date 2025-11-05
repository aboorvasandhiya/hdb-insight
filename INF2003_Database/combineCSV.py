import pandas as pd
import os

# Absolute paths to your CSVs
csv1_path = r'C:\Users\aliya\VisualStudiosCode\INF2003_Database\20152016.csv'
csv2_path = r'C:\Users\aliya\VisualStudiosCode\INF2003_Database\2017onwards.csv'

# Optional: check if files exist
if not os.path.exists(csv1_path):
    raise FileNotFoundError(f"{csv1_path} does not exist!")
if not os.path.exists(csv2_path):
    raise FileNotFoundError(f"{csv2_path} does not exist!")

# Read CSV files
csv1 = pd.read_csv(csv1_path)
csv2 = pd.read_csv(csv2_path)

# Combine by rows
combined = pd.concat([csv1, csv2], ignore_index=True)

# Save to new CSV
combined_path = r'C:\Users\aliya\VisualStudiosCode\INF2003_Database\ResaleFlats_2015to2025.csv'
combined.to_csv(combined_path, index=False)

print("CSV files combined successfully!")
