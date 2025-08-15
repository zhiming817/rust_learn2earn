use sqlx::{MySqlPool, Row};
use crate::models::task::{Task, CreateTaskRequest, UpdateTaskRequest, TaskQuery, TaskListResponse, PaginationInfo};

pub struct TaskService;

impl TaskService {
    pub async fn get_tasks_with_pagination(pool: &MySqlPool, query: TaskQuery) -> Result<TaskListResponse, sqlx::Error> {
        let page = query.page();
        let page_size = query.page_size();
        let offset = query.offset();
        
        // 构建查询条件
        let mut where_clause = String::new();
        let mut count_where_clause = String::new();
        let mut params = Vec::new();
        
        if let Some(search) = &query.search {
            if !search.trim().is_empty() {
                where_clause = " WHERE name LIKE ? OR code LIKE ? OR description LIKE ?".to_string();
                count_where_clause = where_clause.clone();
                let search_param = format!("%{}%", search.trim());
                params = vec![search_param.clone(), search_param.clone(), search_param];
            }
        }
        
        // 获取总数
        let count_query = format!("SELECT COUNT(*) as total FROM task{}", count_where_clause);
        let mut count_sql = sqlx::query(&count_query);
        for param in &params {
            count_sql = count_sql.bind(param);
        }
        let count_row = count_sql.fetch_one(pool).await?;
        let total: u32 = count_row.get::<i64, _>("total") as u32;
        
        // 获取分页数据
        let data_query = format!(
            "SELECT id, code, name, reward_cny, reward_token, description, created_at, updated_at FROM task{} ORDER BY created_at DESC LIMIT ? OFFSET ?", 
            where_clause
        );
        let mut data_sql = sqlx::query(&data_query);
        for param in &params {
            data_sql = data_sql.bind(param);
        }
        data_sql = data_sql.bind(page_size).bind(offset);
        
        let rows = data_sql.fetch_all(pool).await?;
        
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

        let total_pages = (total + page_size - 1) / page_size;

        Ok(TaskListResponse {
            data: tasks,
            pagination: PaginationInfo {
                page,
                page_size,
                total,
                total_pages,
            },
        })
    }

    pub async fn get_all_tasks(pool: &MySqlPool) -> Result<Vec<Task>, sqlx::Error> {
        let rows = sqlx::query("SELECT id, code, name, reward_cny, reward_token, description, created_at, updated_at FROM task ORDER BY created_at DESC")
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