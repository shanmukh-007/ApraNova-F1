#!/usr/bin/env python
"""
Initialize APROVOVA directory structure for reports
This script creates the necessary directories for storing reports
"""

import os
from pathlib import Path

# Get the base directory (project root)
BASE_DIR = Path(__file__).resolve().parent.parent

# Define APROVOVA directory structure
APROVOVA_STRUCTURE = {
    'APROVOVA': {
        'user_reports': {
            'csv': {},
            'pdf': {},
            'json': {},
        },
        'payment_reports': {
            'csv': {},
            'pdf': {},
            'json': {},
            'invoices': {},
        },
        'batch_reports': {
            'csv': {},
            'pdf': {},
            'json': {},
        },
        'analytics_reports': {
            'csv': {},
            'pdf': {},
            'json': {},
            'charts': {},
        },
    }
}


def create_directory_structure(base_path, structure):
    """
    Recursively create directory structure
    
    Args:
        base_path: Base path where to create directories
        structure: Dictionary representing directory structure
    """
    for name, subdirs in structure.items():
        dir_path = base_path / name
        
        # Create directory if it doesn't exist
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"✓ Created: {dir_path}")
        else:
            print(f"✓ Exists: {dir_path}")
        
        # Create .gitkeep file to track empty directories in git
        gitkeep_path = dir_path / '.gitkeep'
        if not gitkeep_path.exists():
            gitkeep_path.touch()
            print(f"  Added .gitkeep to {name}/")
        
        # Create README.md with directory purpose
        readme_path = dir_path / 'README.md'
        if not readme_path.exists() and name in ['user_reports', 'payment_reports', 'batch_reports', 'analytics_reports']:
            readme_content = f"""# {name.replace('_', ' ').title()}

This directory contains {name.replace('_', ' ')}.

## Structure

- **csv/**: CSV format reports
- **pdf/**: PDF format reports
- **json/**: JSON format reports
{f"- **invoices/**: Payment invoices" if name == 'payment_reports' else ""}
{f"- **charts/**: Chart images and visualizations" if name == 'analytics_reports' else ""}

## Usage

Reports are automatically generated and stored here by the application.

## Retention Policy

- Reports older than 90 days may be archived
- Critical reports are retained indefinitely

## Access

Access to these reports is restricted to authorized users only.
"""
            with open(readme_path, 'w') as f:
                f.write(readme_content)
            print(f"  Added README.md to {name}/")
        
        # Recursively create subdirectories
        if subdirs:
            create_directory_structure(dir_path, subdirs)


def create_gitignore():
    """Create .gitignore file for APROVOVA directory"""
    gitignore_path = BASE_DIR / 'APROVOVA' / '.gitignore'
    gitignore_content = """# Ignore all files in APROVOVA directory except structure
*
!.gitignore
!.gitkeep
!README.md
!*/

# Keep subdirectory structure
!user_reports/
!payment_reports/
!batch_reports/
!analytics_reports/
"""
    
    with open(gitignore_path, 'w') as f:
        f.write(gitignore_content)
    print(f"✓ Created .gitignore in APROVOVA/")


def main():
    """Main function to initialize APROVOVA structure"""
    print("=" * 60)
    print("Initializing APROVOVA Directory Structure")
    print("=" * 60)
    print()
    
    # Create directory structure
    create_directory_structure(BASE_DIR, APROVOVA_STRUCTURE)
    
    print()
    
    # Create .gitignore
    create_gitignore()
    
    print()
    print("=" * 60)
    print("✓ APROVOVA directory structure initialized successfully!")
    print("=" * 60)
    print()
    print("Directory structure:")
    print("APROVOVA/")
    print("├── user_reports/")
    print("│   ├── csv/")
    print("│   ├── pdf/")
    print("│   └── json/")
    print("├── payment_reports/")
    print("│   ├── csv/")
    print("│   ├── pdf/")
    print("│   ├── json/")
    print("│   └── invoices/")
    print("├── batch_reports/")
    print("│   ├── csv/")
    print("│   ├── pdf/")
    print("│   └── json/")
    print("└── analytics_reports/")
    print("    ├── csv/")
    print("    ├── pdf/")
    print("    ├── json/")
    print("    └── charts/")
    print()


if __name__ == '__main__':
    main()

