import json
from sqlalchemy.orm import Session
from src.lms.models import Submission as DBSubmission, PlagiarismReport
from src.core.entities.submission import Submission as EngineSubmission
from src.application.use_cases.run_comparison import RunComparisonUseCase

def check_task_plagiarism(task_id: int, db: Session) -> list:
    """
    Runs plagiarism detection across all student submissions for a given task_id.
    Saves/updates PlagiarismReport records in the database.
    """
    submissions_db = db.query(DBSubmission).filter(DBSubmission.task_id == task_id).all()
    if len(submissions_db) < 2:
        return []

    # Map DB submissions to Engine submissions
    engine_subs = []
    for sub in submissions_db:
        if sub.code_content and len(sub.code_content.strip()) > 0:
            engine_subs.append(EngineSubmission(
                id=str(sub.id),
                student_identifier=sub.student_id,
                file_path=sub.file_name or "solution.py",
                language=sub.language or "python",
                raw_code=sub.code_content
            ))

    if len(engine_subs) < 2:
        return []

    use_case = RunComparisonUseCase()
    comparison_results = use_case.execute(engine_subs)

    reports = []
    # Clear old reports for this task
    db.query(PlagiarismReport).filter(PlagiarismReport.task_id == task_id).delete()
    db.commit()

    for res in comparison_results:
        sub_a_db_id = int(res.sub_a.id)
        sub_b_db_id = int(res.sub_b.id)

        # Retrieve DB submissions to get student IDs
        sub_a = db.query(DBSubmission).filter(DBSubmission.id == sub_a_db_id).first()
        sub_b = db.query(DBSubmission).filter(DBSubmission.id == sub_b_db_id).first()

        if not sub_a or not sub_b:
            continue

        report = PlagiarismReport(
            task_id=task_id,
            submission_a_id=sub_a.id,
            submission_b_id=sub_b.id,
            student_a_id=sub_a.student_id,
            student_b_id=sub_b.student_id,
            similarity_score=round(res.overall_score * 100, 2),
            details_json=json.dumps({
                "algorithm_scores": {k: round(v * 100, 2) for k, v in res.algorithm_scores.items()},
                "code_a_snippet": sub_a.code_content[:500],
                "code_b_snippet": sub_b.code_content[:500]
            }, ensure_ascii=False)
        )
        db.add(report)
        reports.append(report)

    db.commit()
    return reports
