package repository

import (
	"context"
	"go-crud-api/internal/model"

	"gorm.io/gorm"
)

type PostRepository interface {
	Create(ctx context.Context, post *model.Post) error
	FindByID(ctx context.Context, id string) (*model.Post, error)
	FindAll(ctx context.Context, page, limit int, search string) ([]model.Post, int64, error)
	FindByUserID(ctx context.Context, userID string, page, limit int) ([]model.Post, int64, error)
	Update(ctx context.Context, post *model.Post) error
	Delete(ctx context.Context, id string) error
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) Create(ctx context.Context, post *model.Post) error {
	return r.db.WithContext(ctx).Create(post).Error
}

func (r *postRepository) FindByID(ctx context.Context, id string) (*model.Post, error) {
	var post model.Post
	err := r.db.WithContext(ctx).Preload("User").First(&post, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *postRepository) FindAll(ctx context.Context, page, limit int, search string) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Post{}).Preload("User")
	if search != "" {
		query = query.Where("title ILIKE ? OR content ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at desc").Find(&posts).Error
	return posts, total, err
}

func (r *postRepository) FindByUserID(ctx context.Context, userID string, page, limit int) ([]model.Post, int64, error) {
	var posts []model.Post
	var total int64

	query := r.db.WithContext(ctx).Model(&model.Post{}).Where("user_id = ?", userID).Preload("User")

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at desc").Find(&posts).Error
	return posts, total, err
}

func (r *postRepository) Update(ctx context.Context, post *model.Post) error {
	return r.db.WithContext(ctx).Save(post).Error
}

func (r *postRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.Post{}, "id = ?", id).Error
}
