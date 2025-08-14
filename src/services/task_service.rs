use sqlx::{MySqlPool, Row};
use crate::models::task::{Task, CreateTaskRequest, UpdateTaskRequest};

pub struct TaskService;

impl TaskService {
    pub async fn get_all_tasks(pool: &MySqlPool) -> Result<Vec<Task>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, code, name, reward_cny, reward_token, description, created_at, updated_at FROM task")
            .fetch_all(pool)
            .await?;

        let tasks: Vec<Task> = rows.into_iter().map(|row| Task {
            id: row.get("id"),
            code: row.get("code"),
            name: row.get("name"),
            reward_cny: row.get("reward_cny"),
            reward_token: row.get("reward_token"),
            description: row.get("description"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }).collect();

        Ok(tasks)
    }

    pub async fn get_task_by_id(pool: &MySqlPool, id: i64) -> Result<Option<Task>, sqlx::Error> {
        let row = sqlx::query("SELECT id, code, name, reward_cny, reward_token, description, created_at, updated_at FROM task WHERE id = ?")
            .bind(id)
            .fetch_optional(pool)
            .await?;

        match row {
            Some(row) => Ok(Some(Task {
                id: row.get("id"),
                code: row.get("code"),
                name: row.get("name"),
                reward_cny: row.get("reward_cny"),
                reward_token: row.get("reward_token"),
                description: row.get("description"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            })),
            None => Ok(None),
        }
    }

    pub async fn create_task(pool: &MySqlPool, task: CreateTaskRequest) -> Result<i64, sqlx::Error> {
        let result = sqlx::query("INSERT INTO task (code, name, reward_cny, reward_token, description) VALUES (?, ?, ?, ?, ?)")
            .bind(&task.code)
            .bind(&task.name)
            .bind(task.reward_cny)
            .bind(&task.reward_token)
            .bind(&task.description)
            .execute(pool)
            .await?;

        Ok(result.last_insert_id() as i64)
    }

    pub async fn update_task(pool: &MySqlPool, id: i64, task: UpdateTaskRequest) -> Result<bool, sqlx::Error> {
        let mut query = String::from("UPDATE task SET ");
        let mut params = Vec::new();
        let mut updates = Vec::new();

        if let Some(name) = &task.name {
            updates.push("name = ?");
            params.push(name.clone());
        }
        if let Some(reward_cny) = task.reward_cny {
            updates.push("reward_cny = ?");
            params.push(reward_cny.to_string());
        }
        if let Some(reward_token) = &task.reward_token {
            updates.push("reward_token = ?");
            params.push(reward_token.clone());
        }
        if let Some(description) = &task.description {
            updates.push("description = ?");
            params.push(description.clone());
        }

        if updates.is_empty() {
            return Ok(false);
        }

        query.push_str(&updates.join(", "));
        query.push_str(", updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        params.push(id.to_string());

        let mut sql_query = sqlx::query(&query);
        for param in params {
            sql_query = sql_query.bind(param);
        }

        let result = sql_query.execute(pool).await?;
        Ok(result.rows_affected() > 0)
    }

    pub async fn delete_task(pool: &MySqlPool, id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM task WHERE id = ?")
            .bind(id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}