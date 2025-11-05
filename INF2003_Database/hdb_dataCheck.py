import pandas as pd

df = pd.read_csv("ResaleFlats.csv")

print("\n--- First 5 rows of the dataset ---")
print(df.head())  # Shows first 5 rows to check structure and sample data


print("\n--- Dataset info ---")
print(df.info())  # Tells you number of rows, columns, column names, data types, and non-null counts


print("\n--- Statistical summary ---")
print(df.describe())  # Gives count, mean, std, min, max, 25%, 50%, 75% percentiles for numeric columns


print("\n--- Missing values per column ---")
print(df.isnull().sum())  # Shows number of missing (NaN) values in each column


print("\n--- Number of duplicate rows ---")
print(df.duplicated().sum())  # Counts rows that are exact duplicates of other rows