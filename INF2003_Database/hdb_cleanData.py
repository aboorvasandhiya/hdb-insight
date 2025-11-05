import pandas as pd
import re

# --- 1. Load Dataset ---
df = pd.read_csv("ResaleFlats_2015to2025.csv")
print("Original dataset size:", df.shape)

# --- 2. Drop duplicates ---
df = df.drop_duplicates()
print("After removing duplicates:", df.shape)

# --- 3. Exclude 2025 data ---
df = df[~df['month'].astype(str).str.startswith("2025")]
print("After excluding 2025 flats:", df.shape)

# --- 4. Convert 'month' to datetime ---
# convert 'month' from "YYYY-MM" to a datetime object (e.g. 2023-05-01)
df['month'] = pd.to_datetime(df['month'].astype(str) + '-01', errors='coerce')

# --- 5. Clean 'town' ---
df['town'] = df['town'].astype(str).str.strip().str.title()

# --- 6. Clean 'flat_type' ---
df['flat_type'] = df['flat_type'].astype(str).str.strip().str.upper()

# --- 7. Clean 'block' ---
df['block'] = df['block'].astype(str).str.strip()

# --- 8. Clean 'street_name' ---
df['street_name'] = df['street_name'].astype(str).str.strip().str.title()

# --- 9. Convert 'lease_commence_date' to int ---
df['lease_commence_date'] = df['lease_commence_date'].astype(int)

# --- 10. Split 'storey_range' into 'storey_min' and 'storey_max' ---
def split_storey_range(val):
    if isinstance(val, str) and "TO" in val:
        parts = val.split("TO")
        try:
            return int(parts[0].strip()), int(parts[1].strip())
        except:
            return None, None
    return None, None

df[['storey_min', 'storey_max']] = df['storey_range'].apply(
    lambda x: pd.Series(split_storey_range(x))
)

# --- 11. Convert 'remaining_lease' to full years (int, rounded down) ---
def convert_lease_to_years(value):
    if pd.isna(value):
        return None
    text = str(value).lower().strip()

    # Handle plain numbers like "32"
    if text.isdigit():
        return int(text)

    # Extract years and months
    match = re.search(r'(\d+)\s*year(?:s)?(?:\s*(\d+)\s*month(?:s)?)?', text)
    if match:
        years = int(match.group(1))
        # months ignored for rounding down
        return years

    return None  # If no match found

df['remaining_lease_years'] = df['remaining_lease'].apply(convert_lease_to_years)

# --- 12. Drop unwanted columns ---
df = df.drop(columns=['remaining_lease', 'storey_range'], errors='ignore')
print(df.columns)


# --- 13. Save cleaned dataset ---
df.to_csv("ResaleFlats.csv", index=False)
print("\n Cleaning complete! Saved as 'ResaleFlats.csv'")
