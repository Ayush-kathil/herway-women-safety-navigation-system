import kagglehub
import os
import shutil
import glob

# Download latest version
path = kagglehub.dataset_download("yashraut/indore-police-crime-dataset")

print("Path to dataset files:", path)

# Find the CSV file in the downloaded directory
print(f"Dataset path: {path}")

def find_and_copy_csv(search_path):
    # Search for CSV file
    csv_files = glob.glob(os.path.join(search_path, "**", "*.csv"), recursive=True)
    
    if csv_files:
        source_file = csv_files[0]
        destination_file = "data.csv"
        # Copy the file to the current directory
        try:
             shutil.copy(source_file, destination_file)
             print(f"Successfully copied {os.path.basename(source_file)} to {destination_file}")
             return True
        except Exception as e:
             print(f"Error copying file: {e}")
             return False
    return False

if not find_and_copy_csv(path):
    print("No CSV file found in the initial path.")
    # Check if directory is empty or nearly empty
    if not os.listdir(path):
        print("Directory is empty. Removing and redownloading...")
        try:
            shutil.rmtree(path)
            # Re-download
            path = kagglehub.dataset_download("yashraut/indore-police-crime-dataset")
            print(f"New dataset path: {path}")
            if not find_and_copy_csv(path):
                 print("Still no CSV found after redownload.")
        except Exception as e:
            print(f"Error during redownload: {e}")
    else:
        # Search parent directory as fallback
        parent_path = os.path.dirname(path)
        if not find_and_copy_csv(parent_path):
            print("Could not find CSV in parent directory either.")