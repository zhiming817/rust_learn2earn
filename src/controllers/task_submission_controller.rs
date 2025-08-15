use actix_web::{web, HttpResponse, Result};
use sqlx::MySqlPool;
use crate::models::task_submission::TaskSubmissionQuery;
use crate::services::task_submission_service::TaskSubmissionService;

pub async fn get_submissions_by_task_id(
    path: web::Path<i64>,
    query: web::Query<TaskSubmissionQuery>,
    pool: web::Data<MySqlPool>
) -> Result<HttpResponse> {
    let task_id = path.into_inner();
    
    match TaskSubmissionService::get_submissions_by_task_id(
        pool.get_ref(), 
        task_id, 
        query.into_inner()
    ).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}

pub async fn get_submission_by_id(
    path: web::Path<i64>, 
    pool: web::Data<MySqlPool>
) -> Result<HttpResponse> {
    let id = path.into_inner();
    
    match TaskSubmissionService::get_submission_by_id(pool.get_ref(), id).await {
        Ok(Some(submission)) => Ok(HttpResponse::Ok().json(submission)),
        Ok(None) => Ok(HttpResponse::NotFound().json("Task submission not found")),
        Err(e) => {
            eprintln!("Database error: {}", e);
            Ok(HttpResponse::InternalServerError().json("Database error"))
        }
    }
}