package models

import (
	"fmt"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

func InitDatabase() {
	o := orm.NewOrm()
	_ = o

	err := orm.RunSyncdb("default", false, func(sql string, args ...interface{}) {
		beego.Info(fmt.Sprintf("SQL: %s", sql))
	})
	if err != nil {
		beego.Error("数据库同步失败:", err)
	}

	initDefaultData()
}

func initDefaultData() {
	o := orm.NewOrm()

	var userCount int64
	o.QueryTable("user").Count(&userCount)
	if userCount == 0 {
		users := []User{
			{Username: "admin", Password: "123456", Role: "管理员"},
			{Username: "chef", Password: "123456", Role: "厨师"},
			{Username: "waiter", Password: "123456", Role: "服务员"},
		}
		for _, u := range users {
			o.Insert(&u)
		}
		beego.Info("默认用户数据初始化完成")
	}

	var dishCount int64
	o.QueryTable("dish").Count(&dishCount)
	if dishCount == 0 {
		dishes := []Dish{
			{Name: "农家红烧肉", Description: "选用农家散养黑猪肉，肥而不腻，入口即化", Price: 58.00, Category: "肉类", Status: 1},
			{Name: "土鸡汤", Description: "散养土鸡慢炖4小时，汤鲜味美", Price: 88.00, Category: "汤类", Status: 1},
			{Name: "清炒时蔬", Description: "新鲜有机蔬菜，健康美味", Price: 28.00, Category: "蔬菜", Status: 1},
			{Name: "农家小炒肉", Description: "土猪五花肉配青椒，香辣可口", Price: 48.00, Category: "肉类", Status: 1},
			{Name: "清蒸鲈鱼", Description: "新鲜鲈鱼，原汁原味", Price: 68.00, Category: "水产", Status: 1},
			{Name: "番茄鸡蛋汤", Description: "家常口味，开胃解渴", Price: 18.00, Category: "汤类", Status: 1},
			{Name: "凉拌黄瓜", Description: "清脆爽口，开胃小菜", Price: 16.00, Category: "凉菜", Status: 1},
			{Name: "梅菜扣肉", Description: "传统工艺，肥而不腻", Price: 58.00, Category: "肉类", Status: 1},
		}
		for _, d := range dishes {
			o.Insert(&d)
		}
		beego.Info("默认菜品数据初始化完成")
	}

	var tableCount int64
	o.QueryTable("dining_table").Count(&tableCount)
	if tableCount == 0 {
		tables := []Table{
			{Number: "A1", Seats: 4, Status: "空闲"},
			{Number: "A2", Seats: 4, Status: "空闲"},
			{Number: "A3", Seats: 6, Status: "空闲"},
			{Number: "B1", Seats: 8, Status: "空闲"},
			{Number: "B2", Seats: 8, Status: "空闲"},
			{Number: "C1", Seats: 10, Status: "空闲"},
			{Number: "C2", Seats: 12, Status: "空闲"},
		}
		for _, t := range tables {
			o.Insert(&t)
		}
		beego.Info("默认桌台数据初始化完成")
	}

	var orderCount int64
	o.QueryTable("order_info").Count(&orderCount)
	if orderCount == 0 {
		now := time.Now()
		demoOrders := []Order{
			{TableId: 1, OrderNo: fmt.Sprintf("NO%04d%02d%02d001", now.Year(), now.Month(), now.Day()), Status: "已结账", TotalAmount: 144.00, CreateAt: now},
			{TableId: 2, OrderNo: fmt.Sprintf("NO%04d%02d%02d002", now.Year(), now.Month(), now.Day()), Status: "已结账", TotalAmount: 102.00, CreateAt: now},
		}
		for _, o_ := range demoOrders {
			o.Insert(&o_)
		}

		demoOrderItems := []OrderItem{
			{OrderId: 1, DishId: 1, DishName: "农家红烧肉", Price: 58.00, Quantity: 1, Subtotal: 58.00, Status: "已出餐"},
			{OrderId: 1, DishId: 3, DishName: "清炒时蔬", Price: 28.00, Quantity: 2, Subtotal: 56.00, Status: "已出餐"},
			{OrderId: 1, DishId: 6, DishName: "番茄鸡蛋汤", Price: 18.00, Quantity: 1, Subtotal: 18.00, Status: "已出餐"},
			{OrderId: 2, DishId: 4, DishName: "农家小炒肉", Price: 48.00, Quantity: 1, Subtotal: 48.00, Status: "已出餐"},
			{OrderId: 2, DishId: 7, DishName: "凉拌黄瓜", Price: 16.00, Quantity: 1, Subtotal: 16.00, Status: "已出餐"},
			{OrderId: 2, DishId: 3, DishName: "清炒时蔬", Price: 28.00, Quantity: 1, Subtotal: 28.00, Status: "已出餐"},
		}
		for _, oi := range demoOrderItems {
			o.Insert(&oi)
		}
		beego.Info("演示订单数据初始化完成")
	}
}
