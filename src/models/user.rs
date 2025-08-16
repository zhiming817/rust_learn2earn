use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SysUser {
    pub id: i64,
    pub username: String,
    pub password_hash: String,
    pub salt: String,
    pub status: i8,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SysRole {
    pub id: i64,
    pub role_key: String,
    pub role_name: String,
    pub status: i8,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SysPermission {
    pub id: i64,
    pub perm_key: String,
    pub perm_name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserWithRoles {
    pub id: i64,
    pub username: String,
    pub status: i8,
    pub roles: Vec<String>,
    pub permissions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: UserResponse,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    pub id: i64,
    pub username: String,
    pub roles: Vec<String>,
    pub permissions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub username: String,
    pub password: String,
    pub role_ids: Vec<i64>,
}