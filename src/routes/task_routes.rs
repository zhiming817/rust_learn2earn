use actix_web::web;
use crate::controllers::task_controller;

pub fn configure_task_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/tasks")
            .route("", web::get().to(task_controller::get_all_tasks))
            .route("", web::post().to(task_controller::create_task))
            .route("/{id}", web::get().to(task_controller::get_task_by_id))
            .route("/{id}", web::put().to(task_controller::update_task))
            .route("/{id}", web::delete().to(task_controller::delete_task))
    );
}