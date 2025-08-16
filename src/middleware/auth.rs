use actix_web::{dev::ServiceRequest, Error, HttpMessage, HttpResponse};
use actix_web::body::{BoxBody, MessageBody};
use actix_web::dev::{forward_ready, Service, ServiceResponse, Transform};
use actix_web::http::StatusCode;
use futures_util::future::{ok, Ready};
use std::future::{ready, Future};
use std::pin::Pin;
use crate::utils::jwt::Claims;

pub struct RequireRole {
    required_role: String,
}

impl RequireRole {
    pub fn new(role: &str) -> Self {
        RequireRole {
            required_role: role.to_string(),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RequireRole
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type InitError = ();
    type Transform = RequireRoleMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(RequireRoleMiddleware {
            service,
            required_role: self.required_role.clone(),
        })
    }
}

pub struct RequireRoleMiddleware<S> {
    service: S,
    required_role: String,
}

impl<S, B> Service<ServiceRequest> for RequireRoleMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: MessageBody + 'static,
{
    type Response = ServiceResponse<BoxBody>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let required_role = self.required_role.clone();

        // 从请求扩展中获取用户声明
        let user_role = req
            .extensions()
            .get::<Claims>()
            .map(|c| c.role.clone());

        match user_role {
            Some(role) if role == required_role || role == "admin" => {
                let fut = self.service.call(req);
                Box::pin(async move {
                    let res = fut.await?;
                    Ok(res.map_into_boxed_body())
                })
            }
            Some(_) => {
                let (req, _) = req.into_parts();
                Box::pin(async move {
                    let response = HttpResponse::Forbidden()
                        .json(serde_json::json!({"error": "Insufficient permissions"}))
                        .map_into_boxed_body();
                    Ok(ServiceResponse::new(req, response))
                })
            }
            None => {
                let (req, _) = req.into_parts();
                Box::pin(async move {
                    let response = HttpResponse::Unauthorized()
                        .json(serde_json::json!({"error": "Authentication required"}))
                        .map_into_boxed_body();
                    Ok(ServiceResponse::new(req, response))
                })
            }
        }
    }
}