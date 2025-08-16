use actix_web::web;
use crate::controllers::auth_controller;
use crate::middleware::auth::RequireRole;

pub fn configure_auth_routes(cfg: &mut web::ServiceConfig) {
    println!("configure_auth_routes");
    cfg.service(
        web::scope("/api/auth")
            .route("/login", web::post().to(auth_controller::login))
    );
}

pub fn configure_protected_auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/profile", web::get().to(auth_controller::get_profile))
            .route("/roles", web::get().to(auth_controller::get_roles))
            .route("/permissions", web::get().to(auth_controller::get_permissions))
            .service(
                web::scope("/admin")
                    .wrap(RequireRole::new("admin"))
                    .route("/users", web::post().to(auth_controller::create_user))
            )
    );
}