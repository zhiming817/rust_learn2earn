use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Task {
    pub code: String,
    pub created_at: DateTime<Utc>,
    pub description: String,
    pub id: i64,
    pub name: String,
    pub reward_cny: i32,
    pub reward_token: String,
    pub updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct CreateTaskRequest {
    pub code: String,
    pub name: String,
    pub reward_cny: i32,
    pub reward_token: String,
    pub description: String,
}

#[derive(Deserialize)]
pub struct UpdateTaskRequest {
    pub name: Option<String>,
    pub reward_cny: Option<i32>,
    pub reward_token: Option<String>,
    pub description: Option<String>,
}

#[derive(Deserialize)]
pub struct TaskQuery {
    pub page: Option<u32>,
    pub page_size: Option<u32>,
    pub search: Option<String>,
}

impl TaskQuery {
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
pub struct TaskListResponse {
    pub data: Vec<Task>,
    pub pagination: PaginationInfo,
}

#[derive(Serialize)]
pub struct PaginationInfo {
    pub page: u32,
    pub page_size: u32,
    pub total: u32,
    pub total_pages: u32,
}