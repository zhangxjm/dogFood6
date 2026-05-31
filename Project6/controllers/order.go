package controllers

import (
	"farmhouse-order-system/models"
	"encoding/json"
	"fmt"
	"time"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type OrderController struct {
	beego.Controller
}

type OrderItemInput struct {
	DishId   int `json:"dish_id"`
	Quantity int `json:"quantity"`
}

type OrderInput struct {
	TableId int              `json:"table_id"`
	Items   []OrderItemInput `json:"items"`
	Remark  string           `json:"remark"`
}

func (c *OrderController) List() {
	o := orm.NewOrm()
	var orders []models.Order
	o.QueryTable("order_info").OrderBy("-id").All(&orders)

	for i := range orders {
		var table models.Table
		o.QueryTable("dining_table").Filter("id", orders[i].TableId).One(&table)
		orders[i].TableNumber = table.Number

		var items []models.OrderItem
		o.QueryTable("order_item").Filter("order_id", orders[i].Id).All(&items)
		orders[i].Items = items
	}

	c.Data["json"] = orders
	c.ServeJSON()
}

func (c *OrderController) Get() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	var order models.Order
	err := o.QueryTable("order_info").Filter("id", id).One(&order)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "订单不存在"}
		c.ServeJSON()
		return
	}

	var table models.Table
	o.QueryTable("dining_table").Filter("id", order.TableId).One(&table)
	order.TableNumber = table.Number

	var items []models.OrderItem
	o.QueryTable("order_item").Filter("order_id", order.Id).All(&items)
	order.Items = items

	c.Data["json"] = order
	c.ServeJSON()
}

func (c *OrderController) GetByTable() {
	tableId, _ := c.GetInt(":table_id")
	o := orm.NewOrm()
	var orders []models.Order
	o.QueryTable("order_info").Filter("table_id", tableId).OrderBy("-id").All(&orders)

	for i := range orders {
		var table models.Table
		o.QueryTable("dining_table").Filter("id", orders[i].TableId).One(&table)
		orders[i].TableNumber = table.Number

		var items []models.OrderItem
		o.QueryTable("order_item").Filter("order_id", orders[i].Id).All(&items)
		orders[i].Items = items
	}

	c.Data["json"] = orders
	c.ServeJSON()
}

func (c *OrderController) Add() {
	var input OrderInput
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &input); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "参数错误"}
		c.ServeJSON()
		return
	}

	if input.TableId <= 0 || len(input.Items) == 0 {
		c.Data["json"] = map[string]interface{}{"error": "桌台和菜品不能为空"}
		c.ServeJSON()
		return
	}

	o := orm.NewOrm()

	var table models.Table
	if err := o.QueryTable("dining_table").Filter("id", input.TableId).One(&table); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "桌台不存在"}
		c.ServeJSON()
		return
	}

	now := time.Now()
	orderNo := fmt.Sprintf("NO%04d%02d%02d%04d", now.Year(), now.Month(), now.Day(), now.Unix()%10000)

	order := models.Order{
		TableId: input.TableId,
		OrderNo: orderNo,
		Status:  "待上菜",
		Remark:  input.Remark,
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range input.Items {
		var dish models.Dish
		if err := o.QueryTable("dish").Filter("id", item.DishId).One(&dish); err != nil {
			c.Data["json"] = map[string]interface{}{"error": "菜品不存在"}
			c.ServeJSON()
			return
		}

		subtotal := dish.Price * float64(item.Quantity)
		totalAmount += subtotal

		orderItems = append(orderItems, models.OrderItem{
			DishId:   item.DishId,
			DishName: dish.Name,
			Price:    dish.Price,
			Quantity: item.Quantity,
			Subtotal: subtotal,
			Status:   "待出餐",
		})
	}

	order.TotalAmount = totalAmount

	_ = o.Begin()

	orderId, err := o.Insert(&order)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "创建订单失败"}
		c.ServeJSON()
		return
	}

	for i := range orderItems {
		orderItems[i].OrderId = int(orderId)
		_, err := o.Insert(&orderItems[i])
		if err != nil {
			c.Data["json"] = map[string]interface{}{"error": "添加订单明细失败"}
			c.ServeJSON()
			return
		}
	}

	table.Status = "使用中"
	o.Update(&table, "status")

	c.Data["json"] = map[string]interface{}{"id": orderId, "order_no": orderNo, "message": "下单成功"}
	c.ServeJSON()
}

func (c *OrderController) Update() {
	id, _ := c.GetInt(":id")
	var order models.Order
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &order); err != nil {
		c.Data["json"] = map[string]interface{}{"error": "参数错误"}
		c.ServeJSON()
		return
	}

	order.Id = id
	o := orm.NewOrm()
	_, err := o.Update(&order, "status", "remark")
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "更新失败"}
		c.ServeJSON()
		return
	}

	if order.Status == "已结账" {
		var o_ models.Order
		o.QueryTable("order_info").Filter("id", id).One(&o_)
		var table models.Table
		o.QueryTable("dining_table").Filter("id", o_.TableId).One(&table)
		table.Status = "空闲"
		o.Update(&table, "status")
	}

	c.Data["json"] = map[string]interface{}{"message": "更新成功"}
	c.ServeJSON()
}

func (c *OrderController) Delete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()
	_, err := o.Delete(&models.Order{Id: id})
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "删除失败"}
		c.ServeJSON()
		return
	}
	c.Data["json"] = map[string]interface{}{"message": "删除成功"}
	c.ServeJSON()
}
