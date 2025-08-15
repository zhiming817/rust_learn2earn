use actix_web::web;
use crate::controllers::task_submission_controller;

pub fn configure_task_submission_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .route("/tasks/{task_id}/submissions", web::get().to(task_submission_controller::get_submissions_by_task_id))
            .route("/submissions/{id}", web::get().to(task_submission_controller::get_submission_by_id))
    );
}