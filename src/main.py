import sys
import ctypes
from PySide6.QtWidgets import QApplication
from PySide6.QtGui import QIcon
from src.ui.app import MainWindow, resource_path

def main():
    # Fix taskbar icon on Windows
    if sys.platform == 'win32':
        myappid = 'yousef.codeguard.plagiarism.1.0'
        try:
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(myappid)
        except Exception:
            pass

    app = QApplication(sys.argv)
    app.setWindowIcon(QIcon(resource_path("Icon.ico")))
    window = MainWindow()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
