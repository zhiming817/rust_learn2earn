use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct TaskSubmission {
    pub id: i64,
    pub task_id: i64,
    pub user_id: i64,
    pub pr_url: String,
    pub status: String,
    pub note: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct CreateTaskSubmissionRequest {
    pub task_id: i64,
    pub user_id: i64,
    pub pr_url: String,
    pub note: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateTaskSubmissionRequest {
    pub status: Option<String>,
    pub note: Option<String>,
}

#[derive(Deserialize)]
pub struct TaskSubmissionQuery {
    pub page: Option<u32>,
    pub page_size: Option<u32>,
    pub status: Option<String>,
}

impl TaskSubmissionQuery {
    pub fn page(&self) -> u32 {
        self.page.unwrap_or(1).max(1)
    }

    pub fn page_size(&self) -> u32 {
        self.page_size.unwrap_or(10).min(100).max(1)
    }

    pub fn offset(&self) -> u32 {
        (self.page() - 1) * self.page_size()
    }
}

#[derive(Serialize)]
pub struct TaskSubmissionListResponse {
    pub data: Vec<TaskSubmission>,
    pub pagination: super::task::PaginationInfo,
}