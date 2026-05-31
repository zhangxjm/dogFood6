package service

import (
	"errors"
	"iiot-predictive-maintenance/internal/config"
	"iiot-predictive-maintenance/internal/model"
	"iiot-predictive-maintenance/internal/pkg/database"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Login(req *model.LoginRequest) (*model.LoginResponse, error) {
	var user model.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	token, err := s.generateToken(&user)
	if err != nil {
		return nil, err
	}

	return &model.LoginResponse{
		Token: token,
		User: &model.UserInfo{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role,
			Name:     user.Name,
		},
	}, nil
}

func (s *AuthService) generateToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"userId":   user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * time.Duration(config.AppConfig.JWT.ExpireHours)).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWT.Secret))
}

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *AuthService) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	err := database.DB.First(&user, id).Error
	return &user, err
}

func (s *AuthService) ListUsers() ([]model.User, error) {
	var users []model.User
	err := database.DB.Find(&users).Error
	return users, err
}
