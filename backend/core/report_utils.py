"""
Report Generation Utilities for APROVOVA
Centralized utilities for generating and managing reports
"""

import os
import csv
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.http import HttpResponse, FileResponse


class ReportGenerator:
    """Base class for generating reports in various formats"""
    
    def __init__(self, report_type: str):
        """
        Initialize report generator
        
        Args:
            report_type: Type of report (user, payment, batch, analytics)
        """
        self.report_type = report_type
        self.base_dir = self._get_report_directory()
        
    def _get_report_directory(self) -> Path:
        """Get the appropriate directory for the report type"""
        report_dirs = {
            'user': settings.APROVOVA_USER_REPORTS_DIR,
            'payment': settings.APROVOVA_PAYMENT_REPORTS_DIR,
            'batch': settings.APROVOVA_BATCH_REPORTS_DIR,
            'analytics': settings.APROVOVA_ANALYTICS_REPORTS_DIR,
        }
        return report_dirs.get(self.report_type, settings.APROVOVA_REPORTS_DIR)
    
    def _generate_filename(self, format: str, prefix: str = '') -> str:
        """
        Generate unique filename for report
        
        Args:
            format: File format (csv, pdf, json)
            prefix: Optional prefix for filename
            
        Returns:
            Unique filename with timestamp
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        prefix_str = f"{prefix}_" if prefix else ""
        return f"{prefix_str}{self.report_type}_report_{timestamp}.{format}"
    
    def generate_csv(self, data: List[Dict[str, Any]], filename: Optional[str] = None) -> str:
        """
        Generate CSV report
        
        Args:
            data: List of dictionaries containing report data
            filename: Optional custom filename
            
        Returns:
            Path to generated CSV file
        """
        if not data:
            raise ValueError("No data provided for CSV generation")
        
        # Generate filename
        if not filename:
            filename = self._generate_filename('csv')
        
        # Create CSV directory if it doesn't exist
        csv_dir = self.base_dir / 'csv'
        csv_dir.mkdir(parents=True, exist_ok=True)
        
        # Full file path
        file_path = csv_dir / filename
        
        # Write CSV file
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            if data:
                fieldnames = data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
        
        return str(file_path)
    
    def generate_json(self, data: Any, filename: Optional[str] = None) -> str:
        """
        Generate JSON report
        
        Args:
            data: Data to be converted to JSON
            filename: Optional custom filename
            
        Returns:
            Path to generated JSON file
        """
        # Generate filename
        if not filename:
            filename = self._generate_filename('json')
        
        # Create JSON directory if it doesn't exist
        json_dir = self.base_dir / 'json'
        json_dir.mkdir(parents=True, exist_ok=True)
        
        # Full file path
        file_path = json_dir / filename
        
        # Write JSON file
        with open(file_path, 'w', encoding='utf-8') as jsonfile:
            json.dump(data, jsonfile, indent=2, default=str)
        
        return str(file_path)
    
    def get_csv_response(self, data: List[Dict[str, Any]], filename: str) -> HttpResponse:
        """
        Generate CSV response for download
        
        Args:
            data: List of dictionaries containing report data
            filename: Filename for download
            
        Returns:
            HttpResponse with CSV content
        """
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        if data:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(response, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        return response
    
    def get_json_response(self, data: Any, filename: str) -> HttpResponse:
        """
        Generate JSON response for download
        
        Args:
            data: Data to be converted to JSON
            filename: Filename for download
            
        Returns:
            HttpResponse with JSON content
        """
        response = HttpResponse(content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response.write(json.dumps(data, indent=2, default=str))
        
        return response
    
    def list_reports(self, format: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all reports in the directory
        
        Args:
            format: Optional format filter (csv, pdf, json)
            
        Returns:
            List of report metadata
        """
        reports = []
        
        # Determine which directories to scan
        if format:
            dirs_to_scan = [self.base_dir / format]
        else:
            dirs_to_scan = [
                self.base_dir / 'csv',
                self.base_dir / 'pdf',
                self.base_dir / 'json',
            ]
        
        for directory in dirs_to_scan:
            if directory.exists():
                for file_path in directory.iterdir():
                    if file_path.is_file() and not file_path.name.startswith('.'):
                        stat = file_path.stat()
                        reports.append({
                            'name': file_path.name,
                            'path': str(file_path),
                            'format': file_path.suffix[1:],
                            'size': stat.st_size,
                            'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        })
        
        # Sort by creation time (newest first)
        reports.sort(key=lambda x: x['created'], reverse=True)
        
        return reports
    
    def delete_report(self, filename: str) -> bool:
        """
        Delete a specific report
        
        Args:
            filename: Name of the file to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        # Search in all format directories
        for format_dir in ['csv', 'pdf', 'json', 'invoices', 'charts']:
            file_path = self.base_dir / format_dir / filename
            if file_path.exists():
                file_path.unlink()
                return True
        
        return False
    
    def cleanup_old_reports(self, days: int = 90) -> int:
        """
        Delete reports older than specified days
        
        Args:
            days: Number of days to retain reports
            
        Returns:
            Number of reports deleted
        """
        from datetime import timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        
        for format_dir in ['csv', 'pdf', 'json', 'invoices', 'charts']:
            directory = self.base_dir / format_dir
            if directory.exists():
                for file_path in directory.iterdir():
                    if file_path.is_file() and not file_path.name.startswith('.'):
                        stat = file_path.stat()
                        file_date = datetime.fromtimestamp(stat.st_mtime)
                        
                        if file_date < cutoff_date:
                            file_path.unlink()
                            deleted_count += 1
        
        return deleted_count


# Convenience functions for quick report generation

def generate_user_report(data: List[Dict], format: str = 'csv') -> str:
    """Generate user report"""
    generator = ReportGenerator('user')
    if format == 'csv':
        return generator.generate_csv(data)
    elif format == 'json':
        return generator.generate_json(data)
    else:
        raise ValueError(f"Unsupported format: {format}")


def generate_payment_report(data: List[Dict], format: str = 'csv') -> str:
    """Generate payment report"""
    generator = ReportGenerator('payment')
    if format == 'csv':
        return generator.generate_csv(data)
    elif format == 'json':
        return generator.generate_json(data)
    else:
        raise ValueError(f"Unsupported format: {format}")


def generate_batch_report(data: List[Dict], format: str = 'csv') -> str:
    """Generate batch report"""
    generator = ReportGenerator('batch')
    if format == 'csv':
        return generator.generate_csv(data)
    elif format == 'json':
        return generator.generate_json(data)
    else:
        raise ValueError(f"Unsupported format: {format}")


def generate_analytics_report(data: Any, format: str = 'json') -> str:
    """Generate analytics report"""
    generator = ReportGenerator('analytics')
    if format == 'csv' and isinstance(data, list):
        return generator.generate_csv(data)
    elif format == 'json':
        return generator.generate_json(data)
    else:
        raise ValueError(f"Unsupported format: {format}")

