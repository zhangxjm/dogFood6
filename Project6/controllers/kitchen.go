package controllers

import (
	"farmhouse-order-system/models"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/orm"
)

type KitchenController struct {
	beego.Controller
}

func (c *KitchenController) List() {
	o := orm.NewOrm()
	var items []models.OrderItem
	o.QueryTable("order_item").Filter("status__in", "待出餐", "制作中").OrderBy("create_at").All(&items)

	var result []map[string]interface{}
	for _, item := range items {
		var order models.Order
		o.QueryTable("order_info").Filter("id", item.OrderId).One(&order)

		var table models.Table
		o.QueryTable("dining_table").Filter("id", order.TableId).One(&table)

		result = append(result, map[string]interface{}{
			"id":           item.Id,
			"order_id":     item.OrderId,
			"order_no":     order.OrderNo,
			"table_number": table.Number,
			"dish_name":    item.DishName,
			"quantity":     item.Quantity,
			"status":       item.Status,
			"create_at":    item.CreateAt,
		})
	}

	c.Data["json"] = result
	c.ServeJSON()
}

func (c *KitchenController) Complete() {
	id, _ := c.GetInt(":id")
	o := orm.NewOrm()

	var item models.OrderItem
	err := o.QueryTable("order_item").Filter("id", id).One(&item)
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "订单明细不存在"}
		c.ServeJSON()
		return
	}

	item.Status = "已出餐"
	_, err = o.Update(&item, "status")
	if err != nil {
		c.Data["json"] = map[string]interface{}{"error": "更新失败"}
		c.ServeJSON()
		return
	}

	var pendingCount int64
	o.QueryTable("order_item").Filter("order_id", item.OrderId).Filter("status__in", "待出餐", "制作中").Count(&pendingCount)

	if pendingCount == 0 {
		var order models.Order
		o.QueryTable("order_info").Filter("id", item.OrderId).One(&order)
		order.Status = "待结账"
		o.Update(&order, "status")
	}

	c.Data["json"] = map[string]interface{}{"message": "出餐完成"}
	c.ServeJSON()
}
