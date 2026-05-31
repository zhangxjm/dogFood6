package model

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Username     string    `gorm:"size:50;unique;not null" json:"username"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         string    `gorm:"size:20;not null;default:'engineer'" json:"role"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	Email        string    `gorm:"size:100" json:"email"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"createdAt"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string    `json:"token"`
	User  *UserInfo `json:"user"`
}

type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Name     string `json:"name"`
}

type Claims struct {
	UserID   uint   `json:"userId"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

var _ = jwt.SigningMethodHS256
