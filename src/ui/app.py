from PySide6.QtWidgets import QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QFileDialog, QProgressBar, QTextEdit, QMessageBox
import csv
import sys
import os
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QIcon, QPixmap
from src.infrastructure.file_system.directory_reader import DirectoryReader
from src.application.use_cases.run_comparison import RunComparisonUseCase

def resource_path(relative_path):
    """Get absolute path to resource, works for dev and for PyInstaller"""
    try:
        base_path = sys._MEIPASS
    except Exception:
        if os.path.exists(os.path.join(os.path.abspath("."), relative_path)):
            base_path = os.path.abspath(".")
        else:
            base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.join(base_path, relative_path)

class WorkerThread(QThread):
    progress_update = Signal(int, int)
    scan_complete = Signal(list)

    def __init__(self, folder_path):
        super().__init__()
        self.folder_path = folder_path

    def run(self):
        try:
            reader = DirectoryReader()
            submissions = reader.read_directory(self.folder_path)
            
            if len(submissions) < 2:
                self.scan_complete.emit([])
                return
                
            use_case = RunComparisonUseCase()
            
            def on_progress(current, total):
                self.progress_update.emit(current, total)
                
            results = use_case.execute(submissions, progress_callback=on_progress)
            self.scan_complete.emit(results)
        except Exception as e:
            import traceback
            error_msg = f"ERROR: {str(e)}\n{traceback.format_exc()}"
            self.scan_complete.emit([error_msg])

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("CodeGuard - Enterprise Plagiarism Detection")
        self.setMinimumSize(800, 600)
        self.setWindowIcon(QIcon(resource_path("Icon.ico")))
        
        # Simple light mode styling
        self.setStyleSheet("""
            QMainWindow { background-color: #ffffff; color: #333333; }
            QWidget { background-color: #ffffff; color: #333333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            QPushButton { background-color: #007bff; color: #ffffff; border: none; border-radius: 5px; font-weight: bold; }
            QPushButton:hover { background-color: #0056b3; }
            QPushButton:disabled { background-color: #cccccc; color: #666666; }
            QTextEdit { background-color: #f8f9fa; border: 1px solid #ced4da; border-radius: 5px; padding: 10px; color: #333333; }
            QProgressBar { border: 1px solid #ced4da; border-radius: 5px; text-align: center; color: #333333; }
            QProgressBar::chunk { background-color: #28a745; }
        """)
        
        self._init_ui()
        
    def _init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout()
        
        logo_layout = QHBoxLayout()
        
        logo1_label = QLabel()
        pixmap1 = QPixmap(resource_path("logo 1.jpeg"))
        ratio = self.devicePixelRatioF()
        if not pixmap1.isNull():
            scaled1 = pixmap1.scaled(150 * ratio, 150 * ratio, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            scaled1.setDevicePixelRatio(ratio)
            logo1_label.setPixmap(scaled1)
        
        logo2_label = QLabel()
        pixmap2 = QPixmap(resource_path("logo 2.jpeg"))
        if not pixmap2.isNull():
            scaled2 = pixmap2.scaled(150 * ratio, 150 * ratio, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            scaled2.setDevicePixelRatio(ratio)
            logo2_label.setPixmap(scaled2)
            
        logo_layout.addWidget(logo1_label, alignment=Qt.AlignLeft)
        logo_layout.addStretch()
        logo_layout.addWidget(logo2_label, alignment=Qt.AlignRight)
        
        layout.addLayout(logo_layout)
        
        self.title_label = QLabel("CodeGuard Dashboard")
        self.title_label.setAlignment(Qt.AlignCenter)
        self.title_label.setStyleSheet("font-size: 28px; font-weight: bold; margin: 20px 0; color: #2c3e50;")
        layout.addWidget(self.title_label)
        
        btn_layout = QHBoxLayout()
        
        self.select_btn = QPushButton("Select Submissions Folder to Scan")
        self.select_btn.setMinimumHeight(60)
        self.select_btn.clicked.connect(self.select_folder)
        btn_layout.addWidget(self.select_btn)
        
        self.export_btn = QPushButton("Export to Excel (CSV)")
        self.export_btn.setMinimumHeight(60)
        self.export_btn.setEnabled(False)
        self.export_btn.clicked.connect(self.export_to_csv)
        self.export_btn.setStyleSheet("background-color: #28a745; color: #ffffff; font-weight: bold;")
        btn_layout.addWidget(self.export_btn)
        
        layout.addLayout(btn_layout)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setMinimumHeight(30)
        layout.addWidget(self.progress_bar)
        
        self.results_text = QTextEdit()
        self.results_text.setReadOnly(True)
        self.results_text.setStyleSheet("font-family: 'Consolas', monospace; font-size: 14px;")
        layout.addWidget(self.results_text)
        
        self.powered_by_label = QLabel("Powered by youssef alsayed")
        self.powered_by_label.setAlignment(Qt.AlignCenter)
        self.powered_by_label.setStyleSheet("color: #666666; font-size: 8px; margin-top: 5px; font-style: italic;")
        layout.addWidget(self.powered_by_label)
        
        central_widget.setLayout(layout)
        
    def select_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Submissions Folder")
        if folder:
            self.run_scan(folder)
            
    def run_scan(self, folder_path):
        self.results_text.clear()
        self.results_text.append(f"[*] Starting scan on directory: {folder_path}\n")
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
        self.select_btn.setEnabled(False)
        self.export_btn.setEnabled(False)
        
        self.worker = WorkerThread(folder_path)
        self.worker.progress_update.connect(self.update_progress)
        self.worker.scan_complete.connect(self.show_results)
        self.worker.start()
        
    def update_progress(self, current, total):
        self.progress_bar.setMaximum(total)
        self.progress_bar.setValue(current)
        
    def show_results(self, results):
        self.progress_bar.setVisible(False)
        self.select_btn.setEnabled(True)
        
        if not results:
            self.results_text.append("[!] No comparisons could be made. Ensure there are multiple .py files in different subdirectories.")
            return
            
        if isinstance(results[0], str) and results[0].startswith("ERROR:"):
            self.results_text.setTextColor(Qt.red)
            self.results_text.append(results[0])
            self.results_text.setTextColor(Qt.black)
            return
            
        self.filtered_results = [r for r in results if (r.overall_score * 100) >= 65.0]
        
        if not self.filtered_results:
            self.results_text.append("[+] Scan Complete! No pairs found with similarity >= 65%.")
            return
            
        self.export_btn.setEnabled(True)
            
        self.results_text.append("[+] Scan Complete! Top Suspicious Pairs (>= 65%):\n")
        self.results_text.append("-" * 60)
        self.results_text.append(f"{'Student A':<20} | {'Student B':<20} | {'Similarity':<10}")
        self.results_text.append("-" * 60)
        
        for result in self.filtered_results[:50]:  # Top 50 of filtered
            id_a = result.sub_a.student_identifier[:18]
            id_b = result.sub_b.student_identifier[:18]
            score = result.overall_score * 100
            
            # Highlight suspicious scores
            if score > 70:
                self.results_text.setTextColor(Qt.red)
            elif score > 40:
                self.results_text.setTextColor(Qt.darkYellow)
            else:
                self.results_text.setTextColor(Qt.black)
                
            self.results_text.append(f"{id_a:<20} | {id_b:<20} | {score:>7.2f}%")
            self.results_text.setTextColor(Qt.black) # reset
            
    def export_to_csv(self):
        if not hasattr(self, 'filtered_results') or not self.filtered_results:
            return
            
        file_path, _ = QFileDialog.getSaveFileName(self, "Save Excel/CSV", "", "CSV Files (*.csv)")
        if file_path:
            with open(file_path, mode='w', newline='', encoding='utf-8-sig') as f:
                writer = csv.writer(f)
                writer.writerow(['Student A', 'Student B', 'Similarity %'])
                for r in self.filtered_results:
                    writer.writerow([r.sub_a.student_identifier, r.sub_b.student_identifier, f"{r.overall_score * 100:.2f}"])
            
            QMessageBox.information(self, "Success", f"Results exported successfully to:\n{file_path}")
