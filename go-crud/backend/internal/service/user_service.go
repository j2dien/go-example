package service

import (
	"context"
	"errors"
	"go-crud-api/internal/dto"
	"go-crud-api/internal/repository"
	"go-crud-api/pkg/response"
)

type UserService interface {
	GetByID(ctx context.Context, id string) (*dto.UserResponse, error)
	GetAll(ctx context.Context, param dto.PaginationParam) ([]dto.UserResponse, response.Meta, error)
	Update(ctx context.Context, id string, req dto.UpdateUserRequest) (*dto.UserResponse, error)
	AdminUpdate(ctx context.Context, targetID string, callerID string, callerRole string, req dto.AdminUpdateUserRequest) (*dto.UserResponse, error)
	AdminChangeRole(ctx context.Context, targetID string, callerID string, callerRole string, role string) (*dto.UserResponse, error)
	Delete(ctx context.Context, targetID string, callerID string, callerRole string) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetByID(ctx context.Context, id string) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *userService) GetAll(ctx context.Context, param dto.PaginationParam) ([]dto.UserResponse, response.Meta, error) {
	if param.Page < 1 {
		param.Page = 1
	}
	if param.Limit < 1 || param.Limit > 100 {
		param.Limit = 10
	}

	users, total, err := s.userRepo.FindAll(ctx, param.Page, param.Limit, param.Query)
	if err != nil {
		return nil, response.Meta{}, err
	}

	var responses []dto.UserResponse
	for _, user := range users {
		responses = append(responses, dto.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	totalPage := int(total) / param.Limit
	if int(total)%param.Limit != 0 {
		totalPage++
	}

	meta := response.Meta{
		Page:      param.Page,
		Limit:     param.Limit,
		Total:     total,
		TotalPage: totalPage,
	}

	return responses, meta, nil
}

func (s *userService) Update(ctx context.Context, id string, req dto.UpdateUserRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" && req.Email != user.Email {
		existing, _ := s.userRepo.FindByEmail(ctx, req.Email)
		if existing != nil {
			return nil, errors.New("email already in use")
		}
		user.Email = req.Email
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *userService) AdminUpdate(ctx context.Context, targetID string, callerID string, callerRole string, req dto.AdminUpdateUserRequest) (*dto.UserResponse, error) {
	targetUser, err := s.userRepo.FindByID(ctx, targetID)
	if err != nil {
		return nil, errors.New("target user not found")
	}

	if targetUser.Role == "superadmin" && callerRole != "superadmin" {
		return nil, errors.New("forbidden: cannot modify superadmin user")
	}

	if req.Name != "" {
		targetUser.Name = req.Name
	}
	if req.Email != "" && req.Email != targetUser.Email {
		existing, _ := s.userRepo.FindByEmail(ctx, req.Email)
		if existing != nil {
			return nil, errors.New("email already in use")
		}
		targetUser.Email = req.Email
	}

	if req.Role != "" {
		if (req.Role == "superadmin" || targetUser.Role == "superadmin") && callerRole != "superadmin" {
			return nil, errors.New("forbidden: only superadmin can manage superadmin role")
		}
		targetUser.Role = req.Role
	}

	if err := s.userRepo.Update(ctx, targetUser); err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        targetUser.ID,
		Name:      targetUser.Name,
		Email:     targetUser.Email,
		Role:      targetUser.Role,
		CreatedAt: targetUser.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *userService) AdminChangeRole(ctx context.Context, targetID string, callerID string, callerRole string, newRole string) (*dto.UserResponse, error) {
	targetUser, err := s.userRepo.FindByID(ctx, targetID)
	if err != nil {
		return nil, errors.New("target user not found")
	}

	if targetID == callerID {
		return nil, errors.New("cannot change your own role")
	}

	if callerRole != "superadmin" {
		return nil, errors.New("forbidden: only superadmin can change user roles")
	}

	targetUser.Role = newRole
	if err := s.userRepo.Update(ctx, targetUser); err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        targetUser.ID,
		Name:      targetUser.Name,
		Email:     targetUser.Email,
		Role:      targetUser.Role,
		CreatedAt: targetUser.CreatedAt.Format("2006-01-02 15:04:05"),
	}, nil
}

func (s *userService) Delete(ctx context.Context, targetID string, callerID string, callerRole string) error {
	targetUser, err := s.userRepo.FindByID(ctx, targetID)
	if err != nil {
		return errors.New("user not found")
	}

	if targetID == callerID {
		return errors.New("cannot delete your own account")
	}

	if targetUser.Role == "superadmin" {
		return errors.New("cannot delete superadmin account")
	}

	if callerRole != "superadmin" && callerRole != "admin" {
		return errors.New("forbidden: insufficient permissions to delete user")
	}

	return s.userRepo.Delete(ctx, targetID)
}
