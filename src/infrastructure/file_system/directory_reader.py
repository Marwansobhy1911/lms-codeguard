import os
import glob
from typing import List
from src.core.entities.submission import Submission

class DirectoryReader:
    def read_directory(self, path: str, extension: str = "*.py") -> List[Submission]:
        submissions = []
        search_pattern = os.path.join(path, "**", extension)
        
        path = os.path.abspath(path)
        
        for file_path in glob.glob(search_pattern, recursive=True):
            file_path = os.path.abspath(file_path)
            with open(file_path, "rb") as f:
                content = f.read()
                
            parent_dir = os.path.dirname(file_path)
            if parent_dir == path:
                # If the file is directly in the selected folder, use the filename as the student ID
                student_id = os.path.splitext(os.path.basename(file_path))[0]
            else:
                # If the file is inside a subfolder, use the subfolder's name as the student ID
                student_id = os.path.basename(parent_dir)
            
            sub = Submission(
                id=file_path,
                student_identifier=student_id,
                file_path=file_path,
                language="python",
                raw_code=content.decode('utf8', errors='ignore')
            )
            submissions.append(sub)
            
        return submissions
