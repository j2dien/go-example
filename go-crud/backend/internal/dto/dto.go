package dto

type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         UserResponse `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type UserResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

type UpdateUserRequest struct {
	Name  string `json:"name" validate:"omitempty,min=2,max=100"`
	Email string `json:"email" validate:"omitempty,email"`
}

type AdminUpdateUserRequest struct {
	Name  string `json:"name" validate:"omitempty,min=2,max=100"`
	Email string `json:"email" validate:"omitempty,email"`
	Role  string `json:"role" validate:"omitempty,oneof=user admin superadmin"`
}

type AdminChangeRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=user admin superadmin"`
}

type CreatePostRequest struct {
	Title   string `json:"title" validate:"required,min=3,max=200"`
	Content string `json:"content" validate:"required"`
	Status  string `json:"status" validate:"omitempty,oneof=draft published"`
}

type UpdatePostRequest struct {
	Title   string `json:"title" validate:"omitempty,min=3,max=200"`
	Content string `json:"content" validate:"omitempty"`
	Status  string `json:"status" validate:"omitempty,oneof=draft published"`
}

type PostResponse struct {
	ID        string        `json:"id"`
	Title     string        `json:"title"`
	Content   string        `json:"content"`
	Status    string        `json:"status"`
	UserID    string        `json:"user_id"`
	Author    *UserResponse `json:"author,omitempty"`
	CreatedAt string        `json:"created_at"`
	UpdatedAt string        `json:"updated_at"`
}

type PaginationParam struct {
	Page  int    `form:"page,default=1"`
	Limit int    `form:"limit,default=10"`
	Query string `form:"query"`
}
