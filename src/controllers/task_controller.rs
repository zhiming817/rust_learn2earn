use actix_web::{web, HttpResponse, Result};
use sqlx::MySqlPool;
use crate::models::task::{CreateTaskRequest, UpdateTaskRequest};
use crate::services::task_service::TaskService;

pub async fn get_all_tasks(pool: web::Data<MySqlPool>) -> Result<HttpResponse> {
    match TaskService::get_all_tasks(pool.get_ref()).await {
        Ok(tasks) => Ok(HttpResponse::Ok().json(tasks)),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

pub async fn get_task_by_id(path: web::Path<i64>, pool: web::Data<MySqlPool>) -> Result<HttpResponse> {
    let id = path.into_inner();
    
    match TaskService::get_task_by_id(pool.get_ref(), id).await {
        Ok(Some(task)) => Ok(HttpResponse::Ok().json(task)),
        Ok(None) => Ok(HttpResponse::NotFound().json("Task not found")),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

pub async fn create_task(
    task: web::Json<CreateTaskRequest>,
    pool: web::Data<MySqlPool>
) -> Result<HttpResponse> {
    match TaskService::create_task(pool.get_ref(), task.into_inner()).await {
        Ok(id) => Ok(HttpResponse::Created().json(serde_json::json!({"id": id}))),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

pub async fn update_task(
    path: web::Path<i64>,
    task: web::Json<UpdateTaskRequest>,
    pool: web::Data<MySqlPool>
) -> Result<HttpResponse> {
    let id = path.into_inner();
    
    match TaskService::update_task(pool.get_ref(), id, task.into_inner()).await {
        Ok(true) => Ok(HttpResponse::Ok().json("Task updated successfully")),
        Ok(false) => Ok(HttpResponse::NotFound().json("Task not found or no changes made")),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

pub async fn delete_task(path: web::Path<i64>, pool: web::Data<MySqlPool>) -> Result<HttpResponse> {
    let id = path.into_inner();
    
    match TaskService::delete_task(pool.get_ref(), id).await {
        Ok(true) => Ok(HttpResponse::Ok().json("Task deleted successfully")),
        Ok(false) => Ok(HttpResponse::NotFound().json("Task not found")),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}