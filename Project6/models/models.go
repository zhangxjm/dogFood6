package models

import (
	"time"

	"github.com/astaxie/beego/orm"
)

type User struct {
	Id       int       `orm:"pk;auto;column(id)" json:"id"`
	Username string    `orm:"size(50);unique;column(username)" json:"username"`
	Password string    `orm:"size(100);column(password)" json:"-"`
	Role     string    `orm:"size(20);column(role)" json:"role"`
	CreateAt time.Time `orm:"auto_now_add;type(datetime);column(create_at)" json:"create_at"`
}

func (u *User) TableName() string {
	return "user"
}

type Dish struct {
	Id          int       `orm:"pk;auto;column(id)" json:"id"`
	Name        string    `orm:"size(100);column(name)" json:"name"`
	Description string    `orm:"size(500);column(description)" json:"description"`
	Price       float64   `orm:"digits(10);decimals(2);column(price)" json:"price"`
	Category    string    `orm:"size(50);column(category)" json:"category"`
	Image       string    `orm:"size(255);column(image);null" json:"image"`
	Status      int       `orm:"column(status);default(1)" json:"status"`
	CreateAt    time.Time `orm:"auto_now_add;type(datetime);column(create_at)" json:"create_at"`
	UpdateAt    time.Time `orm:"auto_now;type(datetime);column(update_at)" json:"update_at"`
}

func (d *Dish) TableName() string {
	return "dish"
}

type Table struct {
	Id       int       `orm:"pk;auto;column(id)" json:"id"`
	Number   string    `orm:"size(20);unique;column(number)" json:"number"`
	Seats    int       `orm:"column(seats)" json:"seats"`
	Status   string    `orm:"size(20);column(status);default(空闲)" json:"status"`
	CreateAt time.Time `orm:"auto_now_add;type(datetime);column(create_at)" json:"create_at"`
}

func (t *Table) TableName() string {
	return "dining_table"
}

type Order struct {
	Id          int       `orm:"pk;auto;column(id)" json:"id"`
	TableId     int       `orm:"column(table_id)" json:"table_id"`
	TableNumber string    `orm:"-" json:"table_number"`
	OrderNo     string    `orm:"size(50);unique;column(order_no)" json:"order_no"`
	Status      string    `orm:"size(20);column(status);default(待上菜)" json:"status"`
	TotalAmount float64   `orm:"digits(12);decimals(2);column(total_amount);default(0)" json:"total_amount"`
	Remark      string    `orm:"size(500);column(remark);null" json:"remark"`
	CreateAt    time.Time `orm:"auto_now_add;type(datetime);column(create_at)" json:"create_at"`
	UpdateAt    time.Time `orm:"auto_now;type(datetime);column(update_at)" json:"update_at"`
	Items       []OrderItem `orm:"-" json:"items"`
}

func (o *Order) TableName() string {
	return "order_info"
}

type OrderItem struct {
	Id         int       `orm:"pk;auto;column(id)" json:"id"`
	OrderId    int       `orm:"column(order_id)" json:"order_id"`
	DishId     int       `orm:"column(dish_id)" json:"dish_id"`
	DishName   string    `orm:"size(100);column(dish_name)" json:"dish_name"`
	Price      float64   `orm:"digits(10);decimals(2);column(price)" json:"price"`
	Quantity   int       `orm:"column(quantity)" json:"quantity"`
	Subtotal   float64   `orm:"digits(12);decimals(2);column(subtotal)" json:"subtotal"`
	Status     string    `orm:"size(20);column(status);default(待出餐)" json:"status"`
	CreateAt   time.Time `orm:"auto_now_add;type(datetime);column(create_at)" json:"create_at"`
}

func (oi *OrderItem) TableName() string {
	return "order_item"
}

type KitchenOrder struct {
	Id          int       `json:"id"`
	OrderId     int       `json:"order_id"`
	OrderNo     string    `json:"order_no"`
	TableNumber string    `json:"table_number"`
	DishName    string    `json:"dish_name"`
	Quantity    int       `json:"quantity"`
	Status      string    `json:"status"`
	CreateAt    time.Time `json:"create_at"`
}

func init() {
	orm.RegisterModel(new(User), new(Dish), new(Table), new(Order), new(OrderItem))
}
