use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Serialize, Deserialize, Debug)]
pub struct Task {
    pub id: i64,
    pub code: String,
    pub name: String,
    pub reward_cny: i32,
    pub reward_token: String,
    pub description: String,
    pub created_at: DateTime<Utc>,
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