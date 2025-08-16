use actix_web::web;
use crate::controllers::{task_controller, task_submission_controller};

pub fn configure_task_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/tasks")
            .route("", web::get().to(task_controller::get_tasks))  // 支持分页的新接口
            .route("/all", web::get().to(task_controller::get_all_tasks))  // 原来的获取所有接口
            .route("", web::post().to(task_controller::create_task))
            .route("/{id}", web::get().to(task_controller::get_task_by_id))
            .route("/{id}", web::put().to(task_controller::update_task))
            .route("/{id}", web::delete().to(task_controller::delete_task))
            // 添加task_submission相关路由
            .route("/{task_id}/submissions", web::get().to(task_submission_controller::get_submissions_by_task_id))
    );
    
    // 单独的submissions路由
    cfg.service(
        web::scope("/submissions")
            .route("/{id}", web::get().to(task_submission_controller::get_submission_by_id))
            .route("/{id}/approve", web::post().to(task_submission_controller::approve_submission))
            .route("/{id}/reject", web::post().to(task_submission_controller::reject_submission))
    );
}