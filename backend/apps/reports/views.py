from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from openpyxl import Workbook
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.students.models import Student

from .selectors import consolidated_for_student, consolidated_for_students


class ConsolidatedReportView(APIView):
    def get(self, request):
        rows = consolidated_for_students(Student.objects.all())
        return Response({"results": rows, "count": len(rows)})


class ConsolidatedStudentReportView(APIView):
    def get(self, request, student_id: str):
        student = get_object_or_404(Student, student_id=student_id)
        return Response(consolidated_for_student(student))


class ExportXlsxView(APIView):
    def get(self, request):
        rows = consolidated_for_students(Student.objects.all())

        wb = Workbook()
        ws = wb.active
        ws.title = "Consolidated"
        headers = [
            "Student ID",
            "Student Name",
            "Email",
            "Subjects at Risk W4",
            "Subjects at Risk W8",
            "Total Subjects",
            "Risk %",
            "Overall Risk Level",
        ]
        ws.append(headers)
        for r in rows:
            ws.append(
                [
                    r["studentId"],
                    r["studentName"],
                    r["email"],
                    r["subjectsAtRiskW4"],
                    r["subjectsAtRiskW8"],
                    r["totalSubjects"],
                    r["riskPct"],
                    r["overallRiskLevel"],
                ]
            )

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="consolidated_report.xlsx"'
        wb.save(response)
        return response
