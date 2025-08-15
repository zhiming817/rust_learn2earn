use sqlx::{MySqlPool, Row};
use crate::models::task_submission::{TaskSubmission, TaskSubmissionQuery, TaskSubmissionListResponse};
use crate::models::task::PaginationInfo;
use anyhow::Result;

pub struct TaskSubmissionService;

impl TaskSubmissionService {
    pub async fn get_submissions_by_task_id(
        pool: &MySqlPool,
        task_id: i64,
        query: TaskSubmissionQuery,
    ) -> Result<TaskSubmissionListResponse> {
        let mut where_clause = "WHERE task_id = ?".to_string();
        let mut count_params = vec![task_id];
        let mut data_params = vec![task_id];
        
        if let Some(ref status) = query.status {
            where_clause.push_str(" AND status = ?");
            count_params.push(task_id); // 重新添加task_id用于count查询
            data_params.push(task_id); // 重新添加task_id用于data查询
        }

        // 查询总数
        let count_sql = format!("SELECT COUNT(*) FROM task_submission {}", where_clause);
        let total_row = if let Some(ref status) = query.status {
            sqlx::query(&count_sql)
                .bind(task_id)
                .bind(status)
                .fetch_one(pool)
                .await?
        } else {
            sqlx::query(&count_sql)
                .bind(task_id)
                .fetch_one(pool)
                .await?
        };
        let total: u32 = total_row.get::<i64, _>(0) as u32;

        // 查询数据
        let data_sql = format!(
            "SELECT id, task_id, user_id, pr_url, status, note, created_at, updated_at 
             FROM task_submission {} 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?",
            where_clause
        );

        let rows = if let Some(ref status) = query.status {
            sqlx::query(&data_sql)
                .bind(task_id)
                .bind(status)
                .bind(query.page_size())
                .bind(query.offset())
                .fetch_all(pool)
                .await?
        } else {
            sqlx::query(&data_sql)
                .bind(task_id)
                .bind(query.page_size())
                .bind(query.offset())
                .fetch_all(pool)
                .await?
        };

        let submissions: Vec<TaskSubmission> = rows
            .iter()
            .map(|row| TaskSubmission {
                id: row.get("id"),
                task_id: row.get("task_id"),
                user_id: row.get("user_id"),
                pr_url: row.get("pr_url"),
                status: row.get("status"),
                note: row.get("note"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            })
            .collect();

        let total_pages = (total + query.page_size() - 1) / query.page_size();
        
        let response = TaskSubmissionListResponse {
            data: submissions,
            pagination: PaginationInfo {
                page: query.page(),
                page_size: query.page_size(),
                total,
                total_pages,
            },
        };

        Ok(response)
    }

    pub async fn get_submission_by_id(
        pool: &MySqlPool,
        id: i64,
    ) -> Result<Option<TaskSubmission>> {
        let row = sqlx::query(
            "SELECT id, task_id, user_id, pr_url, status, note, created_at, updated_at 
             FROM task_submission WHERE id = ?"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(TaskSubmission {
                id: row.get("id"),
                task_id: row.get("task_id"),
                user_id: row.get("user_id"),
                pr_url: row.get("pr_url"),
                status: row.get("status"),
                note: row.get("note"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn approve_submission(
        pool: &MySqlPool,
        submission_id: i64,
    ) -> Result<bool> {
        let result = sqlx::query(
            "UPDATE task_submission SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        .bind(submission_id)
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn reject_submission(
        pool: &MySqlPool,
        submission_id: i64,
        note: Option<String>,
    ) -> Result<bool> {
        let result = if let Some(note_text) = note {
            sqlx::query(
                "UPDATE task_submission SET status = 'rejected', note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            )
            .bind(note_text)
            .bind(submission_id)
            .execute(pool)
            .await?
        } else {
            sqlx::query(
                "UPDATE task_submission SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            )
            .bind(submission_id)
            .execute(pool)
            .await?
        };

        Ok(result.rows_affected() > 0)
    }
}