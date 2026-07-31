package service

import (
	"context"
	"errors"
	"go-crud-api/internal/dto"
	"go-crud-api/internal/model"
	"go-crud-api/internal/repository"
	"go-crud-api/pkg/response"
)

type PostService interface {
	Create(ctx context.Context, userID string, req dto.CreatePostRequest) (*dto.PostResponse, error)
	GetByID(ctx context.Context, id string) (*dto.PostResponse, error)
	GetAll(ctx context.Context, param dto.PaginationParam) ([]dto.PostResponse, response.Meta, error)
	Update(ctx context.Context, id string, userID string, userRole string, req dto.UpdatePostRequest) (*dto.PostResponse, error)
	Delete(ctx context.Context, id string, userID string, userRole string) error
}

type postService struct {
	postRepo repository.PostRepository
	userRepo repository.UserRepository
}

func NewPostService(postRepo repository.PostRepository, userRepo repository.UserRepository) PostService {
	return &postService{
		postRepo: postRepo,
		userRepo: userRepo,
	}
}

func (s *postService) Create(ctx context.Context, userID string, req dto.CreatePostRequest) (*dto.PostResponse, error) {
	status := req.Status
	if status == "" {
		status = "draft"
	}

	post := &model.Post{
		Title:   req.Title,
		Content: req.Content,
		Status:  status,
		UserID:  userID,
	}

	if err := s.postRepo.Create(ctx, post); err != nil {
		return nil, err
	}

	fetchedPost, err := s.postRepo.FindByID(ctx, post.ID)
	if err != nil {
		return nil, err
	}

	return s.toPostResponse(fetchedPost), nil
}

func (s *postService) GetByID(ctx context.Context, id string) (*dto.PostResponse, error) {
	post, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("post not found")
	}

	return s.toPostResponse(post), nil
}

func (s *postService) GetAll(ctx context.Context, param dto.PaginationParam) ([]dto.PostResponse, response.Meta, error) {
	if param.Page < 1 {
		param.Page = 1
	}
	if param.Limit < 1 || param.Limit > 100 {
		param.Limit = 10
	}

	posts, total, err := s.postRepo.FindAll(ctx, param.Page, param.Limit, param.Query)
	if err != nil {
		return nil, response.Meta{}, err
	}

	var responses []dto.PostResponse
	for _, post := range posts {
		responses = append(responses, *s.toPostResponse(&post))
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

func (s *postService) Update(ctx context.Context, id string, userID string, userRole string, req dto.UpdatePostRequest) (*dto.PostResponse, error) {
	post, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("post not found")
	}

	// Superadmin can edit any post, normal user/admin can only edit their own post
	if post.UserID != userID && userRole != "superadmin" {
		return nil, errors.New("forbidden: you do not own this post")
	}

	if req.Title != "" {
		post.Title = req.Title
	}
	if req.Content != "" {
		post.Content = req.Content
	}
	if req.Status != "" {
		post.Status = req.Status
	}

	if err := s.postRepo.Update(ctx, post); err != nil {
		return nil, err
	}

	updatedPost, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.toPostResponse(updatedPost), nil
}

func (s *postService) Delete(ctx context.Context, id string, userID string, userRole string) error {
	post, err := s.postRepo.FindByID(ctx, id)
	if err != nil {
		return errors.New("post not found")
	}

	// Superadmin and Admin can delete any post, normal user can only delete their own post
	if post.UserID != userID && userRole != "superadmin" && userRole != "admin" {
		return errors.New("forbidden: you do not own this post")
	}

	return s.postRepo.Delete(ctx, id)
}

func (s *postService) toPostResponse(post *model.Post) *dto.PostResponse {
	resp := &dto.PostResponse{
		ID:        post.ID,
		Title:     post.Title,
		Content:   post.Content,
		Status:    post.Status,
		UserID:    post.UserID,
		CreatedAt: post.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt: post.UpdatedAt.Format("2006-01-02 15:04:05"),
	}

	if post.User != nil {
		resp.Author = &dto.UserResponse{
			ID:        post.User.ID,
			Name:      post.User.Name,
			Email:     post.User.Email,
			Role:      post.User.Role,
			CreatedAt: post.User.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return resp
}
